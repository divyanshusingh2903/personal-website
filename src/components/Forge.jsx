import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Forge.css";
import { Arrow, Mark, Wordmark } from "./ForgeBrand";
import { OPENCODE_VERSION, FORGE_VERSION, FORGE_RELEASE_URL } from "./ForgeRelease";
import { LATEST_RELEASE_API_URL, LATEST_RELEASE_URL, parseForgeRelease } from "./ForgeLatestRelease";

const GITHUB_URL = "https://github.com/divyanshusingh2903/forge";
const RELEASES_URL = `${GITHUB_URL}/releases`;
// Asset names must match the files on the latest GitHub release exactly.
const DOWNLOADS_READY = true;
const DOWNLOADS = {
  mac: { label: "macOS", asset: "forge-desktop-mac-arm64.dmg" },
  windows: { label: "Windows", asset: "forge-desktop-win-x64.exe" },
  linux: { label: "Linux", asset: "forge-desktop-linux-x86_64.AppImage" },
};
const UPSTREAM_URL = "https://github.com/anomalyco/opencode";
const DOCS_URL = "https://opencode.ai/docs";

// Unauthenticated GitHub API calls are rate limited per visitor IP, so render nothing until the count loads.
function Stars() {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/divyanshusingh2903/forge")
      .then((res) => (res.ok ? res.json() : null))
      .then((repo) => {
        if (typeof repo?.stargazers_count === "number") setStars(repo.stargazers_count);
      })
      .catch(() => {});
  }, []);

  if (stars === null) return null;
  return <span className="forge-stars">[{new Intl.NumberFormat("en", { notation: "compact" }).format(stars)}]</span>;
}

