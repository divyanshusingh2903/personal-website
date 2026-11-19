import { Link } from "react-router-dom";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";

// Written from each project's own README and GitHub page, read on 2026-11-19. Describe what they say they do;
// do not claim what they lack. Re-check a project before changing its card, and keep the date below in step.
const CHECKED = "19 November 2026";

const axes = ["Golden Gate", "Local session search", "Memory servers", "Export importers"];
const rows = [
  ["Where it runs", "A laptop app and a server you run", "One machine", "A server you run (some also run locally)", "One machine"],
  ["How history gets in", "Reads the session files already on disk, and chat exports", "Reads the session files already on disk", "Hooks and tools in your agents write into it", "Reads chat exports"],
  ["What an assistant gets", "Redacted summaries, read-only", "Search over transcripts and handoff packages", "Stored memories and facts, read and write", "Memories you accepted"],
  ["Reaching a web assistant", "Remote MCP with a token or OAuth", "Local MCP over stdio", "Some offer remote MCP and OAuth", "Local MCP over stdio"],
  ["Before anything leaves", "An approval inbox, the exact payload preview, receipts, retract", "Nothing is sent anywhere", "Varies; some have capture controls", "Nothing is sent anywhere"],
  ["Who sees which project", "Per-assistant grants and a look-back window", "Not applicable on one machine", "Varies; some have multi-user auth", "Not applicable"],
];

const groups = [
  {
    id: "local",
    title: "Search your sessions on one machine",
    lede: "The closest in what they read: the same session files Golden Gate reads. They stay on your computer.",
    items: [
      {
        name: "sessions",
        url: "https://github.com/nicknisi/sessions",
        license: "MIT",
        offers: "One full-text index over Claude Code, Codex, Pi and OpenCode. Fuzzy find and resume from the terminal, an MCP server for agents, and usage reports.",
        differs: "It searches everything on one machine over local stdio. Golden Gate sends only the projects you pick, to a server a web assistant can reach.",
      },
      {
        name: "sessionwiki",
        url: "https://github.com/jbellis/sessionwiki",
        license: "MIT",
        offers: "Full-text search across about a dozen coding tools, and a trace from a file back to the session that wrote it. Local and read-only, with summaries written by your own LLM command.",
        differs: "It answers you at your desk. Golden Gate carries a reviewed summary to an assistant that is not on your machine.",
      },
      {
        name: "ai-session-hub",
        url: "https://github.com/VangelisHaha/ai-session-hub",
        license: "MIT",
        offers: "A Rust command line and stdio MCP server for search, recall and handoff packages across Claude Code, Codex, Kiro, Gemini and OpenCode.",
        differs: "Its README says nothing is redacted automatically. Golden Gate redacts before anything leaves and shows you the exact payload first.",
      },
      {
        name: "Agent Sessions",
        url: "https://github.com/jazzyalex/agent-sessions",
        license: "MIT",
        offers: "A local-first macOS app to browse, search, analyze and resume sessions across Codex, Claude Code, OpenCode, Cursor and more.",
        differs: "A viewer for you, on macOS. Golden Gate is for assistants, and runs on Linux, macOS and Windows.",
      },
      {
        name: "cross-session-mcp",
        url: "https://github.com/reiarseni/cross-session-mcp",
        license: "MIT",
        offers: "An MCP server and command line that index, summarize and hand off sessions between Claude Code, Codex, Cursor, Copilot, OpenCode and Antigravity. Secrets, emails and phone numbers are redacted before the transcript goes to Gemini for summaries.",
        differs: "Its summaries come from the Gemini API. Golden Gate writes them with local rules by default, and a model, including a local one, is opt-in.",
      },
    ],
  },
  {
    id: "memory",
    title: "A memory server your agents write to",
    lede: "The closest in shape: a server you run, with remote MCP. They are built around memory that agents save, not around your history.",
    items: [
      {
        name: "ai-memory",
        url: "https://github.com/akitaonrails/ai-memory",
        license: "MIT",
        offers: "A server you run that memory from more than twenty coding tools feeds through installed hooks. Handoffs between agents, across machines, multi-user with an audit log, and capture controls on the client such as ignored paths and an allowlist mode.",
        differs: "It captures live work through hooks and lets agents continue it. Golden Gate reads history already on disk, sends after you approve, and gives assistants read access only.",
      },
      {
        name: "mcp-memory-service",
        url: "https://github.com/doobidoo/mcp-memory-service",
        license: "Apache-2.0",
        offers: "A self-hosted memory backend with REST, MCP and OAuth 2.0 with dynamic client registration. claude.ai and ChatGPT connect over remote MCP. A knowledge graph, and hooks for Codex and other tools.",
        differs: "It stores what agents decide to save. Golden Gate is a window onto the work you did, grouped by project, with a grant per assistant.",
      },
      {
        name: "Mem0",
        url: "https://github.com/mem0ai/mem0",
        license: "Apache-2.0",
        offers: "A memory layer for AI agents and apps, as a library, a self-hosted server or a cloud platform.",
        differs: "General memory infrastructure for apps you build. Golden Gate does one job: your coding and chat history, with you choosing what is shared.",
      },
    ],
  },
  {
    id: "exports",
    title: "Bring your chat history home",
    lede: "Golden Gate also reads claude.ai and ChatGPT data exports, beside your coding sessions.",
    items: [
      {
        name: "foxpack",
        url: "https://github.com/itsryanarmani/foxpack",
        license: "MIT",
        offers: "Imports ChatGPT, Claude and Gemini exports into a local store. You accept or reject each memory it extracts, and a read-only MCP server over stdio hands the accepted ones to an agent. Its README says it makes no network calls.",
        differs: "It stays on one machine. Golden Gate treats an export as one more source, shares single conversations, and serves them from your own server.",
      },
    ],
  },
];

