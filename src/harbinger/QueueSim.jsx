import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { G, TermById } from "./Glossary";
import { advance, isDone, jobClass, makeJobs, newPanel, stats, AGE_AFTER, DEFAULT_MIX, N_JOBS, WEIGHTS } from "./simCore";

const SEED = 10;
const UNITS_PER_SECOND = 6;

function Pill({ job }) {
  const w = 14 + job.dur * 6.5;
  const note = job.cold ? " (cold start: default tier)" : job.aged ? " (promoted by aging)" : "";
  return (
    <span className="sim-pill" data-cls={jobClass(job)} data-cold={job.cold ? "" : undefined} style={{ width: w }} title={`${job.key}${note}`}>
      {w > 54 ? job.key : ""}
    </span>
  );
}

function Lane({ tag, weight, jobs }) {
  return (
    <div className="sim-lane">
      <span className="sim-lane-tag">{tag}{weight ? <em>×{weight}</em> : null}</span>
      <div className="sim-track">
        {jobs.map((j) => <Pill key={j.id} job={j} />)}
      </div>
      <span className="sim-count">{jobs.length || ""}</span>
    </div>
  );
}

function Worker({ cur }) {
  const pct = cur ? Math.max(0, Math.min(100, (1 - cur.left / cur.dur) * 100)) : 0;
  return (
    <div className="sim-worker" data-busy={cur ? "" : undefined}>
      <span className="sim-lane-tag">worker</span>
      {cur ? (
        <div className="sim-run" data-cls={jobClass(cur)} style={{ width: 14 + cur.dur * 6.5 }}>
          <span className="sim-run-fill" style={{ width: `${pct}%` }} />
          <i className="hb-dot" />
        </div>
      ) : (
        <span className="sim-idle">idle</span>
      )}
    </div>
  );
}

function Stat({ label, value, delta }) {
  return (
    <div className="sim-stat">
      <span>{label}</span>
      <strong>{value == null ? "—" : value.toFixed(1)}</strong>
      {delta !== undefined && <em>{delta}</em>}
    </div>
  );
}

function Panel({ title, sub, panel, base, finished }) {
  const weighted = panel.mode === "w";
  const paused = weighted && panel.t - panel.pausedAt < 2;
  const s = stats(panel);
  const b = base ? stats(base) : null;
  const pct = (a, c) => (a == null || c == null ? undefined : `${a <= c ? "−" : "+"}${Math.abs(Math.round((1 - a / c) * 100))}%`);
  const fifo = panel.mode === "fifo";
  return (
    <div className="sim-panel" data-mode={panel.mode}>
      <header>
        <h3>
          {fifo ? <TermById id="fifo">{title}</TermById> : title}
          {weighted && <span className="sim-chip" data-on={paused ? "" : undefined}>{paused ? "aging paused" : "pausing aging"}</span>}
        </h3>
        <p><G>{sub}</G></p>
      </header>
      <div className="sim-body">
        <div className="sim-lanes">
          {fifo ? (
            <Lane tag="queue" jobs={panel.lanes[0]} />
          ) : (
            <>
              <Lane tag="L0" weight={weighted ? WEIGHTS[0] : null} jobs={panel.lanes[0]} />
              <Lane tag="L1" weight={weighted ? WEIGHTS[1] : null} jobs={panel.lanes[1]} />
              <Lane tag="L2" weight={weighted ? WEIGHTS[2] : null} jobs={panel.lanes[2]} />
            </>
          )}
        </div>
        <Worker cur={panel.cur} />
      </div>
      <footer>
        <Stat label="avg wait" value={s.mean} delta={finished && b ? pct(s.mean, b.mean) : undefined} />
        <Stat label="short-job wait" value={s.short} delta={finished && b ? pct(s.short, b.short) : undefined} />
        <Stat label="longest wait" value={s.longest} delta={finished && b ? pct(s.longest, b.longest) : undefined} />
        <span className="sim-done">{s.n}/{N_JOBS} done</span>
      </footer>
    </div>
  );
}

function SimInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sim-info" ref={ref}>
      <span>Illustrative simulation, not the benchmark.</span>
      <button type="button" aria-expanded={open} aria-controls="sim-info-pop" onClick={() => setOpen((o) => !o)}>
        <b aria-hidden="true">i</b> About this simulation
      </button>
      {open && (
        <div className="sim-pop" id="sim-info-pop" role="dialog" aria-label="About this simulation">
          <ul>
            <li>One worker serves both panels, and the arrivals are identical. A burst at the start builds a backlog, like a flash sale.</li>
            <li>Aging kicks in after {AGE_AFTER} time units. That is much quicker than a real deployment, and it is deliberate: it shows what a long backlog does to strict priority.</li>
            <li>Harbinger starts cold. It learns each job type's cost from the jobs it has finished.</li>
            <li>The arrival sequence was picked for readability at the default mix. Over the 12 sequences I tried at that mix, average wait beat FIFO in all 12 with strict priority and in 11 with weights. Weights beat strict priority in 9.</li>
            <li>Weights cut average wait but raise the longest wait.</li>
          </ul>
          <Link to="/harbinger/experiments">See the measured results →</Link>
        </div>
      )}
    </div>
  );
}