function getDownloadPlatform() {
  if (typeof navigator === "undefined") return null;
  const agent = navigator.userAgent || "";
  // iPadOS can report itself as a Mac; mobile platforms need their own instructions.
  if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(agent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return null;

  const platform = navigator.userAgentData?.platform || navigator.platform || agent;
  if (/Win/i.test(platform)) return DOWNLOADS.windows;
  if (/Mac/i.test(platform)) return DOWNLOADS.mac;
  if (/Linux/i.test(platform)) return DOWNLOADS.linux;
  return null;
}

function Download() {
  const [download, setDownload] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(LATEST_RELEASE_API_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const release = parseForgeRelease(data);
        if (release && !controller.signal.aborted) {
          setDownload({ release, platform: getDownloadPlatform() });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const release = download?.release;
  const platform = download?.platform;
  const directDownload = platform && release?.downloads[platform.asset];
  const url = directDownload || release?.url || LATEST_RELEASE_URL;

  return (
    <div className="forge-download">
      <div className="forge-download-actions">
        <a className="forge-button" href={url}>
          <span>{directDownload ? `Download Forge for ${platform.label}` : "View latest release"}</span>
          <Arrow />
        </a>
        {directDownload && <a href={release.url}>Other platforms and architectures</a>}
      </div>
      <p className="forge-release"><a href={release?.url || LATEST_RELEASE_URL}>{release?.label || "Latest release on GitHub"}</a></p>
    </div>
  );
}

const installTabs = [
  { id: "clone", label: "clone", prefix: "git clone ", highlight: "github.com/divyanshusingh2903/forge", suffix: "", copy: `git clone ${GITHUB_URL}.git` },
  { id: "install", label: "install", prefix: "cd forge && ", highlight: "bun install", suffix: "", copy: "cd forge && bun install" },
  { id: "desktop", label: "desktop", prefix: "bun run --cwd ", highlight: "packages/desktop", suffix: " dev", copy: "bun run --cwd packages/desktop dev" },
];

function Install() {
  const [active, setActive] = useState(installTabs[0].id);
  const [copied, setCopied] = useState(false);
  const tab = installTabs.find((t) => t.id === active);

  const copy = () => {
    navigator.clipboard?.writeText(tab.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="forge-tabs">
      <div className="forge-tablist" role="tablist" aria-label="Run Forge from source">
        {installTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            className="forge-tab"
            onClick={() => { setActive(t.id); setCopied(false); }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="forge-panels">
        <button className="forge-command" onClick={copy} aria-label={`Copy: ${tab.copy}`}>
          <span className="forge-command-script">
            <span>{tab.prefix}</span>
            <span className="forge-highlight">{tab.highlight}</span>
            <span>{tab.suffix}</span>
          </span>
          {copied ? (
            <svg className="forge-copy-icon is-copied" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5L10 17.5L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" /></svg>
          ) : (
            <svg className="forge-copy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.5 8.5V4.5H19.5V15.5H15.5M4.5 8.5H15.5V19.5H4.5V8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Shared with OpenCode: what carries over unchanged.
const inherited = [
  ["Any model", "Keeps OpenCode V2’s provider flexibility, including guided Claude Agent setup."],
  ["Desktop app", "Forge ships as an Electron desktop app for macOS, Windows and Linux."],
  ["Subagents", "@general for multistep work and @explore for fast read-only search, same as upstream."],
  ["MCP, skills and plugins", "Build on OpenCode V2’s extension points, with optional connections you can configure in the app."],
];

// What Forge adds on top of OpenCode, each with its docs section.
const differences = [
  ["Edit modes", "Manual asks before edits and shell commands by default. Choose Accept edits, Auto or Plan to suit the task; explicit deny rules still apply.", "edit-modes"],
  ["Plan review", "Review a written plan before implementation, quote passages with feedback, then accept, revise or deny it.", "plan-review"],
  ["Faster approvals", "Prompts come preset with keybindings, so approving takes one keystroke, and proposed file changes show as diffs before you approve them.", "permissions"],
  ["Chapters", "Pin any message to start a titled chapter, then jump between them from a notch rail beside the transcript. Forge adds one by itself after a compaction or when you link a new issue or pull request.", "chapters"],
  ["Pull requests that stay tracked", "Forge remembers the pull and merge requests a session opens, with their state and CI. Opt in to auto-fix and it queues a fix when CI fails.", "pull-requests"],
  ["Run code blocks in the terminal", "Run a shell block from a reply in the session terminal with one click; the exit code and output go back to the agent.", "run-in-terminal"],
  ["Native memory", "Keep your project’s context across sessions, stored locally and yours to edit.", "memory"],
  ["Git in the review panel", "Git actions at your fingertips. Control your version control without leaving the app.", "git"],
];

function FaqItem({ question, children }) {
  return (
    <li>
      <details className="forge-faq-item">
        <summary className="forge-faq-question">
          <svg className="forge-faq-plus" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 11.5H19V12.5H12.5V19H11.5V12.5H5V11.5H11.5V5H12.5V11.5Z" fill="currentColor" /></svg>
          <svg className="forge-faq-minus" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11.5H19V12.5H5Z" fill="currentColor" /></svg>
          <span>{question}</span>
        </summary>
        <div className="forge-faq-answer">{children}</div>
      </details>
    </li>
  );
}

function Forge() {
  useEffect(() => {
    const prevTitle = document.title;
    const icon = document.querySelector('link[rel="icon"]');
    const prevIcon = icon?.getAttribute("href");
    const prevType = icon?.getAttribute("type");
    document.title = "Forge | Human-in-the-loop coding agent";
    icon?.setAttribute("href", "/forge-favicon.svg");
    icon?.setAttribute("type", "image/svg+xml");
    return () => {
      document.title = prevTitle;
      if (prevIcon) icon.setAttribute("href", prevIcon);
      if (prevType) icon.setAttribute("type", prevType);
    };
  }, []);

  return (
    <main id="forge">
      <div className="forge-container">
        <header className="forge-top">
          <a className="forge-logo" href="#forge" aria-label="Forge, back to top"><Mark /><Wordmark /></a>
          <nav aria-label="Forge navigation">
            <ul>
              <li><Link to="/forge/docs">Docs</Link></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub <Stars /></a></li>
            </ul>
          </nav>
        </header>

        <section className="forge-hero">
          <div className="forge-hero-copy">
            <h1>The coding agent that keeps you in the loop</h1>
            <p>
              Review the plan. Approve edits and commands by default. <span className="forge-br" />
              The power of OpenCode, with the transparency and human-in-the-loop feel of Claude Code.
            </p>
          </div>

          <Download />
          <Install />
        </section>

        <section className="forge-preview-section">
          <video className="forge-demo" src="/forge-demo.mp4" aria-label="Forge desktop app demonstration" autoPlay playsInline loop muted controls preload="metadata">
            Your browser does not support video playback.
          </video>
          <p className="forge-demo-caption">Forge desktop demo: approvals, plan review, chapters, PR tracking, run in terminal, memory, git and the built-in browser.</p>
        </section>

        <section className="forge-section">
          <div className="forge-section-title is-flush">
            <h3>What is Forge?</h3>
            <p>Forge is my personal fork of OpenCode, steered closer to how Claude Code feels to use: more transparent, and less inclined to act without asking first.</p>
          </div>
        </section>

        <section className="forge-section" id="vs-opencode">
          <div className="forge-section-title">
            <h3>How Forge differs from OpenCode</h3>
            <p>
              Forge keeps OpenCode’s engine but changes the defaults and the workflow around it, bringing it closer to how Claude Code feels to use.
            </p>
          </div>
          <ul className="forge-list">
            {differences.map(([title, body, anchor]) => (
              <li key={anchor}>
                <span>[+]</span>
                <div><strong>{title}</strong> {body} <Link to={`/forge/docs#${anchor}`}>Learn more</Link></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="forge-section">
          <div className="forge-section-title">
            <h3>Still OpenCode underneath</h3>
            <p>
              Forge is a real GitHub fork of <a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer">anomalyco/opencode</a>, so it shares upstream’s history and can pull in new releases normally. Anything Forge doesn’t change is covered by <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">OpenCode’s docs</a>; what it does change is in the <Link to="/forge/docs">Forge docs</Link>.
            </p>
          </div>
          <ul className="forge-list">
            {inherited.map(([title, body]) => (
              <li key={title}>
                <span>[=]</span>
                <div><strong>{title}</strong> {body}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="forge-section">
          <div className="forge-section-title">
            <h3>FAQ</h3>
          </div>
          <ul className="forge-faq">
            <FaqItem question="How is it different from OpenCode?">
              Forge asks before edits and shell commands by default, writes plans to a reviewable plan file, and keeps local project memory. It brings these workflows together with desktop Git controls. Configured permissions and your selected mode still apply. See the <a href="#vs-opencode">full comparison</a>.
            </FaqItem>
            <FaqItem question="Can Forge test my app in a browser?">
              Yes. The built-in browser shares tabs with the agent for inspection, forms, screenshots and debugging. It needs an attached Forge desktop app; localhost refers to the connected server’s machine. See <Link to="/forge/docs#browser">Browser</Link> for permissions and limits.
            </FaqItem>
            <FaqItem question="Which version is this based on?">
              This page covers OpenCode {OPENCODE_VERSION} with Forge {FORGE_VERSION}. The <a href={FORGE_RELEASE_URL}>combined release tag</a> identifies both versions; download links always follow the latest published release.
            </FaqItem>
            <FaqItem question="Is it affiliated with Anthropic or Claude Code?">
              No. Forge is an independent personal project. Claude Code is simply the reference for how the workflow should feel: transparent, collaborative, and with a human in the loop.
            </FaqItem>
            <FaqItem question="How do I install it?">
              {DOWNLOADS_READY ? (
                <>Download the desktop installer for your OS above, or choose another architecture or format from <a href={RELEASES_URL}>GitHub Releases</a>. To run from source, clone the repo, run <code>bun install</code>, then start the desktop app.</>
              ) : (
                <>Desktop installers are coming soon. For now, clone the repo, run <code>bun install</code>, then start the desktop app from source.</>
              )}
            </FaqItem>
            {DOWNLOADS_READY && (
              <FaqItem question="Why does my computer warn me when I open Forge?">
                Forge’s installers aren’t code-signed yet. On macOS, if the first launch is blocked, open System Settings → Privacy & Security and click Open Anyway (or run <code>xattr -dr com.apple.quarantine /Applications/Forge.app</code>). On Windows, when SmartScreen appears, click More info → Run anyway. Linux needs no extra steps beyond making the AppImage executable.
              </FaqItem>
            )}
            <FaqItem question="Which models can I use?">
              Any provider OpenCode supports. Configuration works the same way; see the <a href={`${DOCS_URL}/providers/`} target="_blank" rel="noopener noreferrer">OpenCode providers docs</a>.
            </FaqItem>
            <FaqItem question="Is it open source?">
              Yes. Forge is MIT licensed, like OpenCode. The code is on <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
            </FaqItem>
          </ul>
        </section>

        <footer className="forge-footer">
          <div className="forge-footer-cell"><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></div>
          <div className="forge-footer-cell"><Link to="/forge/docs">Docs</Link></div>
          <div className="forge-footer-cell"><a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer">OpenCode <span>[upstream]</span></a></div>
        </footer>
      </div>

      <div className="forge-legal">
        <span>©{new Date().getFullYear()} Divyanshu Singh</span>
        <span><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">MIT License</a></span>
      </div>
    </main>
  );
}

export default Forge;
