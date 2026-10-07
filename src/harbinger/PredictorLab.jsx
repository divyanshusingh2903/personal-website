import { useEffect, useMemo, useRef, useState } from "react";

// Illustrative per-key duration streams (ms), deterministic so the demo is repeatable.
const BOUNDS = [20, 500];
const MIN_SAMPLES = 20;
const MAX_SPREAD = 16;
const BINS = 24;
const LO = 0;
const HI = 4;

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(r) {
  return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}
function lognormalStream(seed, median, sigma, n) {
  const r = seeded(seed);
  return Array.from({ length: n }, () => median * Math.exp(sigma * normal(r)));
}
const N = 90;
const KEYS = [
  { id: "push_notification", note: "gateway call", data: lognormalStream(11, 9, 0.3, N) },
  { id: "generate_invoice", note: "scales with line items", data: lognormalStream(23, 14, 0.45, N) },
  { id: "send_order_email", note: "render + SMTP", data: lognormalStream(37, 40, 0.4, N) },
  { id: "export_report", note: "millions of rows", data: lognormalStream(41, 1800, 0.3, N) },
  {
    id: "deliver_webhook",
    note: "usually fast, sometimes very slow",
    data: (() => {
      const r = seeded(59);
      return Array.from({ length: N }, (_, i) =>
        i % 50 === 7 ? 1500 : i % 8 === 3 ? 300 * (0.9 + 0.2 * r()) : 40 * (0.85 + 0.3 * r()),
      );
    })(),
  },
];

function quantile(sorted, q) {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}
const xOf = (ms) => ((Math.log10(Math.max(ms, 1)) - LO) / (HI - LO)) * 100;

function KeyRow({ k, n }) {
  const view = useMemo(() => {
    const s = k.data.slice(0, n);
    const bins = Array(BINS).fill(0);
    for (const v of s) {
      const b = Math.min(BINS - 1, Math.max(0, Math.floor(((Math.log10(Math.max(v, 1)) - LO) / (HI - LO)) * BINS)));
      bins[b]++;
    }
    const sorted = [...s].sort((a, b) => a - b);
    const med = sorted.length ? quantile(sorted, 0.5) : null;
    const spread = sorted.length ? quantile(sorted, 0.99) / med : null;
    return { bins, med, spread, count: s.length };
  }, [k, n]);

  let state;
  if (view.count < MIN_SAMPLES) state = { label: `cold · ${view.count}/${MIN_SAMPLES} samples`, tier: 1, kind: "fallback" };
  else if (view.spread > MAX_SPREAD) state = { label: `spread p99/p50 = ${Math.round(view.spread)} → default`, tier: 1, kind: "fallback" };
  else state = { label: `median ${view.med < 100 ? view.med.toFixed(0) : Math.round(view.med)} ms`, tier: view.med < BOUNDS[0] ? 0 : view.med < BOUNDS[1] ? 1 : 2, kind: "ok" };

  const peak = Math.max(1, ...view.bins);
  const ready = view.count >= MIN_SAMPLES;
  const medBin = view.med === null ? -1 : Math.min(BINS - 1, Math.max(0, Math.floor(((Math.log10(Math.max(view.med, 1)) - LO) / (HI - LO)) * BINS)));
  return (
    <div className="pl-row">
      <div className="pl-name">
        <strong>{k.id}</strong>
        <span>{k.note}</span>
      </div>
      <div className="pl-chart" aria-hidden="true">
        <span className="pl-zone" style={{ left: 0, width: `${xOf(BOUNDS[0])}%` }} />
        <span className="pl-zone" style={{ left: `${xOf(BOUNDS[0])}%`, width: `${xOf(BOUNDS[1]) - xOf(BOUNDS[0])}%` }} />
        <span className="pl-zone" style={{ left: `${xOf(BOUNDS[1])}%`, right: 0 }} />
        {view.bins.map((c, i) => {
          const isMedian = ready && i === medBin;
          return (
            <span key={i} className={`pl-bar${isMedian ? " is-median" : ""}`} style={{ left: `${(i / BINS) * 100}%`, width: `${100 / BINS - 0.6}%`, height: `${(c / peak) * 100}%` }}>
              {isMedian && <i className="hb-dot" />}
            </span>
          );
        })}
      </div>
      <div className="pl-state" data-kind={state.kind}>
        <b>L{state.tier}</b>
        <span>{state.label}</span>
      </div>
    </div>
  );
}

export default function PredictorLab() {
  const [n, setN] = useState(60);
  const timer = useRef(null);

  const replay = () => {
    clearInterval(timer.current);
    setN(0);
    timer.current = setInterval(() => {
      setN((v) => {
        if (v >= 60) {
          clearInterval(timer.current);
          return v;
        }
        return v + 1;
      });
    }, 110);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <div className="pl">
      <div className="pl-axis" aria-hidden="true">
        <span />
        <div>
          <em style={{ left: 0 }}>1 ms</em>
          <em style={{ left: `${xOf(BOUNDS[0])}%` }}>L0 | L1 · 20 ms</em>
          <em style={{ left: `${xOf(BOUNDS[1])}%` }}>L1 | L2 · 500 ms</em>
          <em style={{ right: 0 }}>10 s</em>
        </div>
        <span />
      </div>
      {KEYS.map((k) => <KeyRow key={k.id} k={k} n={n} />)}
      <div className="pl-controls">
        <label>
          <span>Completed jobs seen per key</span>
          <input type="range" min="0" max="60" value={n} onChange={(e) => { clearInterval(timer.current); setN(+e.target.value); }} />
          <strong>{n}</strong>
        </label>
        <button type="button" onClick={replay}>Replay cold start</button>
      </div>
    </div>
  );
}
