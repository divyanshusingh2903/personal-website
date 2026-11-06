import { test } from "node:test";
import assert from "node:assert/strict";
import { parseForgeRelease } from "../src/components/ForgeLatestRelease.js";

const repository = "https://github.com/divyanshusingh2903/forge";
const tag = "v2.2.5-v0.7.5";
const name = "forge-desktop-linux-x86_64.AppImage";
const url = `${repository}/releases/download/${tag}/${name}`;
const release = {
  tag_name: tag,
  html_url: `${repository}/releases/tag/${tag}`,
  draft: false,
  prerelease: false,
  assets: [{ name, state: "uploaded", browser_download_url: url }],
};

test("version label, release link and installer use the same published release", () => {
  const parsed = parseForgeRelease(release);
  assert.equal(parsed.label, "OpenCode 2.2.5 · Forge 0.7.5");
  assert.equal(parsed.url, release.html_url);
  assert.equal(parsed.downloads[name], url);
  assert.equal(parsed.downloads["missing.exe"], undefined);
});

test("future combined tags update both versions automatically", () => {
  const next = "v3.10.12-v1.20.30";
  const parsed = parseForgeRelease({ ...release, tag_name: next, html_url: `${repository}/releases/tag/${next}`, assets: [] });
  assert.equal(parsed.label, "OpenCode 3.10.12 · Forge 1.20.30");
  assert.deepEqual(parsed.downloads, {});
});

test("invalid responses and unpublished releases retain the latest-release fallback", () => {
  for (const data of [null, {}, { ...release, draft: true }, { ...release, prerelease: true },
    { ...release, tag_name: "unexpected" }, { ...release, html_url: "https://example.com" }]) {
    assert.equal(parseForgeRelease(data), null);
  }
});

test("missing assets, unfinished uploads and installers from other releases are not downloadable", () => {
  assert.deepEqual(parseForgeRelease({ ...release, assets: null }).downloads, {});
  for (const asset of [
    { name, state: "new", browser_download_url: url },
    { name, state: "uploaded", browser_download_url: url.replace(tag, "v2.2.5-v0.7.4") },
    { name, state: "uploaded", browser_download_url: "https://example.com/installer" },
  ]) {
    assert.deepEqual(parseForgeRelease({ ...release, assets: [asset] }).downloads, {});
  }
});
