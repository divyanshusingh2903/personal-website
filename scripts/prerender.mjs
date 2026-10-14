// Post-build step: renders each route to static HTML so crawlers and AI agents
// that don't execute JavaScript still receive the full page content.
import { createServer } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE_URL = (process.env.SITE_URL || "https://personal-website-479811.web.app").replace(/\/$/, "");

const routes = [
  { path: "/", title: "Divyanshu Singh | Software Engineer", description: "Divyanshu Singh - Software Engineer & Entrepreneur building innovative cloud and pharmaceutical technology solutions." },
  { path: "/projects", title: "Projects | Divyanshu Singh", description: "Projects by Divyanshu Singh: Harbinger, Forge, Vihayas, PharmFindr, IPELint and more." },
  { path: "/research", title: "Research | Divyanshu Singh", description: "Research interests and publications by Divyanshu Singh: DataScribe (Digital Discovery, 2026) and TRAM-MP multi-person motion reconstruction (arXiv, 2025)." },
  { path: "/experience", title: "Experience | Divyanshu Singh", description: "Professional experience and education of Divyanshu Singh." },
  { path: "/contact", title: "Contact | Divyanshu Singh", description: "Contact Divyanshu Singh by email, GitHub or LinkedIn." },
  { path: "/forge", title: "Forge | Divyanshu Singh", description: "Forge: a coding agent, forked from OpenCode, that shows its next move before it makes it and keeps you in the loop." },
  { path: "/harbinger", title: "Harbinger | Divyanshu Singh", description: "Harbinger: ML-based processing-time prediction with Multi-Level Feedback Queue scheduling to reduce message latency, with interactive simulations." },
  { path: "/harbinger/experiments", title: "Harbinger Experiments | Divyanshu Singh", description: "Experiments for the Harbinger project." },
  { path: "/harbinger/benchmarks", title: "Harbinger Benchmarks | Divyanshu Singh", description: "Benchmarks for the Harbinger project." },
  { path: "/harbinger/comparison", title: "Harbinger Comparison | Divyanshu Singh", description: "Comparison results for the Harbinger project." },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const template = readFileSync(join(dist, "index.html"), "utf8");
// Empty shell for client-rendered routes (e.g. /coach/*); the Firebase rewrite points here.
writeFileSync(join(dist, "app-shell.html"), template);
const vite = await createServer({
  root,
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "error",
});
const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");

const done = [];
let failed = 0;
for (const r of routes) {
  let html;
  try {
    html = render(r.path);
  } catch (err) {
    failed++;
    console.warn(`prerender: skipped ${r.path} (${err.message})`);
    continue;
  }
  // React 19 emits resource hints inline; the client hoists them into <head>, so do the same to keep hydration clean.
  const hints = [];
  html = html.replace(/<link rel="preload"[^>]*\/?>/g, (m) => (hints.push(m), ""));
  const url = SITE_URL + (r.path === "/" ? "/" : r.path);
  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<link rel="alternate" type="text/plain" href="${SITE_URL}/llms.txt" title="llms.txt" />`,
    ...hints,
  ].join("\n    ");
  const page = template
    .replace(/<title>.*?<\/title>/, `<title>${esc(r.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace("</head>", `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const out = r.path === "/" ? join(dist, "index.html") : join(dist, r.path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  done.push(r.path);
}
await vite.close();

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    done.map((p) => `  <url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`,
);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`prerender: wrote ${done.length} pages${failed ? `, ${failed} skipped` : ""}`);
