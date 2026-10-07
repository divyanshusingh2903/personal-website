import { useEffect, useState } from "react";
import { G } from "./Glossary";

const STAGES = [
  { id: "producer", name: "Producer", sub: "send()", chips: ["gRPC Submit", "job_type", "size"] },
  { id: "proxy", name: "Proxy", sub: "accept()", chips: ["message ID", "arrival time", "producer id"] },
  { id: "predictor", name: "Predictor", sub: "route_message()", chips: ["key lookup", "median", "tier"] },
  { id: "queue", name: "Queue", sub: "three levels", chips: ["L0 · short", "L1 · medium", "L2 · long"] },
  { id: "consumer", name: "Consumers", sub: "Pull()", chips: ["tier-blind", "run handler", "Ack with ms"] },
];

// stage: which stage holds the dot. aging / loop: extra highlights for those steps.
const STEPS = [
  { stage: 0, title: "Submit", text: "A producer sends a message over gRPC. It can attach a job_type header, and optionally a size, so the broker can tell its jobs apart." },
  { stage: 1, title: "Stamp", text: "The proxy assigns an ID, the arrival time and the broker-assigned producer id. Clients can't forge that id." },
  { stage: 2, title: "Predict", text: "route_message() looks up the message's key and reads the median of its learned duration histogram. That estimate becomes a tier through boundaries learned from global quantiles." },
  { stage: 3, title: "Queue", text: "The message joins a level. Strict priority between levels, FIFO within a level. Cold or unpredictable keys take the middle tier." },
  { stage: 3, aging: true, title: "Age", text: "A message that waits too long is promoted one level at a time, so expensive jobs are delayed but never starved." },
  { stage: 4, title: "Pull", text: "Consumers are tier-blind. They just pull, and the broker decides which message each pull receives." },
  { stage: 2, loop: true, title: "Learn", text: "The consumer Acks with processing_time_ms, and the predictor learns from it. Failures retry, then land in the dead-letter queue." },
];

function Stage({ s, i, active, aging, loop, onPick }) {
  return (
    <button type="button" className="fx-stage" data-on={active ? "" : undefined} data-aging={aging ? "" : undefined} onClick={() => onPick(i)}>
      <span className="fx-pin" aria-hidden="true"><i /></span>
      <strong>{s.name}</strong>
      <span>{s.sub}</span>
      <span className="fx-tiers" aria-hidden="true">
        {s.chips.map((c) => <b key={c}>{c}</b>)}
      </span>
      {s.id === "queue" && (
        <span className="fx-foot">
          <small className="fx-aging">↑ aging</small>
          <small className="fx-dlq" data-on={loop ? "" : undefined}>retries → DLQ</small>
        </span>
      )}
    </button>
  );
}

export default function FlowDiagram() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const step = STEPS[i];

  useEffect(() => {
    if (!auto || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % STEPS.length), 3600);
    return () => clearInterval(id);
  }, [auto]);

  const go = (n) => { setAuto(false); setI((n + STEPS.length) % STEPS.length); };
  const pick = (stage) => go(STEPS.findIndex((s) => s.stage === stage));
  const progress = step.loop ? 100 : (step.stage / (STAGES.length - 1)) * 100;

  return (
    <div className="fx">
      <div className="fx-stages">
        <div className="fx-rail" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        {STAGES.map((s, n) => (
          <Stage key={s.id} s={s} i={n} active={n === step.stage} aging={step.aging && n === step.stage} loop={step.loop} onPick={pick} />
        ))}
      </div>
      <div className="fx-return" data-on={step.loop ? "" : undefined} aria-hidden="true">
        <span>↩ Ack · processing_time_ms trains the predictor</span>
      </div>

      <div className="fx-caption" aria-live="polite">
        <div className="fx-text">
          <span className="fx-step">{i + 1} / {STEPS.length}</span>
          <h3>{step.title}</h3>
          <p><G>{step.text}</G></p>
        </div>
        <div className="fx-nav">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous step">←</button>
          <div role="tablist" aria-label="Flow steps">
            {STEPS.map((s, n) => (
              <button key={s.title} type="button" role="tab" aria-selected={n === i} aria-label={s.title} onClick={() => go(n)} />
            ))}
          </div>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next step">→</button>
        </div>
      </div>
    </div>
  );
}
