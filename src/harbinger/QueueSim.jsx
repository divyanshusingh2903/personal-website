import { useEffect, useState } from "react";
import { G, TermById } from "./Glossary";
import { advance, isDone, jobClass, makeJobs, newPanel, stats, AGE_AFTER, N_JOBS } from "./simCore";

const SEED = 3;
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

function Lane({ tag, jobs }) {
  return (
    <div className="sim-lane">
      <span className="sim-lane-tag">{tag}</span>
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
      <strong>{value === null ? "—" : value.toFixed(1)}</strong>
      {delta !== undefined && <em>{delta}</em>}
    </div>
  );
}

function Panel({ title, sub, panel, base, finished }) {
  const s = stats(panel);
  const b = base ? stats(base) : null;
  const pct = (a, c) => (a === null || c === null ? undefined : `${a <= c ? "−" : "+"}${Math.abs(Math.round((1 - a / c) * 100))}%`);
  const fifo = panel.mode === "fifo";
  return (
    <div className="sim-panel" data-mode={panel.mode}>
      <header>
        <h3>{fifo ? <TermById id="fifo">{title}</TermById> : title}</h3>
        <p><G>{sub}</G></p>
      </header>
      <div className="sim-body">
        <div className="sim-lanes">
          {fifo ? (
            <Lane tag="queue" jobs={panel.lanes[0]} />
          ) : (
            <>
              <Lane tag="L0" jobs={panel.lanes[0]} />
              <Lane tag="L1" jobs={panel.lanes[1]} />
              <Lane tag="L2" jobs={panel.lanes[2]} />
            </>
          )}
        </div>
        <Worker cur={panel.cur} />
      </div>
      <footer>
        <Stat label="avg wait" value={s.mean} delta={finished && b ? pct(s.mean, b.mean) : undefined} />
        <Stat label="short-job wait" value={s.short} delta={finished && b ? pct(s.short, b.short) : undefined} />
        <span className="sim-done">{s.n}/{N_JOBS} done</span>
      </footer>
    </div>
  );
}

const createSim = () => {
  const sim = { jobs: makeJobs(SEED), fifo: newPanel("fifo"), h: newPanel("h") };
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    while (!(isDone(sim.fifo, sim.jobs) && isDone(sim.h, sim.jobs))) { advance(sim.fifo, sim.jobs, 1); advance(sim.h, sim.jobs, 1); }
  }
  return sim;
};

export default function QueueSim() {
  const [sim, setSim] = useState(createSim);
  const [, redraw] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const { jobs, fifo, h } = sim;

  const reset = () => {
    setSim(createSim());
    setPaused(false);
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
        <Panel title="Harbinger" sub="Predicts each message's cost, then serves cheap work first." panel={h} base={fifo} finished={finished} />
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
          <button type="button" onClick={reset}>Replay</button>
        </div>
      </div>
      <p className="sim-note"><G>
        Illustrative simulation, not the benchmark: one worker, identical arrivals, aging after {AGE_AFTER} time units. The arrival sequence was picked for readability; Harbinger lowered average wait on all 12 sequences I tried.
        Harbinger starts cold and learns each key's cost from completed jobs. The measured results are on the Experiments page.
      </G></p>
    </div>
  );
}