const createSim = (mode, mix) => {
  const sim = { jobs: makeJobs(SEED, mix), fifo: newPanel("fifo"), h: newPanel(mode) };
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    while (!(isDone(sim.fifo, sim.jobs) && isDone(sim.h, sim.jobs))) { advance(sim.fifo, sim.jobs, 1); advance(sim.h, sim.jobs, 1); }
  }
  return sim;
};

export default function QueueSim() {
  const [mode, setMode] = useState("h");
  const [mix, setMix] = useState(DEFAULT_MIX);
  const [sim, setSim] = useState(() => createSim("h", DEFAULT_MIX));
  const [, redraw] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const { jobs, fifo, h } = sim;

  const reset = (next = mode, nextMix = mix) => {
    setMode(next);
    setMix(nextMix);
    setSim(createSim(next, nextMix));
    setPaused(false);
  };
  // One slider, two handles: the first marks where short jobs end, the second where medium jobs end.
  const cutA = mix.short;
  const cutB = mix.short + mix.mid;
  const moveCut = (which, value) => {
    const a = which === "a" ? Math.min(value, cutB) : cutA;
    const b = which === "b" ? Math.max(value, cutA) : cutB;
    reset(mode, { short: a, mid: b - a, long: 100 - b });
  };

  const finished = isDone(fifo, jobs) && isDone(h, jobs);
  const running = !paused && !finished;

  useEffect(() => {
    if (!running) return undefined;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const span = Math.min((now - last) / 1000, 0.25) * speed * UNITS_PER_SECOND;
      last = now;
      advance(fifo, jobs, span);
      advance(h, jobs, span);
      redraw((n) => n + 1);
    }, 33);
    return () => clearInterval(timer);
  }, [running, speed, jobs, fifo, h]);

  return (
    <div className="sim">
      <div className="sim-panels">
        <Panel title="FIFO" sub="One lane. A long job blocks everything behind it." panel={fifo} />
        <Panel title="Harbinger" sub={mode === "w" ? "Levels share worker time (8 : 3 : 1), and aging pauses while the level above is behind." : "Predicts each message's cost, then serves cheap work first."} panel={h} base={fifo} finished={finished} />
      </div>
      <div className="sim-mode" role="group" aria-label="Harbinger scheduling mode">
        <span>Harbinger mode</span>
        <button type="button" aria-pressed={mode === "h"} onClick={() => reset("h")}>Strict priority</button>
        <button type="button" aria-pressed={mode === "w"} onClick={() => reset("w")}>Weighted + pausing aging</button>
      </div>
      <div className="sim-mix">
        <span className="sim-mix-title">Job mix</span>
        <div className="dual" role="group" aria-label="Job mix: drag the two handles to split short, medium and long jobs">
          <div className="dual-track" aria-hidden="true">
            <i data-cls="short" style={{ width: `${mix.short}%` }} />
            <i data-cls="mid" style={{ width: `${mix.mid}%` }} />
            <i data-cls="long" style={{ width: `${mix.long}%` }} />
          </div>
          <input type="range" min="0" max="100" step="5" value={cutA} style={{ zIndex: cutA === cutB && cutA >= 50 ? 3 : 2 }} onChange={(e) => moveCut("a", +e.target.value)} aria-label="Where short jobs end" aria-valuetext={`${mix.short}% short`} />
          <input type="range" min="0" max="100" step="5" value={cutB} style={{ zIndex: cutA === cutB && cutA < 50 ? 3 : 2 }} onChange={(e) => moveCut("b", +e.target.value)} aria-label="Where medium jobs end" aria-valuetext={`${mix.long}% long`} />
        </div>
        <output>
          <i data-cls="short" />{mix.short}% short
          <i data-cls="mid" />{mix.mid}% medium
          <i data-cls="long" />{mix.long}% long
        </output>
      </div>
      <div className="sim-bar">
        <div className="sim-legend" aria-hidden="true">
          <span><i data-cls="short" />short</span>
          <span><i data-cls="mid" />medium</span>
          <span><i data-cls="long" />long</span>
          <span><i data-cold="" />cold start</span>
        </div>
        <div className="sim-controls">
          <button type="button" onClick={() => setPaused((p) => !p)} disabled={finished}>{running ? "Pause" : "Play"}</button>
          {[1, 2, 4].map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
          <button type="button" onClick={() => reset()}>Replay</button>
        </div>
      </div>
      <SimInfo />
    </div>
  );
}
