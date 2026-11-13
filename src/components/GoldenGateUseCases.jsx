import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Icon, IconGlyph, Logo, LogoPaths, Mark } from "./GoldenGateBrand";
import { MARIN, SF } from "./goldengatePlacements";
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

// What can connect, on the Marin side: the assistants, coding agents and workspace apps most developers know.
// Anything that speaks MCP works.
const connectors = [
  { logo: "claude", name: "Claude" },
  { logo: "openai", name: "ChatGPT" },
  { logo: "gemini", name: "Gemini" },
  { logo: "cursor", name: "Cursor" },
  { logo: "githubcopilot", name: "GitHub Copilot" },
  { logo: "grok", name: "Grok" },
  { logo: "perplexity", name: "Perplexity" },
  { logo: "windsurf", name: "Windsurf" },
  { logo: "metaai", name: "Meta AI" },
  { logo: "notion", name: "Notion" },
  { logo: "slack", name: "Slack" },
];

// The real coastline and roads are a separate chunk, loaded only on this page.
const MapPaths = lazy(() => import("./GoldenGateMapPaths"));

// The brand mark, fitted from shore to shore on the real deck line. It is drawn at its own stroke weight (3.2 in its
// 64x48 box) so the lines scale with it like the logo file; its anchors, plus the round caps, end exactly on the coast.
const CABLE = "M2 34Q14 30 20 6Q32 46 44 6Q50 30 62 34";
const SHORE = { left: 670.4, right: 904.1, deck: 502.8 };
const MARK_SCALE = (SHORE.right - SHORE.left) / 63.2;
const DECK = { cx: (SHORE.left + SHORE.right) / 2, cy: SHORE.deck };

// A logo placed on the map by its centre, at the map's own scale.
const LOGO_SIZE = 54;
function MapLogo({ item, at }) {
  const [x, y] = at;
  return (
    <g className="gg-map-logo" transform={`translate(${x - LOGO_SIZE / 2} ${y - LOGO_SIZE / 2}) scale(${LOGO_SIZE / 24})`}>
      <title>{item.name}</title>
      {item.logo ? <LogoPaths name={item.logo} /> : <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><IconGlyph name={item.icon} /></g>}
    </g>
  );
}

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
        <g className="gg-map-logos">
          {ingest.map((p, i) => SF[i] && <MapLogo key={p.name} item={p} at={SF[i]} />)}
          {connectors.map((p, i) => MARIN[i] && <MapLogo key={p.name} item={p} at={MARIN[i]} />)}
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

// Each case shows a real screen recording. Drop the file in public/goldengate/clips/<id>.mp4
// (and optionally <id>.jpg as its poster), then set `clip: true` on the case below.
// Until then a placeholder says what the recording will show.
function Clip({ c }) {
  const src = `/goldengate/clips/${c.id}`;
  if (c.clip) {
    return (
      <figure className="gg-clip">
        <video src={`${src}.mp4`} poster={c.poster ? `${src}.jpg` : undefined} controls muted playsInline preload="metadata" aria-label={c.shot} />
        <figcaption>Recorded in {c.via.toLowerCase()}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="gg-clip gg-clip-empty">
      <div className="gg-clip-frame" role="img" aria-label={`Recording coming soon: ${c.shot}`}>
        <span className="gg-clip-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z" /></svg>
        </span>
        <span className="gg-clip-tag">Recording coming soon</span>
        <p className="gg-clip-shot">{c.shot}</p>
      </div>
      <figcaption>{c.via}</figcaption>
    </figure>
  );
}

const cases = [
  {
    id: "weekly",
    title: "A weekly review in one question",
    body: "Standups and weekly updates start with remembering. Your work arrives grouped by project, across every tool.",
    via: "Chat assistant",
    tools: ["recent_activity", "list_projects"],
    shot: "Ask a chat assistant “What did I work on this week?” and get an answer grouped by project.",
    clip: false,
    scope: "Share the projects you would report on. Leave client work out.",
  },
  {
    id: "handoff",
    title: "Start in one tool, finish in another",
    body: "Your coding agent can read what a different tool did in the same repository, so a new session starts with context.",
    via: "Coding agent",
    tools: ["get_project_context"],
    shot: "Codex picks up a task in the same repository that Claude Code started two hours earlier.",
    clip: false,
    scope: "Same folder, two tools, one project. Worktrees are filed under their repository.",
  },
  {
    id: "nudge",
    title: "A Monday nudge for stale pull requests",
    body: "A scheduled agent checks what you opened and never saw merged, and posts it where you will see it.",
    via: "Scheduled agent",
    tools: ["list_pull_requests"],
    shot: "A scheduled agent posts Monday’s list of pull requests that were opened but never seen merged.",
    clip: false,
    scope: "Status comes from what the session showed. It does not ask GitHub.",
  },
  {
    id: "writeup",
    title: "The Friday update, drafted",
    body: "A changelog or status email starts from the commits and issues that actually happened, with the evidence behind each.",
    via: "Email draft",
    tools: ["list_commits", "list_issues"],
    shot: "An email draft of the Friday update, built from the week’s commits and issues.",
    clip: false,
    scope: "Issue titles and states are sent. Descriptions and comments never are.",
  },
  {
    id: "voice",
    title: "Ask out loud on the commute",
    body: "Any voice assistant that can call MCP tools can answer from your recent work without you opening a laptop.",
    via: "Voice assistant",
    tools: ["recent_activity"],
    shot: "A voice assistant answers “What did I ship this week?” from your recent work.",
    clip: false,
    scope: "Answers are only as private as the assistant you ask. The token can only read.",
  },
  {
    id: "brag",
    title: "A performance review without the scramble",
    body: "Pull a year of pull requests and commits into highlights, while the work is still on your mind and in the record.",
    via: "Document",
    tools: ["list_pull_requests", "list_commits"],
    shot: "A year of pull requests and commits turned into review highlights in a document.",
    clip: false,
    scope: "Looks back up to 365 days. Only what you chose to share.",
  },
  {
    id: "standup",
    title: "Walk into standup ready",
    body: "A calendar assistant can attach yesterday, today and what is still open to the invite, ten minutes before.",
    via: "Calendar assistant",
    tools: ["recent_activity", "get_project_context"],
    shot: "A calendar assistant attaches yesterday and what is still open to the standup invite.",
    clip: false,
    scope: "Reads summaries, never transcripts.",
  },
  {
    id: "redo",
    title: "Don't solve it twice",
    body: "Before an agent starts, it can search your past work and notice you already fixed something like this.",
    via: "Editor agent",
    tools: ["search_work", "get_session"],
    shot: "An editor agent notices you already fixed a similar redirect bug and offers that approach.",
    clip: false,
    scope: "Search covers titles and summaries. Raw transcripts never leave your machine.",
  },
  {
    id: "chats",
    title: "Bring your chat history along",
    body: "Export claude.ai or ChatGPT and those conversations become projects beside your code, each shared by its own rule.",
    via: "Chat assistant",
    tools: ["search_work", "get_session"],
    shot: "An assistant answers from an imported claude.ai conversation about the database schema.",
    clip: false,
    scope: "Artifacts and uploads travel as metadata only: id, title and status.",
  },
  {
    id: "clients",
    title: "Keep client work out of it",
    body: "Share the projects you choose and deny the rest. A deny rule always wins, even over a broader allow.",
    via: "Chat assistant",
    tools: ["list_projects"],
    shot: "Asking about a denied project: the assistant says it cannot see it.",
    clip: false,
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
                  <div className="gg-case-surface"><Clip c={c} /></div>
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
