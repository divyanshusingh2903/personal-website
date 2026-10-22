import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Icon, Logo, Mark } from "./GoldenGateBrand";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";

// Tool names are the MCP tools Golden Gate Bridge serves. All are read-only.
// The sessions in every sample are invented; scheduling, posting and sending are done by whatever MCP client you connect.

// What Golden Gate reads, on the San Francisco side.
const ingest = [
  { logo: "claudecode", name: "Claude Code" },
  { logo: "codex", name: "Codex" },
  { logo: "opencode", name: "OpenCode" },
  { logo: "claude", name: "claude.ai" },
  { logo: "openai", name: "ChatGPT" },
];

// What can connect, on the Marin side: anything that speaks MCP. Examples only.
const connectors = [
  { logo: "claude", name: "Claude" },
  { logo: "openai", name: "ChatGPT" },
  { logo: "gemini", name: "Gemini" },
  { logo: "grok", name: "Grok" },
  { logo: "metaai", name: "Meta AI" },
  { logo: "perplexity", name: "Perplexity" },
  { logo: "mistral", name: "Le Chat" },
  { logo: "cursor", name: "Cursor" },
  { icon: "assistant", name: "Your agent" },
];

// The real coastline and roads are a separate chunk, loaded only on this page.
const MapPaths = lazy(() => import("./GoldenGateMapPaths"));

// The brand mark laid over the real Golden Gate Bridge: towers 1,280 m apart, centred on the deck.
// It is drawn at its own stroke weight (3.2 in its 64x48 box) so the lines scale with it, like the logo file.
const CABLE = "M2 34Q14 30 20 6Q32 46 44 6Q50 30 62 34";
const MARK_SCALE = 3.73;
const DECK = { cx: 800.4, cy: 408.4 };

function Logos({ items }) {
  return (
    <ul className="gg-logos">
      {items.map((p) => (
        <li key={p.name} title={p.name}>
          {p.logo ? <Logo name={p.logo} label={p.name} /> : <Icon name={p.icon} label={p.name} />}
        </li>
      ))}
    </ul>
  );
}

function MapHero() {
  return (
    <section className="gg-uc-hero">
      <svg className="gg-map-svg" viewBox="0 0 1600 712" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A map of the Golden Gate strait: San Francisco on the left, Marin County on the right, joined by the bridge">
        <rect className="gg-map-water" width="1600" height="712" />
        <Suspense fallback={null}><MapPaths /></Suspense>
        <g transform={`translate(${DECK.cx - 32 * MARK_SCALE} ${DECK.cy - 34 * MARK_SCALE}) scale(${MARK_SCALE})`} fill="none" stroke="var(--gg-orange)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 4V44M44 4V44" />
          <path d={CABLE} />
        </g>
      </svg>

      <div className="gg-uc-ui">
        <div className="gg-uc-title">
          <h1>Use cases</h1>
          <p className="gg-lede">Read from every tool you code in. Answer in every assistant you use.</p>
        </div>

        <div className="gg-uc-side gg-uc-sf">
          <h2>Golden Gate</h2>
          <p>reads your tools</p>
          <Logos items={ingest} />
        </div>

        <div className="gg-uc-mid" aria-hidden="true"><Mark className="gg-uc-mark" /></div>

        <div className="gg-uc-side gg-uc-marin">
          <h2>Golden Gate Bridge</h2>
          <p>serves anything that speaks MCP</p>
          <Logos items={connectors} />
        </div>
      </div>

      <a className="gg-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{"\u00A9"} OpenStreetMap contributors</a>
    </section>
  );
}

