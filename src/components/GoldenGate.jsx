import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MapArt from "./GoldenGateMap";
import GoldenGateShell, { Clip, Code, GitHubButton } from "./GoldenGateShell";

const INSTALL = "go install github.com/divyanshusingh2903/goldengate/cmd/...@v1.1.1";

// The dashcam clip is 4:15 to 6:30 of a POV drive across the bridge; the readout counts the clip's own time from zero.
const DRIVE = { start: 0, src: "/goldengate/drive.mp4", poster: "/goldengate/drive-poster.jpg", credit: "https://www.youtube.com/watch?v=NcA8KTXyEUQ&t=255s" };

// The read tools Golden Gate Bridge serves over MCP.
const tools = ["recent_activity", "get_project_context", "search_work", "get_work_item", "list_pull_requests", "get_session"];

// Each promise is marked with the glyph the TUI itself uses for it.
const promises = [
  ["gg-l-x", "[x]", "Opt in, project by project", "Nothing leaves until you pick it."],
  ["gg-l-warn", "▲ 3", "An inbox, not a firehose", "New sessions wait for you or a rule you wrote."],
  ["gg-l-redact", "[REDACTED]", "Redacted twice", "Before and after summarizing, on your machine."],
  ["gg-l-bad", "[-]", "Block beats share", "A blocked folder never leaves, whatever its parent says."],
  ["gg-l-pac", "r/o", "Read-only agents", "No write tools. Each agent sees only what you grant."],
  ["gg-l-ok", "✓ receipt", "Receipts and retract", "Every automatic send is logged. Pull anything back."],
];

function Payload() {
  const [view, setView] = useState("json");
  return (
    <div className="gg-l-code">
      <div className="gg-l-tabs" role="tablist" aria-label="Payload view">
        <button role="tab" aria-selected={view === "json"} onClick={() => setView("json")}>Payload</button>
        <button role="tab" aria-selected={view === "cli"} onClick={() => setView("cli")}>Dry run</button>
      </div>
      {view === "json" ? (
        <pre>
          <span className="c">{"// session 3f9a · Golden Gate · approved"}</span>{"\n{\n  "}
          <span className="k">"source"</span>{": "}<span className="s">"claude-code"</span>{",\n  "}
          <span className="k">"title"</span>{": "}<span className="s">"Retry 400s from the summarizer"</span>{",\n  "}
          <span className="k">"work_items"</span>{": ["}<span className="s">"PR #110"</span>{", "}<span className="s">"1d426e1"</span>{"],\n  "}
          <span className="k">"files"</span>{": ["}<span className="s">"summarize/gemini.go"</span>{"],\n  "}
          <span className="k">"outcome"</span>{": "}<span className="s">"Key <mark>[REDACTED:aws-key]</mark> was in the log."</span>{",\n  "}
          <span className="k">"redactions"</span>{": 1\n}"}
        </pre>
      ) : (
        <pre>
          <span className="c">$</span>{" goldengate send --dry-run\n"}
          <span className="k">Golden Gate</span>{"     3 sessions   4.1 KB\n"}
          <span className="k">Vihayas</span>{"         1 session    1.2 KB\n"}
          <span className="c">{"client-acme     [-] blocked, nothing sent"}</span>{"\n\n"}
          <span className="s">✓</span>{" 4 sessions ready · 1 redaction"}
        </pre>
      )}
    </div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

function Drive() {
  const videoRef = useRef(null);
  const [clock, setClock] = useState(DRIVE.start);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (reduce.matches ? v.pause() : v.play().catch(() => {}));
    const tick = () => setClock(DRIVE.start + Math.floor(v.currentTime));
    sync();
    reduce.addEventListener("change", sync);
    v.addEventListener("timeupdate", tick);
    return () => {
      reduce.removeEventListener("change", sync);
      v.removeEventListener("timeupdate", tick);
    };
  }, []);

  return (
    <section className="gg-l-drive" id="start">
      <div className="gg-l-dash">
        <video ref={videoRef} muted loop playsInline preload="metadata" poster={DRIVE.poster} aria-label="Dashcam view of a drive across the Golden Gate Bridge">
          <source src={DRIVE.src} type="video/mp4" />
        </video>
        <div className="gg-l-hud gg-l-hud-tl" aria-hidden="true"><span className="gg-l-rec">● REC</span> CAM 01</div>
        <div className="gg-l-hud gg-l-hud-tr" aria-hidden="true">US-101 N<span className="gg-l-hud-wide"> · 37.8199° N 122.4783° W</span> · 45 MPH</div>
        <div className="gg-l-dash-copy">
          <div className="gg-wrap">
            <div>
              <span className="gg-l-timecode" aria-hidden="true">00:{pad(Math.floor(clock / 60))}:{pad(clock % 60)}</span>
              <h2>Set up in ten minutes.</h2>
              <p>The drive across takes about two.</p>
            </div>
            <div className="gg-actions">
              <Link className="gg-btn gg-btn-primary" to="/goldengate/docs#install">Quickstart</Link>
              <GitHubButton className="gg-gh-glass" />
            </div>
          </div>
        </div>
        <a className="gg-l-credit" href={DRIVE.credit} target="_blank" rel="noopener noreferrer">Footage: POV drive on YouTube</a>
      </div>
    </section>
  );
}

