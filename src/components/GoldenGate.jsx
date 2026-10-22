import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Mark, RedactDemo } from "./GoldenGateBrand";
import GoldenGateShell, { Code, GITHUB_URL, Shot } from "./GoldenGateShell";

const DESIGN_URL = `${GITHUB_URL}/blob/main/DESIGN.md`;

const steps = [
  { icon: "laptop", title: "Golden Gate", where: "On your laptop", body: "Reads your coding tools' history, read-only. Only projects you picked go further." },
  { icon: "redact", title: "Redact and summarize", where: "Still on your laptop", demo: true, body: "Secrets and paths are scrubbed before and after a local summary." },
  { icon: "server", title: "Golden Gate Bridge", where: "On your server", body: "A small server you run. No hosted service, no telemetry.", own: true },
  { icon: "assistant", title: "Your assistant", where: "Gemini, ChatGPT, Claude", body: "Reads over MCP with a read-only token you can revoke." },
];

const views = [
  {
    id: "payload",
    label: "Raw payload",
    alt: "Paranoid mode in the preview: the exact JSON of a session payload that would be sent, with source, project, level and a summary of goals, outcomes and messages.",
    caption: <>Paranoid mode (<kbd>P</kbd>) prints the exact bytes of every payload that would leave. Titles, goals, outcomes, file names and command names. No transcript, no tool output, no file contents.</>,
  },
  {
    id: "preview",
    label: "Summary view",
    alt: "The preview of a project's sessions, where the closing message reads: the key [REDACTED:aws-access-key] was also printed in the log.",
    caption: <>A session that printed an AWS key. The key never reaches the payload: it is replaced on your machine, before and after summarizing, and counted under <code>redactions</code>.</>,
  },
];

function PayloadViews() {
  const [active, setActive] = useState(views[0].id);
  const view = views.find((v) => v.id === active);
  return (
    <div className="gg-views">
      <div className="gg-segment" role="tablist" aria-label="Preview mode">
        {views.map((v) => (
          <button key={v.id} role="tab" aria-selected={v.id === active} onClick={() => setActive(v.id)}>{v.label}</button>
        ))}
      </div>
      <figure className="gg-figure">
        <Shot name={view.id} alt={view.alt} />
        <figcaption>{view.caption}</figcaption>
      </figure>
    </div>
  );
}

const glyphs = [
  ["shared", "[x]", "Shared"],
  ["none", "[ ]", "Not shared"],
  ["warn", "[~]", "Some tools shared"],
  ["bad", "[-]", "Denied"],
  ["warn", "▲ 3", "3 sessions to sync"],
];

const useCases = [
  ["sync", "A weekly review in one question", "Ask what you worked on this week and get an answer across every project and every coding tool."],
  ["project", "Pick up where you left off", "The goals, recent sessions and open threads of a project, without scrolling old chats."],
  ["preview", "Find what is still open", "Pull requests opened but never confirmed merged, and commits that were only mentioned."],
  ["source", "Find the session you half remember", "Search your past work by what it was about, then open that one session."],
];

const promises = [
  ["shared", "Nothing leaves until you pick it", "New projects stay on your machine, and a deny rule always beats an allow rule."],
  ["redact", "Redacted twice", "Secrets and paths are scrubbed before and after summarizing. Best effort, so the preview is always there to read."],
  ["token", "A token that can only read", "The assistant's token can neither write nor delete, and you can rotate or revoke it at any time."],
];

const quickstart = [
  ["Run Golden Gate Bridge behind HTTPS", 'export GOLDENGATE_ADMIN_TOKEN="$(openssl rand -base64 32)"\ngoldengatebridge serve --addr :8080 --behind-tls-proxy --db /data/bridge.db'],
  ["Connect Golden Gate on your laptop", "goldengate init --server https://bridge.example.com"],
  ["Pick a project, look, then send", "goldengate share add ~/code/myproject\ngoldengate sync --dry-run\ngoldengate sync"],
  ["Point your assistant at it", "https://bridge.example.com/mcp\nAuthorization: Bearer <read token>"],
];

const sources = [
  ["CC", "code", "Claude Code", "~/.claude/projects/**.jsonl"],
  ["CX", "code", "Codex CLI and desktop", "~/.codex/sessions/**/rollout-*.jsonl"],
  ["OC", "code", "OpenCode", "its SQLite database, read-only"],
  ["AI", "chat", "claude.ai export", "goldengate import-claude-ai export.zip"],
  ["GPT", "chat", "ChatGPT export", "goldengate import-chatgpt export.zip"],
];

const roadmap = [
  ["done", "M1", "Core", "Adapters, local summarizer, redactor, selection rules, dry-run sync"],
  ["done", "M2", "Server", "SQLite store, ingest API, scoped tokens, pairing, MCP over streamable HTTP, audit log"],
  ["done", "M3", "More sources", "Codex, OpenCode, claude.ai and ChatGPT exports, one project across tools"],
  ["done", "M4", "TUI", "Setup wizard, project picker, exact preview, two-step sync, server and settings screens"],
  ["next", "M5", "Deploy", "Postgres and Firestore stores, Dockerfile, Cloud Run script, docker compose with Caddy"],
  ["later", "M6", "Release", "Signed builds for Linux, macOS and Windows, SBOM, Homebrew tap, finished hardening checklist"],
];

const ROADMAP_STATE = { done: ["✓", "Done"], next: ["▲", "Next"], later: ["○", "Later"] };