// Each case plays on the kind of surface it would really appear on, not always a chat window.
function Surface({ c }) {
  const s = c.surface;
  switch (c.kind) {
    case "chat":
      return (
        <div className="gg-chat" aria-label="Sample conversation">
          <div className="gg-msg gg-msg-q"><span className="gg-avatar" aria-hidden="true">YOU</span><p>{s.ask}</p></div>
          <div className="gg-tool"><Icon name="server" /><span>Reads</span>{c.tools.map((t) => <code key={t}>{t}</code>)}<span className="gg-dots" aria-hidden="true"><i /><i /><i /></span></div>
          <div className={`gg-msg gg-msg-a${s.blocked ? " is-blocked" : ""}`}><span className="gg-avatar" aria-hidden="true">AI</span><ul>{s.answer.map((a) => <li key={a}>{a}</li>)}</ul></div>
          <p className="gg-chat-note">Sample data</p>
        </div>
      );
    case "terminal":
      return (
        <div className="gg-surf gg-terminal" aria-label="Sample terminal session">
          <div className="gg-surf-bar"><i /><i /><i /><span>{s.title}</span></div>
          <pre>
            {s.lines.map(([cls, text], i) => <span key={i} className={`gg-tl gg-tl-${cls}`} style={{ "--k": i }}>{text}{"\n"}</span>)}
          </pre>
        </div>
      );
    case "post":
      return (
        <div className="gg-surf gg-post" aria-label="Sample team chat message">
          <div className="gg-post-head"><span className="gg-avatar gg-avatar-bot" aria-hidden="true">AI</span><strong>{s.who}</strong><time>{s.when}</time></div>
          <p>{s.text}</p>
          <ul>{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="gg-post-foot">{c.tools.map((t) => <code key={t}>{t}</code>)}</div>
        </div>
      );
    case "email":
      return (
        <div className="gg-surf gg-email" aria-label="Sample email draft">
          <span className="gg-ribbon">Draft</span>
          <dl>
            <div><dt>To</dt><dd>{s.to}</dd></div>
            <div><dt>Subject</dt><dd>{s.subject}</dd></div>
          </dl>
          <p>{s.text}</p>
          <ul>{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      );
    case "voice":
      return (
        <div className="gg-surf gg-voice" aria-label="Sample voice assistant">
          <div className="gg-voice-orb" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <p className="gg-voice-q">{"“"}{s.ask}{"”"}</p>
          <p className="gg-voice-a">{s.answer}</p>
        </div>
      );
    case "doc":
      return (
        <div className="gg-surf gg-doc" aria-label="Sample document">
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <ul>{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      );
    case "calendar":
      return (
        <div className="gg-surf gg-cal" aria-label="Sample calendar prep note">
          <div className="gg-cal-head"><b>{s.time}</b><span>{s.title}</span></div>
          <div className="gg-cal-cols">
            {s.cols.map(([h, items]) => (
              <div key={h}><h4>{h}</h4><ul>{items.map((t) => <li key={t}>{t}</li>)}</ul></div>
            ))}
          </div>
        </div>
      );
    case "editor":
      return (
        <div className="gg-surf gg-editor" aria-label="Sample code editor with an agent note">
          <div className="gg-editor-tab">{s.file}</div>
          <pre>
            {s.code.map(([n, text, hot]) => <span key={n} className={hot ? "gg-ed-hot" : undefined}><b>{n}</b>{text}{"\n"}</span>)}
          </pre>
          <div className="gg-ed-note"><span className="gg-avatar gg-avatar-bot" aria-hidden="true">AI</span><p>{s.note}</p></div>
        </div>
      );
    default:
      return null;
  }
}

const cases = [
  {
    id: "weekly",
    title: "A weekly review in one question",
    body: "Standups and weekly updates start with remembering. Your work arrives grouped by project, across every tool.",
    via: "Chat assistant",
    kind: "chat",
    tools: ["recent_activity", "list_projects"],
    surface: {
      ask: "What did I work on this week?",
      answer: [
        "pharmfindr: rate-limited review submissions, added gRPC health checks, cursor pagination (PR #42 open)",
        "forge: token usage on every message",
        "harbinger: MLFQ cuts p99 latency from 41.7 to 18.2 ms at 5k msgs/s",
      ],
    },
    scope: "Share the projects you would report on. Leave client work out.",
  },
  {
    id: "handoff",
    title: "Start in one tool, finish in another",
    body: "Your coding agent can read what a different tool did in the same repository, so a new session starts with context.",
    via: "Coding agent",
    kind: "terminal",
    tools: ["get_project_context"],
    surface: {
      title: "~/code/pharmfindr",
      lines: [
        ["cmd", "$ codex \"finish the review rate limiter\""],
        ["dim", "reads get_project_context(\"~/code/pharmfindr\")"],
        ["out", "Found it. Claude Code started this 2h ago:"],
        ["out", "  api/reviews.go  rate limit added, tests pass (3d8f6c1)"],
        ["warn", "Still open: PR #42, no merge seen."],
        ["out", "Picking up in api/reviews.go."],
      ],
    },
    scope: "Same folder, two tools, one project. Worktrees are filed under their repository.",
  },
  {
    id: "nudge",
    title: "A Monday nudge for stale pull requests",
    body: "A scheduled agent checks what you opened and never saw merged, and posts it where you will see it.",
    via: "Scheduled agent",
    kind: "post",
    tools: ["list_pull_requests"],
    surface: {
      who: "Weekly agent",
      when: "Mon 9:00",
      text: "Open pull requests worth a look:",
      items: ["pharmfindr #42 opened 2 days ago, no merge seen", "harbinger #17 was only mentioned. Nothing was opened."],
    },
    scope: "Status comes from what the session showed. It does not ask GitHub.",
  },
  {
    id: "writeup",
    title: "The Friday update, drafted",
    body: "A changelog or status email starts from the commits and issues that actually happened, with the evidence behind each.",
    via: "Email draft",
    kind: "email",
    tools: ["list_commits", "list_issues"],
    surface: {
      to: "team@example.com",
      subject: "Shipped this week: pharmfindr",
      text: "Hi all, what went out:",
      items: ["Fixed the staging OAuth redirect (a41c9e2)", "Cursor pagination for search (7be0d13)", "Rate limit on review submissions (3d8f6c1)", "Filed #51: rate-limit review spam"],
    },
    scope: "Issue titles and states are sent. Descriptions and comments never are.",
  },
  {
    id: "voice",
    title: "Ask out loud on the commute",
    body: "Any voice assistant that can call MCP tools can answer from your recent work without you opening a laptop.",
    via: "Voice assistant",
    kind: "voice",
    tools: ["recent_activity"],
    surface: {
      ask: "What did I ship this week?",
      answer: "Three things. Pagination for the CDMO search, a rate limit on reviews, and the staging redirect fix.",
    },
    scope: "Answers are only as private as the assistant you ask. The token can only read.",
  },
  {
    id: "brag",
    title: "A performance review without the scramble",
    body: "Pull a year of pull requests and commits into highlights, while the work is still on your mind and in the record.",
    via: "Document",
    kind: "doc",
    tools: ["list_pull_requests", "list_commits"],
    surface: {
      title: "Highlights, this year",
      text: "Built from merged and created work:",
      items: ["Shipped cursor pagination for CDMO search (PR #42)", "Cut MLFQ p99 latency from 41.7 to 18.2 ms at 5k msgs/s", "Added per-message token usage to Forge"],
    },
    scope: "Looks back up to 365 days. Only what you chose to share.",
  },
  {
    id: "standup",
    title: "Walk into standup ready",
    body: "A calendar assistant can attach yesterday, today and what is still open to the invite, ten minutes before.",
    via: "Calendar assistant",
    kind: "calendar",
    tools: ["recent_activity", "get_project_context"],
    surface: {
      time: "10:00",
      title: "Team standup",
      cols: [
        ["Yesterday", ["Rate limit on review submissions", "gRPC health checks"]],
        ["Still open", ["PR #42 awaiting merge", "Issue #51 filed"]],
      ],
    },
    scope: "Reads summaries, never transcripts.",
  },
  {
    id: "redo",
    title: "Don't solve it twice",
    body: "Before an agent starts, it can search your past work and notice you already fixed something like this.",
    via: "Editor agent",
    kind: "editor",
    tools: ["search_work", "get_session"],
    surface: {
      file: "auth/redirect.go",
      code: [
        [12, "func redirectURI(env string) string {"],
        [13, "    // staging callback is stale", true],
        [14, "    return baseURL + \"/callback\""],
        [15, "}"],
      ],
      note: "You fixed a staging redirect like this 30h ago (a41c9e2, auth/redirect.go). Reuse that approach?",
    },
    scope: "Search covers titles and summaries. Raw transcripts never leave your machine.",
  },
  {
    id: "chats",
    title: "Bring your chat history along",
    body: "Export claude.ai or ChatGPT and those conversations become projects beside your code, each shared by its own rule.",
    via: "Chat assistant",
    kind: "chat",
    tools: ["search_work", "get_session"],
    surface: {
      ask: "What did I decide about the database schema in my earlier chats?",
      answer: ["AI claude.ai, “Reviews schema”: ratings get their own table, one row per review."],
    },
    scope: "Artifacts and uploads travel as metadata only: id, title and status.",
  },
  {
    id: "clients",
    title: "Keep client work out of it",
    body: "Share the projects you choose and deny the rest. A deny rule always wins, even over a broader allow.",
    via: "Chat assistant",
    kind: "chat",
    tools: ["list_projects"],
    surface: {
      ask: "What did I do for client-x this week?",
      blocked: true,
      answer: ["I do not see a project called client-x. Only projects you chose to share are available to me."],
    },
    scope: "Denied sessions are dropped before they are parsed, and their names are never logged.",
  },
];

const fits = [
  "You work across several AI coding tools and lose track of what you did where.",
  "You want an assistant, agent or app to answer questions about your own recent work.",
  "You are comfortable running one small server, and want to decide exactly what is on it.",
];

const notFor = [
  "A hosted service. There is none: one deployment serves one person, or a small team that trusts each other.",
  "Something that acts. Golden Gate Bridge only reads. Scheduling, posting and sending is done by the tool you connect.",
  "Live status. Sessions are summarized when you sync.",
];

function GoldenGateUseCases() {
  return (
    <GoldenGateShell title="Use cases | Golden Gate">
      <MapHero />

      <section className="gg-section">
        <div className="gg-wrap">
          <ol className="gg-cases">
            {cases.map((c, i) => (
              <li className={`gg-case${i % 2 ? " is-flip" : ""}`} id={c.id} key={c.id}>
                <div className="gg-case-grid">
                  <div className="gg-case-text">
                    <span className="gg-case-num">{String(i + 1).padStart(2, "0")} <em>via {c.via}</em></span>
                    <h2>{c.title}</h2>
                    <p className="gg-case-body">{c.body}</p>
                    <p className="gg-case-tools"><span>Reads</span>{c.tools.map((t) => <code key={t}>{t}</code>)}</p>
                    <p className="gg-case-scope"><Icon name="shared" /> {c.scope}</p>
                  </div>
                  <div className="gg-case-surface"><Surface c={c} /></div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gg-section gg-section-sunk">
        <div className="gg-wrap">
          <div className="gg-split">
            <div className="gg-card">
              <h3><Icon name="shared" /> Who it fits</h3>
              <ul>{fits.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="gg-card">
              <h3><Icon name="denied" /> What it is not</h3>
              <ul>{notFor.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
          <p className="gg-more">
            Every tool is read-only, and the token cannot write or delete. See <Link to="/goldengate/mcp">the MCP tools</Link>, <Link to="/goldengate/security">Security</Link>, or the <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">repository</a>.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateUseCases;