function GoldenGate() {
  return (
    <GoldenGateShell title="Golden Gate | Your work, carried across every agent">
      <section className="gg-l-hero">
        <div className="gg-wrap">
          <div className="gg-l-hero-top">
            <h1>Your work, carried <span>across</span> every agent.</h1>
            <div className="gg-l-hero-side">
              <p className="gg-l-lede">The bridge between the agents you code with and the assistants you ask. What you approve crosses, redacted, to a server you own.</p>
              <div className="gg-actions">
                <a className="gg-btn gg-btn-primary" href="#start">Get started</a>
                <GitHubButton />
              </div>
              <Code>{INSTALL}</Code>
            </div>
          </div>
          <figure className="gg-l-term">
            <Clip
              name="walkthrough"
              width={1500}
              height={836}
              alt="The Golden Gate TUI: searching for vihayas and sharing it, blocking client-acme, sharing three more projects, previewing a summary, then reviewing and sending twelve sessions until every shared project shows sent."
            />
            <figcaption><span><kbd>space</kbd> share</span><span><kbd>p</kbd> preview</span><span><kbd>s</kbd> send</span><span className="gg-l-sp" /><span>Recorded from the real TUI, synthetic sessions.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gg-l-band">
        <div className="gg-wrap">
          <h2>Data crosses one way.</h2>
          <div className="gg-l-map">
            <MapArt />
            <div className="gg-l-map-label gg-l-map-sf"><h3>Golden Gate</h3><p>reads your tools, on your laptop</p></div>
            <div className="gg-l-map-label gg-l-map-marin"><h3>Golden Gate Bridge</h3><p>serves anything that speaks MCP</p></div>
            <span className="gg-l-map-deck">laptop → your server → assistant</span>
            <a className="gg-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{"©"} OpenStreetMap contributors</a>
          </div>
        </div>
      </section>

      <section className="gg-l-band gg-section-sunk">
        <div className="gg-wrap">
          <div className="gg-l-ask">
            <div>
              <h2>Ask what you shipped.</h2>
              <p className="gg-l-sub">Codex, connected to a Golden Gate Bridge, answers from the week's sessions.</p>
            </div>
            <div>
              <ul className="gg-l-tools">{tools.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="gg-l-more"><Link to="/goldengate/mcp">Every MCP tool</Link> · <Link to="/goldengate/use-cases">Use cases</Link></p>
            </div>
          </div>
          <figure className="gg-l-term">
            <Clip
              name="ask-codex-dark"
              poster="ask-codex-poster.jpg"
              themed={false}
              width={1500}
              height={836}
              alt="Codex in a terminal. The question: I have been working a lot on goldengate this past week, can you tell me what has been achieved. Codex reads the week's sessions from Golden Gate Bridge and lists five areas of progress with pull request links: the web app, sharing controls, better agent context, new sources and setup polish."
            />
            <figcaption><span>Real Codex, real answer from the bridge.</span><span className="gg-l-sp" /><span>Most of that week was built with Claude Code; Codex reads it back.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gg-l-band">
        <div className="gg-wrap">
          <h2>Deny by default.</h2>
          <div className="gg-l-grid">
            {promises.map(([cls, glyph, title, body]) => (
              <div className="gg-l-cell" key={title}>
                <span className={`gg-l-glyph ${cls}`}>{glyph}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="gg-l-more"><Link to="/goldengate/security">Read the security model</Link></p>
        </div>
      </section>

      <section className="gg-l-band gg-l-band-tight">
        <div className="gg-wrap gg-l-split">
          <div>
            <h2>The preview is the payload.</h2>
            <p className="gg-l-sub">No transcripts, tool output or file contents. Press <kbd>P</kbd> for the raw bytes.</p>
          </div>
          <Payload />
        </div>
      </section>

      <Drive />
    </GoldenGateShell>
  );
}

export default GoldenGate;
