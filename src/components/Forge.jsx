import { useEffect, useState } from "react";
import "./Forge.css";

const GITHUB_URL = "https://github.com/divyanshusingh2903/forge";
const UPSTREAM_URL = "https://github.com/anomalyco/opencode";
const DOCS_URL = "https://opencode.ai/docs";
// Drop a demo into public/ and point this at it (e.g. "/forge-demo.mp4" or "/forge-demo.gif").
const DEMO_SRC = null;

// Pixel-block "FORGE" wordmark, same grid as Forge's own logo (packages/ui/src/components/logo.tsx).
const WORDMARK = [
  ["####", "#...", "###.", "#...", "#...", "#..."],
  ["####", "#..#", "#..#", "#..#", "#..#", "####"],
  ["###.", "#..#", "###.", "#.#.", "#..#", "#..#"],
  ["####", "#...", "#.##", "#..#", "#..#", "####"],
  ["####", "#...", "###.", "#...", "#...", "####"],
];

function Wordmark() {
  return (
    <svg className="forge-wordmark" viewBox="0 0 144 42" role="img" aria-label="Forge">
      <g fill="currentColor">
        {WORDMARK.flatMap((letter, l) =>
          letter.flatMap((row, r) =>
            [...row].map((cell, c) =>
              cell === "#" ? <rect key={`${l}-${r}-${c}`} x={l * 30 + c * 6} y={3 + r * 6} width="6" height="6" /> : null,
            ),
          ),
        )}
      </g>
    </svg>
  );
}

