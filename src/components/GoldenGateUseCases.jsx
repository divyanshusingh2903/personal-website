import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Logo, Mark } from "./GoldenGateBrand";
import MapArt from "./GoldenGateMap";
import { connectors, ingest } from "./goldengateSources";
import GoldenGateShell from "./GoldenGateShell";

// Tool names are the MCP tools Golden Gate Bridge serves. All are read-only.
// The sessions in every sample are invented; scheduling, posting and sending are done by whatever MCP client you connect.

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
      <MapArt />

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

// Each case plays its screen recording once public/goldengate/clips/<id>.mp4 exists and `clip: true` is set below
// (add <id>.jpg and `poster: true` for a poster frame). Until then the stage shows the question and the tool call it makes.
const cases = [
  {
    id: "weekly",
    title: "A weekly review in one question",
    body: "Your week, grouped by project, across every tool.",
    via: "Chat assistant",
    ask: "What did I work on this week?",
    call: 'recent_activity(days: 7)',
    tools: ["recent_activity", "list_projects"],
    scope: "Only the projects you share.",
  },
  {
    id: "handoff",
    title: "Start in one tool, finish in another",
    body: "Codex picks up where Claude Code stopped, in the same repo.",
    via: "Coding agent",
    ask: "Pick up the redirect fix Claude Code started.",
    call: 'get_project_context(project: "~/code/pharmfindr")',
    tools: ["get_project_context"],
    scope: "Worktrees are filed under their repository.",
  },
  {
    id: "nudge",
    title: "A Monday nudge for stale PRs",
    body: "A scheduled agent posts what you opened and never saw merged.",
    via: "Scheduled agent",
    ask: "Every Monday: which of my PRs never merged?",
    call: 'list_pull_requests(status: "created")',
    tools: ["list_pull_requests"],
    scope: "Status as of the session, not live from GitHub.",
  },
  {
    id: "writeup",
    title: "The Friday update, drafted",
    body: "Built from the commits and issues that actually happened.",
    via: "Email draft",
    ask: "Draft my Friday update from this week's commits.",
    call: "list_commits(days: 5)",
    tools: ["list_commits", "list_issues"],
    scope: "Issue titles and states only, never comments.",
  },
  {
    id: "voice",
    title: "Ask out loud on the commute",
    body: "Any voice assistant that speaks MCP can answer, no laptop needed.",
    via: "Voice assistant",
    ask: "What did I ship this week?",
    call: "recent_activity(days: 7)",
    tools: ["recent_activity"],
    scope: "The token can only read.",
  },
  {
    id: "brag",
    title: "A performance review, no scramble",
    body: "A year of PRs and commits, turned into highlights.",
    via: "Document",
    ask: "Pull my highlights from the past year.",
    call: "list_pull_requests(days: 365)",
    tools: ["list_pull_requests", "list_commits"],
    scope: "Looks back up to 365 days.",
  },
  {
    id: "standup",
    title: "Walk into standup ready",
    body: "Yesterday and what's still open, attached to the invite.",
    via: "Calendar assistant",
    ask: "Attach yesterday and what's open to my standup.",
    call: "recent_activity(days: 1)",
    tools: ["recent_activity", "get_project_context"],
    scope: "Summaries, never transcripts.",
  },
  {
    id: "redo",
    title: "Don't solve it twice",
    body: "Your agent notices you already fixed something like this.",
    via: "Editor agent",
    ask: "Have I fixed a redirect bug like this before?",
    call: 'search_work(query: "redirect")',
    tools: ["search_work", "get_session"],
    scope: "Searches titles and summaries only.",
  },
  {
    id: "chats",
    title: "Bring your chat history along",
    body: "claude.ai and ChatGPT exports become projects beside your code.",
    via: "Chat assistant",
    ask: "What did we decide about the database schema?",
    call: 'search_work(query: "schema")',
    tools: ["search_work", "get_session"],
    scope: "Chats are shared only by their own rule.",
  },
  {
    id: "clients",
    title: "Keep client work out of it",
    body: "Deny a project and the assistant never sees it. Deny always wins.",
    via: "Chat assistant",
    ask: "What did I do for client-acme?",
    call: "list_projects()",
    answer: "I can't see a project called client-acme.",
    tools: ["list_projects"],
    scope: "Denied sessions are dropped before parsing.",
  },
];

