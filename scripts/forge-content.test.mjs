import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { FORGE_RELEASE_URL } from "../src/components/ForgeRelease.js";

let vite;
let marketing;
let docs;
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const text = (html) => decode(html.replace(/<[^>]*>/g, "").replace(/<!--.*?-->/g, ""));

before(async () => {
  vite = await createServer({
    root: fileURLToPath(new URL("..", import.meta.url)),
    appType: "custom",
    server: { middlewareMode: true },
    logLevel: "error",
  });
  const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
  // Recent Node versions expose a server-side navigator. Exercise the actual
  // unknown-platform fallback explicitly, independently of the test host OS.
  const navigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  try {
    Reflect.deleteProperty(globalThis, "navigator");
    marketing = render("/forge");
    docs = render("/forge/docs");
  } finally {
    if (navigator) Object.defineProperty(globalThis, "navigator", navigator);
  }
});
after(async () => { await vite?.close(); });

test("both pages render the verified release baseline without browser APIs", () => {
  for (const html of [marketing, docs]) {
    assert.match(text(html), /OpenCode 2\.2\.5 (?:·|with) Forge 0\.7\.4/);
    assert.ok(html.includes(`href="${FORGE_RELEASE_URL}"`));
  }
});

test("marketing capabilities link to real docs sections", () => {
  for (const id of ["browser", "context", "workspace-tools", "mcp"]) {
    assert.ok(marketing.includes(`href="/forge/docs#${id}"`));
    assert.ok(docs.includes(`<section id="${id}">`));
  }
  assert.match(text(marketing), /Built-in browser/);
});

test("sidebar anchors all resolve exactly once and retain existing deep links", () => {
  const sidebar = docs.match(/<nav class="docs-sidebar"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(sidebar);
  for (const [, id] of sidebar.matchAll(/href="#([^"]+)"/g)) {
    assert.equal([...docs.matchAll(new RegExp(`<section id="${id}"`, "g"))].length, 1, id);
  }
  for (const id of ["edit-modes", "plan-review", "git", "memory", "whats-new"]) {
    assert.ok(sidebar.includes(`href="#${id}"`));
  }
});

test("approval, mode and storage explanations reflect V2 behavior", () => {
  const content = text(docs);
  assert.match(content, /Accept \(Auto\) in plan review selects Accept edits, not full Auto/);
  assert.match(content, /deny stays denied in every mode/);
  assert.match(content, /Cmd\/Ctrl\+Shift\+\./);
  assert.match(content, /inside the session’s working directory, including outside Git/);
  assert.match(content, /Plan remains restricted to plan files, not memory/);
  for (const stale of ["Shift+Tab", "Outside Git they go in Forge’s data folder", "every write to the memory folder still asks", "The plan agent can too"]) {
    assert.ok(!content.includes(stale), stale);
  }
});

test("configuration examples are valid V2 JSON", () => {
  const examples = [...docs.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(([, code]) => JSON.parse(decode(code)));
  assert.deepEqual(examples.find((item) => item.permissions)?.permissions, [
    { action: "read", resource: "*.env", effect: "allow" },
    { action: "read", resource: "*.env.*", effect: "allow" },
  ]);
  assert.deepEqual(examples.find((item) => item.compaction), { compaction: { buffer: "20%" } });
});

test("browser and integration limits are visible with recovery links", () => {
  const browser = text(docs.match(/<section id="browser">([\s\S]*?)<\/section>/)?.[1] || "");
  assert.match(browser, /desktop browser must be attached/);
  assert.match(browser, /localhost means the server machine/);
  assert.match(browser, /actions ask unless permissions or the selected mode allow/);
  assert.match(browser, /5 MiB/);
  assert.match(docs, /See <a href="#mcp">MCP connections<\/a>/);
  assert.match(text(docs), /Artifacts and schedules remain opt-in/);
  assert.match(text(docs), /they are not enabled by default/);
});

test("SSR download fallback and existing navigation/install controls remain", () => {
  assert.match(marketing, /<div class="forge-download">[\s\S]*?<p class="forge-release">[\s\S]*?<\/p><\/div>/);
  assert.match(marketing, /href="https:\/\/github.com\/divyanshusingh2903\/forge\/releases\/latest"><span>View latest release/);
  const subtext = marketing.match(/<p class="forge-release">([\s\S]*?)<\/p>/)?.[1];
  assert.match(subtext, /releases\/latest/);
  assert.match(text(subtext), /Latest release on GitHub/);
  assert.doesNotMatch(text(subtext), /Forge \d/);
  assert.match(marketing, /aria-label="Run Forge from source"/);
  assert.match(marketing, /href="\/forge\/docs"/);
  assert.match(docs, /href="\/forge"/);
  assert.match(marketing, /forge-demo\.mp4/);
  assert.match(docs, /forge-plan-review\.jpg/);
});