function Mark() {
  return (
    <svg className="forge-mark" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0" y="0" width="16" height="4" fill="currentColor" />
      <rect x="4" y="6" width="8" height="4" fill="currentColor" />
      <rect x="0" y="12" width="16" height="4" fill="currentColor" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 12L17 12M13 16.5L17.5 12L13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

const installTabs = [
  { id: "clone", label: "clone", prefix: "git clone ", highlight: "github.com/divyanshusingh2903/forge", suffix: "", copy: `git clone ${GITHUB_URL}.git` },
  { id: "install", label: "install", prefix: "cd forge && ", highlight: "bun install", suffix: "", copy: "cd forge && bun install" },
  { id: "desktop", label: "desktop", prefix: "bun run --cwd ", highlight: "packages/desktop", suffix: " dev", copy: "bun run --cwd packages/desktop dev" },
  { id: "web", label: "web", prefix: "bun dev ", highlight: "web", suffix: "", copy: "bun dev web" },
  { id: "cli", label: "cli", prefix: "", highlight: "bun dev", suffix: "", copy: "bun dev" },
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

function Demo() {
  if (!DEMO_SRC) return <WorkflowPreview />;
  if (DEMO_SRC.endsWith(".gif")) return <img className="forge-demo" src={DEMO_SRC} alt="Forge planning a change before editing code" />;
  return <video className="forge-demo" src={DEMO_SRC} autoPlay playsInline loop muted preload="auto" />;
}

function WorkflowPreview() {
  return (
    <div className="forge-preview" aria-label="Illustration of Forge's planning workflow">
      <aside className="forge-preview-sidebar" aria-hidden="true">
        <div className="forge-preview-sidebar-title">SESSIONS</div>
        <div className="forge-preview-sidebar-item active">Refactor settings page</div>
        <div className="forge-preview-sidebar-item">Fix flaky ripgrep test</div>
        <div className="forge-preview-sidebar-item">Codex ws pooling</div>
      </aside>
      <div className="forge-preview-content">
        <div className="forge-preview-conversation">
          <p className="forge-preview-prompt">Help me refactor the settings page without changing its behavior.</p>
          <div className="forge-preview-response">
            <p>I’ll map the existing state and component boundaries first, then propose a small, reviewable change.</p>
            <div className="forge-preview-step"><span className="done">✓</span> Read settings components</div>
            <div className="forge-preview-step"><span className="done">✓</span> Trace state and dependencies</div>
            <div className="forge-preview-step"><span className="done">✓</span> Draft implementation plan</div>
            <div className="forge-preview-step current"><span className="accent">◌</span> Waiting for your approval before editing</div>
          </div>
        </div>
        <div className="forge-preview-composer">
          <span>Approve the plan, or steer it…</span>
        </div>
        <div className="forge-preview-footer">
          <span><b>plan</b> · read-only</span>
          <span>tab to switch agents</span>
        </div>
      </div>
    </div>
  );
}

const features = [
  ["Transparent by default", "The agent surfaces its plan and its next step before it touches your code, instead of acting silently."],
  ["Human in the loop", "Forge asks before it acts on anything consequential, so you keep the final say — much like working in Claude Code."],
  ["Plan agent", "A read-only agent for exploring the codebase. It denies file edits and asks before running bash commands."],
  ["Build agent", "The default full-access agent for development work. Switch between the two with the Tab key."],
  ["General subagent", "Hand off complex searches and multistep tasks with @general in your message."],
  ["Any model", "Keeps OpenCode’s model and provider flexibility — the same config works here."],
  ["Desktop, web and CLI", "Run the Electron desktop app, the web UI, or the terminal CLI from the same source tree."],
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
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href={DOCS_URL} target="_blank" rel="noopener noreferrer">Docs</a></li>
            </ul>
          </nav>
        </header>

        <section className="forge-hero">
          <div className="forge-hero-copy">
            <h1>The coding agent that keeps you in the loop</h1>
            <p>
              Forge shows you its next move before it makes it. <span className="forge-br" />
              The power of OpenCode, with the transparency and human-in-the-loop feel of Claude Code.
            </p>
          </div>

          <Install />
        </section>

        <section className="forge-preview-section">
          <Demo />
        </section>

        <section className="forge-section">
          <div className="forge-section-title">
            <h3>What is Forge?</h3>
            <p>Forge is my personal fork of OpenCode, steered closer to how Claude Code feels to use: more transparent, and less inclined to act without asking first.</p>
          </div>
          <ul className="forge-list">
            {features.map(([title, body]) => (
              <li key={title}>
                <span>[*]</span>
                <div><strong>{title}</strong> {body}</div>
              </li>
            ))}
          </ul>
          <a className="forge-button" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <span>Browse the source</span>
            <Arrow />
          </a>
        </section>

        <section className="forge-section">
          <div className="forge-section-title is-flush">
            <h3>Built on OpenCode</h3>
            <div>
              <span>[*]</span>
              <p>
                Forge is a real GitHub fork of <a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer">anomalyco/opencode</a>, so it shares upstream’s history and can pull in new releases normally. Nearly all of <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">OpenCode’s docs</a> apply here too.
              </p>
            </div>
          </div>
        </section>

        <section className="forge-section">
          <div className="forge-section-title">
            <h3>FAQ</h3>
          </div>
          <ul className="forge-faq">
            <FaqItem question="What is Forge?">
              A personal, human-in-the-loop fork of OpenCode. It keeps OpenCode’s agent and provider support while making the agent more transparent about what it’s about to do.
            </FaqItem>
            <FaqItem question="How is it different from OpenCode?">
              It steers OpenCode’s experience closer to Claude Code: the agent is more transparent about what it’s about to do, asks before acting instead of running ahead on its own, and the UI is tuned for steering it along the way.
            </FaqItem>
            <FaqItem question="Is it affiliated with Anthropic or Claude Code?">
              No. Forge is an independent personal project. Claude Code is simply the reference for how the workflow should feel: transparent, collaborative, and with a human in the loop.
            </FaqItem>
            <FaqItem question="How do I install it?">
              Forge isn’t a published product — there’s no install script or hosted release. Clone the repo, run <code>bun install</code>, then start the desktop app, web UI, or CLI from source.
            </FaqItem>
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
          <div className="forge-footer-cell"><a href={DOCS_URL} target="_blank" rel="noopener noreferrer">Docs</a></div>
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