const STEP_MS = 7000;
const num = (i) => String(i + 1).padStart(2, "0");

function Stage({ c, i, onEnded }) {
  const src = `/goldengate/clips/${c.id}`;
  return (
    <div className="gg-ucp-screen">
      <div className="gg-ucp-bar" aria-hidden="true">
        <span className="gg-ucp-dots"><i /><i /><i /></span>
        <span>{c.via}</span>
        <span>{num(i)} / {num(cases.length - 1)}</span>
      </div>
      {c.clip ? (
        <video key={c.id} src={`${src}.mp4`} poster={c.poster ? `${src}.jpg` : undefined} autoPlay muted playsInline controls onEnded={onEnded} aria-label={`${c.title}: ${c.ask}`} />
      ) : (
        <div className="gg-ucp-mock" key={c.id}>
          <div className="gg-l-msg-u">{c.ask}</div>
          <div className="gg-l-call"><b>golden-gate</b> · {c.call}</div>
          {c.answer ? <div className="gg-l-msg-a"><p>{c.answer}</p></div> : <div className="gg-ucp-typing" aria-hidden="true"><i /><i /><i /></div>}
          <span className="gg-ucp-soon">Recording coming soon</span>
        </div>
      )}
    </div>
  );
}

function CasePlayer() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const rootRef = useRef(null);
  const c = cases[active];
  const next = useCallback(() => setActive((i) => (i + 1) % cases.length), []);

  // Without a recording, the cases step on their own while the player is on screen, until the visitor picks one.
  useEffect(() => {
    if (!auto || hold || c.clip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(next, STEP_MS);
    return () => clearTimeout(t);
  }, [auto, hold, active, c.clip, next]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setHold(!e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (i) => {
    setAuto(false);
    setActive(i);
  };

  const onKey = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = (active + step + cases.length) % cases.length;
    pick(i);
    document.getElementById(`case-tab-${cases[i].id}`)?.focus();
  };

  const running = auto && !hold && !c.clip;

  return (
    <div className="gg-ucp" ref={rootRef} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="gg-ucp-list" role="tablist" aria-orientation="vertical" aria-label="Use cases" onKeyDown={onKey}>
        {cases.map((x, i) => (
          <button
            key={x.id}
            id={`case-tab-${x.id}`}
            role="tab"
            aria-selected={i === active}
            aria-controls="case-panel"
            tabIndex={i === active ? 0 : -1}
            className="gg-ucp-tab"
            onClick={() => pick(i)}
          >
            <span className="gg-ucp-num">{num(i)}</span>
            <span className="gg-ucp-title">{x.title}</span>
            <span className="gg-ucp-via">{x.via}</span>
            {i === active && running && <span className="gg-ucp-progress" style={{ "--ms": `${STEP_MS}ms` }} key={active} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="gg-ucp-panel" id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${c.id}`}>
        <Stage c={c} i={active} onEnded={auto ? next : undefined} />
        <div className="gg-ucp-info">
          <div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
          <div className="gg-ucp-meta">
            <p className="gg-uc-tools">{c.tools.map((t) => <code key={t}>{t}</code>)}</p>
            <p className="gg-ucp-scope"><Icon name="shared" /> {c.scope}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoldenGateUseCases() {
  return (
    <GoldenGateShell title="Use cases | Golden Gate">
      <MapHero />

      <section className="gg-section">
        <div className="gg-wrap">
          <h2>What people ask it.</h2>
          <CasePlayer />
          <p className="gg-more">
            Golden Gate Bridge only reads. Scheduling, posting and sending are done by the tool you connect. <Link to="/goldengate/mcp">See every tool</Link>.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateUseCases;