function GoldenGate() {
  return (
    <GoldenGateShell title="Golden Gate | Choose what your assistant knows">
      <section className="gg-hero">
        <div className="gg-fog" aria-hidden="true"><span /><span /></div>
        <div className="gg-wrap gg-hero-inner">
          <div className="gg-hero-copy">
            <h1>Choose what your assistant knows.</h1>
            <p className="gg-lede">
              Golden Gate tells the AI assistant you chat with what you have been building in Claude Code, Codex and OpenCode.
              It sends redacted summaries of the projects you pick to your own Golden Gate Bridge server, and nothing else.
            </p>
            <div className="gg-actions">
              <a className="gg-btn gg-btn-primary" href="#install">Quickstart</a>
              <Link className="gg-btn" to="/goldengate/security">How it stays private</Link>
            </div>
          </div>
          <div className="gg-hero-art">
            <Mark className="gg-hero-mark" draw />
          </div>
        </div>
      </section>

      <section className="gg-section" id="tour">
        <div className="gg-wrap">
          <h2>Every project, and what happens to it.</h2>
          <p className="gg-prose">
            Open Golden Gate in your terminal with <code>goldengate</code>. Find a project, share it with <kbd>space</kbd>, read exactly what would leave with <kbd>p</kbd>, then review and send with <kbd>s</kbd>.
          </p>
          <figure className="gg-figure gg-figure-wide">
            <Shot
              name="walkthrough"
              ext="gif"
              width={1200}
              height={874}
              alt="The Golden Gate TUI: moving through the project list, searching for vihayas, sharing it, previewing its summary, then reviewing and sending a sync until every shared project shows synced."
            />
            <figcaption>Recorded from the real TUI against a local server, with synthetic sessions.</figcaption>
          </figure>
          <ul className="gg-glyphs" aria-label="Project states">
            {glyphs.map(([cls, glyph, label]) => (
              <li key={label}><code className={`gg-glyph gg-glyph-${cls}`}>{glyph}</code><span>{label}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="how">
        <div className="gg-wrap">
          <h2>Two programs, one direction.</h2>
          <p className="gg-prose">
            Golden Gate runs on your laptop and Golden Gate Bridge runs on your server. Data only moves from one to the other: the bridge never reaches into your machine, and every payload leaves through one function that checks it first.
          </p>
          <ol className="gg-flow">
            {steps.map((s, i) => (
              <li key={s.title} className={s.own ? "gg-flow-own" : undefined} style={{ "--i": i }}>
                <div className="gg-flow-head">
                  <span className="gg-flow-icon"><Icon name={s.icon} /></span>
                  <span className="gg-flow-num">0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <span className="gg-flow-where">{s.where}</span>
                <p>{s.body}</p>
                {s.demo && <RedactDemo />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gg-section">
        <div className="gg-wrap">
          <h2>The preview is the payload.</h2>
          <p className="gg-prose">
            Before anything leaves, you can read it. <code>goldengate sync --dry-run</code> prints the same thing.
          </p>
          <PayloadViews />
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="use-cases">
        <div className="gg-wrap">
          <h2>What it is for.</h2>
          <p className="gg-prose">
            Your assistant can answer questions about your own recent work, because it can read the summaries on your Golden Gate Bridge server.
          </p>
          <div className="gg-promises gg-promises-4">
            {useCases.map(([icon, title, body]) => (
              <div className="gg-card gg-card-lift" key={title}>
                <span className="gg-card-icon"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="gg-more">
            <Link to="/goldengate/use-cases">See all use cases</Link>, or the <Link to="/goldengate/mcp">nine MCP tools</Link> the assistant reads with.
          </p>
        </div>
      </section>

      <section className="gg-section" id="security">
        <div className="gg-wrap">
          <h2>Nothing is shared until you pick it.</h2>
          <div className="gg-promises">
            {promises.map(([icon, title, body]) => (
              <div className="gg-card" key={title}>
                <h3><Icon name={icon} /> {title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="gg-more">
            <Link to="/goldengate/security">Read the security model</Link>: tokens, the opt-in model summarizer, prompt injection, and what it cannot protect against.
          </p>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="install">
        <div className="gg-wrap">
          <h2>About ten minutes, start to finish.</h2>
          <p className="gg-prose">
            There are no packaged releases yet. Build both programs, Golden Gate (<code>goldengate</code>) and Golden Gate Bridge (<code>goldengatebridge</code>), with Go 1.26 or later:
          </p>
          <Code>{"go install github.com/divyanshusingh2903/goldengate/cmd/...@latest"}</Code>
          <ol className="gg-steps">
            {quickstart.map(([title, cmd], i) => (
              <li key={title}>
                <span className="gg-step-num">{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <Code>{cmd}</Code>
                </div>
              </li>
            ))}
          </ol>
          <p className="gg-note">
            Your assistant only supports OAuth? Start the server with <code>--oauth --public-url</code> and approve the connection with your admin secret. The <a href={`${GITHUB_URL}#quickstart-about-ten-minutes`} target="_blank" rel="noopener noreferrer">README</a> has every option.
          </p>

          <div className="gg-two">
            <div>
              <h3 className="gg-h3">Sources</h3>
              <ul className="gg-sources">
                {sources.map(([tag, kind, name, how]) => (
                  <li key={tag}>
                    <span className={`gg-tag gg-tag-${kind}`}>{tag}</span>
                    <div><strong>{name}</strong><code>{how}</code></div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="gg-h3">Roadmap</h3>
              <ol className="gg-roadmap">
                {roadmap.map(([state, id, name, body]) => (
                  <li key={id} className={`gg-rm-${state}`}>
                    <span className="gg-rm-state"><span aria-hidden="true">{ROADMAP_STATE[state][0]}</span> {ROADMAP_STATE[state][1]}</span>
                    <div><strong>{id} {name}</strong><span>{body}</span></div>
                  </li>
                ))}
              </ol>
              <p className="gg-note">The full plan is in <a href={DESIGN_URL} target="_blank" rel="noopener noreferrer">DESIGN.md</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGate;