const different = [
  ["Your history, not new memory", "Golden Gate reads the session files your tools already wrote, and your chat exports. There is nothing to install in your agents to start."],
  ["You approve before it leaves", "New sessions wait in an inbox. You see the exact outgoing payload, every automatic send is logged, and a session you retract is deleted from the server."],
  ["Summaries, not transcripts", "Titles, goals, outcomes, files and command names cross. Raw transcripts, tool output and file contents never do."],
  ["Read-only for the assistant", "Every MCP tool only reads. An assistant cannot write to your history or change what is shared."],
  ["A grant per assistant", "Each assistant sees only the projects you grant it, inside a look-back window you set. A new project is visible to none."],
  ["A server you own", "Your laptop pushes to a server you run. The server never reaches back into your disk."],
];

const instead = [
  "You want agents to save and recall their own notes, or to hand a live session to another agent: ai-memory or mcp-memory-service.",
  "You only need to search your own history at your desk: sessions or sessionwiki, with nothing to host.",
  "You want a knowledge graph or a general memory layer inside an app you are building: mcp-memory-service or Mem0.",
  "You want several people on one memory server with an audit log: ai-memory.",
];

function GoldenGateCompare() {
  return (
    <GoldenGateShell title="Compare | Golden Gate">
      <section className="gg-page-head">
        <div className="gg-wrap">
          <h1>How it compares</h1>
          <p className="gg-lede">Many tools remember your coding sessions. Golden Gate is the one built around you choosing what an assistant can read.</p>
        </div>
      </section>

      <section className="gg-section" id="different">
        <div className="gg-wrap">
          <h2>What is different</h2>
          <div className="gg-l-grid">
            {different.map(([title, body]) => (
              <div className="gg-l-cell" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="at-a-glance">
        <div className="gg-wrap gg-narrow">
          <h2>At a glance</h2>
          <p className="gg-more">Four kinds of tool, described as a group. The cards below say who is in each, and exceptions are noted there.</p>
          <div className="gg-table-wrap">
            <table className="gg-compare">
              <thead>
                <tr>
                  <td />
                  {axes.map((a) => <th key={a} scope="col">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(([what, ...cells]) => (
                  <tr key={what}>
                    <th scope="row">{what}</th>
                    {cells.map((c, i) => <td key={axes[i]} data-label={axes[i]}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {groups.map((g, n) => (
        <section className={n % 2 === 0 ? "gg-section" : "gg-section gg-section-sunk"} id={g.id} key={g.id}>
          <div className="gg-wrap">
            <h2>{g.title}</h2>
            <p className="gg-more">{g.lede}</p>
            <div className="gg-cmp-grid">
              {g.items.map((p) => (
                <article className="gg-cmp" key={p.name}>
                  <h3>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>
                    <span>{p.license}</span>
                  </h3>
                  <p><strong>What it offers.</strong> {p.offers}</p>
                  <p><strong>How Golden Gate differs.</strong> {p.differs}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="gg-section" id="instead">
        <div className="gg-wrap gg-split">
          <div>
            <h2>Pick something else if</h2>
            <ul className="gg-risks">
              {instead.map((t) => <li key={t}><span aria-hidden="true">{"▸"}</span><p>{t}</p></li>)}
            </ul>
          </div>
          <div>
            <h2>Where Golden Gate stands</h2>
            <p className="gg-more">Golden Gate is a beta from one author. It does not keep notes for agents, hand a live session to another agent, or serve several people from one server. It does one thing: it lets you decide which of your own work an assistant can read.</p>
            <p className="gg-more"><Link to="/goldengate/docs">Start with the docs</Link> · <Link to="/goldengate/security">Security model</Link> · <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></p>
          </div>
        </div>
        <div className="gg-wrap">
          <p className="gg-more">Written from each project's own README and GitHub page, read on {CHECKED}. These projects change quickly. If something here is out of date or unfair, <a href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener noreferrer">tell me</a> and I will fix it.</p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateCompare;
