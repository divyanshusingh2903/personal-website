import { G } from "./Glossary";

// Horizontal comparison bars. kind: "base" (grey baseline), "ours" (Harbinger, carries the dot), "ink" (other arms).
export function Bars({ rows, max, unit = "", digits = 1 }) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <div className="bars" role="list">
      {rows.map((r) => (
        <div className="bars-row" role="listitem" key={r.label} data-kind={r.kind || "ink"}>
          <span className="bars-label">{r.label}</span>
          <div className="bars-track">
            <span className="bars-fill" style={{ width: `${Math.max(1.5, (r.value / top) * 100)}%` }}>
              {r.kind === "ours" && <i className="hb-dot" />}
            </span>
          </div>
          <strong className="bars-value">{r.text ?? `${r.value.toFixed(digits)}${unit}`}</strong>
        </div>
      ))}
    </div>
  );
}

// Signed change versus a baseline: left of the axis is better (lower), right is worse.
export function Deltas({ rows, span = 70, legend = ["← better than FIFO", "worse than FIFO →"], suffix = "%" }) {
  return (
    <div className="deltas" role="list">
      {rows.map((r) => {
        const w = Math.min(50, (Math.abs(r.value) / span) * 50);
        return (
          <div className="deltas-row" role="listitem" key={r.label} data-better={r.value < 0 ? "" : undefined}>
            <span className="deltas-label">{r.label}</span>
            <div className="deltas-track">
              <span className="deltas-axis" />
              <span className="deltas-fill" style={r.value < 0 ? { right: "50%", width: `${w}%` } : { left: "50%", width: `${w}%` }} />
            </div>
            <strong className="deltas-value">{r.value > 0 ? "+" : r.value < 0 ? "−" : ""}{Math.abs(r.value)}{suffix}</strong>
          </div>
        );
      })}
      <div className="deltas-legend"><span>{legend[0]}</span><span>{legend[1]}</span></div>
    </div>
  );
}

export function Facts({ items }) {
  return (
    <ul className="facts">
      {items.map(([v, l]) => (
        <li key={l}><strong>{v}</strong><span><G>{l}</G></span></li>
      ))}
    </ul>
  );
}
