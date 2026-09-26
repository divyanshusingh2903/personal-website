import React, { useId, useMemo } from "react";
import { ballXY, buildStates, deriveArrows } from "./diagram";

const PITCH_L = 105;
const PITCH_W = 68;

/* ─── Geometry helpers ───────────────────────────────────── */

function trim(from, to, a, b) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const s = Math.min(a, len * 0.3);
  const e = Math.min(b, len * 0.3);
  return [
    [from[0] + ux * s, from[1] + uy * s],
    [to[0] - ux * e, to[1] - uy * e],
    len,
  ];
}

function arrowPath(arrow, r) {
  const { k, arc } = arrow;
  const [looseFrom, looseTo] = arrow.loose || [false, false];
  const endTrim = k === "shot" ? 0.3 : looseTo ? 0.55 : 1.15;
  const [a, b, len] = trim(arrow.from, arrow.to, r * (looseFrom ? 0.5 : 1.05), r * endTrim);
  if (k === "dribble") {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const amp = r * 0.32;
    const waves = Math.max(1, Math.round(l / (r * 1.8)));
    const steps = waves * 12;
    let d = `M ${a[0]} ${a[1]}`;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Taper the wave so it straightens into the arrowhead.
      const taper = t > 0.85 ? (1 - t) / 0.15 : 1;
      const o = Math.sin(t * waves * Math.PI * 2) * amp * taper;
      d += ` L ${a[0] + dx * t + nx * o} ${a[1] + dy * t + ny * o}`;
    }
    return d;
  }
  if (arc && len > 0) {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const bend = 0.22;
    return `M ${a[0]} ${a[1]} Q ${mx - dy * bend} ${my + dx * bend} ${b[0]} ${b[1]}`;
  }
  return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
}

/* ─── Field markings ─────────────────────────────────────── */

function PitchEnd({ gx }) {
  // Markings for the end whose goal line is at x = gx (goal on the right).
  return (
    <g>
      <rect x={gx - 16.5} y={13.84} width={16.5} height={40.32} />
      <rect x={gx - 5.5} y={24.84} width={5.5} height={18.32} />
      <circle cx={gx - 11} cy={34} r={0.25} className="pitch-spot" />
      <path d={`M ${gx - 16.5} 26.69 A 9.15 9.15 0 0 0 ${gx - 16.5} 41.31`} />
      <path d={`M ${gx - 1} 0 A 1 1 0 0 0 ${gx} 1`} />
      <path d={`M ${gx - 1} ${PITCH_W} A 1 1 0 0 1 ${gx} ${PITCH_W - 1}`} />
    </g>
  );
}

function Goal({ x, y, dir = "l", size = "full" }) {
  const w = size === "mini" ? 2.4 : 7.32;
  const d = size === "mini" ? 1 : 1.8;
  const props = {
    l: { x, y: y - w / 2, width: d, height: w },
    r: { x: x - d, y: y - w / 2, width: d, height: w },
    u: { x: x - w / 2, y, width: w, height: d },
    d: { x: x - w / 2, y: y - d, width: w, height: d },
  }[dir];
  return <rect className="pitch-goal" {...props} />;
}

function Field({ field, vb, outer, transform }) {
  const stripe = field.type === "grid" ? Math.max(field.w, field.h) / 7 : 5.25;
  const stripes = [];
  const x0 = Math.floor(vb[0] / stripe) - 1;
  const x1 = Math.ceil((vb[0] + vb[2]) / stripe) + 1;
  for (let i = x0; i < x1; i++) {
    if (i % 2 === 0) {
      stripes.push(
        <rect key={i} x={i * stripe} y={vb[1]} width={stripe} height={vb[3]} className="pitch-stripe" />,
      );
    }
  }

  let lines = null;
  if (field.type === "half") {
    lines = (
      <g className="pitch-lines">
        <rect x={0} y={0} width={52.5} height={PITCH_W} />
        <path d="M 0 24.85 A 9.15 9.15 0 0 1 0 43.15" />
        <circle cx={0} cy={34} r={0.25} className="pitch-spot" />
        <PitchEnd gx={52.5} />
      </g>
    );
  } else if (field.type === "full") {
    lines = (
      <g className="pitch-lines">
        <rect x={0} y={0} width={PITCH_L} height={PITCH_W} />
        <line x1={52.5} y1={0} x2={52.5} y2={PITCH_W} />
        <circle cx={52.5} cy={34} r={9.15} />
        <circle cx={52.5} cy={34} r={0.3} className="pitch-spot" />
        <PitchEnd gx={PITCH_L} />
        <g transform={`translate(${PITCH_L} 0) scale(-1 1)`}>
          <PitchEnd gx={PITCH_L} />
        </g>
      </g>
    );
  } else if (!field.bare) {
    lines = (
      <g className="pitch-lines pitch-lines-grid">
        <rect x={0} y={0} width={field.w} height={field.h} />
      </g>
    );
  }

  return (
    <>
      <rect x={outer[0]} y={outer[1]} width={outer[2]} height={outer[3]} className="pitch-grass" />
      <g transform={transform}>
        {stripes}
        {lines}
      </g>
    </>
  );
}

function viewBoxFor(field) {
  if (field.crop) {
    const [x0, y0, x1, y1] = field.crop;
    return [x0, y0, x1 - x0, y1 - y0];
  }
  if (field.type === "half") return [-3, -3, 52.5 + 6, PITCH_W + 6];
  if (field.type === "full") return [-3, -3, PITCH_L + 6, PITCH_W + 6];
  const pad = Math.max(field.w, field.h) * 0.07;
  return [-pad, -pad, field.w + pad * 2, field.h + pad * 2];
}

// Half pitches are drawn rotated so the team attacks upwards: this keeps the
// board landscape. Diagram data stays in goal-on-the-right coordinates.
const HALF_ROTATION = `translate(0 ${PITCH_L / 2}) rotate(-90)`;

function rotateBox([x, y, w, h]) {
  return [y, PITCH_L / 2 - x - w, h, w];
}

function Ladder({ x, y, len, w = 0.5, step = 0.45, vertical = false }) {
  const n = Math.round(len / step);
  const rungs = Array.from({ length: n + 1 }, (_, k) => k * (len / n));
  return vertical ? (
    <g className="pitch-ladder">
      <line x1={x} y1={y} x2={x} y2={y + len} />
      <line x1={x + w} y1={y} x2={x + w} y2={y + len} />
      {rungs.map((d) => (
        <line key={d} x1={x} y1={y + d} x2={x + w} y2={y + d} />
      ))}
    </g>
  ) : (
    <g className="pitch-ladder">
      <line x1={x} y1={y} x2={x + len} y2={y} />
      <line x1={x} y1={y + w} x2={x + len} y2={y + w} />
      {rungs.map((d) => (
        <line key={d} x1={x + d} y1={y} x2={x + d} y2={y + w} />
      ))}
    </g>
  );
}

function Foot({ x, y, side, angle = 0, labelled, faded }) {
  return (
    <g className={`foot foot-${side}${faded ? " is-faded" : ""}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse rx={0.13} ry={0.055} />
      {labelled && (
        <text fontSize={0.075} transform={`rotate(${-angle})`}>
          {side}
        </text>
      )}
    </g>
  );
}

function CallOut({ x, y, text, color, size }) {
  const w = text.length * size * 0.62 + size * 1.2;
  const h = size * 1.6;
  return (
    <g className={`callout callout-${color || "w"}`} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} />
      <text fontSize={size}>{text}</text>
    </g>
  );
}

/* ─── Pitch ──────────────────────────────────────────────── */

const Pitch = ({ diagram, states: givenStates, frame = 0, mini = false, instant = false, trail = false, label }) => {
  const uid = useId().replace(/:/g, "");
  const states = useMemo(() => givenStates || buildStates(diagram), [givenStates, diagram]);
  const { field } = diagram;
  const rotated = field.type === "half";
  const vb = useMemo(() => viewBoxFor(field), [field]);
  const outer = rotated ? rotateBox(vb) : vb;
  const r = diagram.r ?? Math.max(vb[2], vb[3]) * (mini ? 0.03 : 0.024);
  const upright = rotated ? " rotate(90deg)" : "";
  const idx = Math.min(frame, states.length - 1);
  const cur = states[idx];
  const allArrows = useMemo(
    () => states.map((s, i) => (i > 0 ? deriveArrows(states[i - 1], s, r) : [])),
    [states, r],
  );
  const arrows = allArrows[idx];
  let trailStart = 0;
  for (let i = idx; i > 0; i--) {
    if (states[i].reset) {
      trailStart = i;
      break;
    }
  }
  const trailArrows = trail ? allArrows.slice(trailStart + 1, idx).flat() : [];
  const trailFeet = trail ? states.slice(trailStart, idx).flatMap((s) => s.feet) : [];
  const labelFeet = Math.max(vb[2], vb[3]) < 4;

  const goals = [...(diagram.goals || [])];
  if (field.type === "half" || field.type === "full") goals.push({ x: 52.5 * (field.type === "full" ? 2 : 1), y: 34, dir: "l" });
  if (field.type === "full") goals.push({ x: 0, y: 34, dir: "r" });

  const gridCorners =
    field.type === "grid" && !field.bare && field.corners !== false
      ? [[0, 0], [field.w, 0], [0, field.h], [field.w, field.h]]
      : [];

  const stroke = r * 0.16;
  const marker = (k) => `url(#${uid}-${k === "shot" ? "shot" : "head"})`;
  const arrowProps = (a) => ({
    d: arrowPath(a, r),
    strokeWidth: a.k === "shot" ? stroke * 1.35 : stroke,
    strokeDasharray: a.k === "run" ? `${r * 0.45} ${r * 0.35}` : undefined,
    markerEnd: marker(a.k),
  });

  return (
    <svg
      className={`pitch${mini ? " pitch-mini" : ""}${instant ? " pitch-instant" : ""}`}
      viewBox={outer.join(" ")}
      role="img"
      aria-label={label || "Drill diagram"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id={`${uid}-head`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="arrowhead" />
        </marker>
        <marker id={`${uid}-shot`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.6" markerHeight="3.6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="arrowhead-shot" />
        </marker>
      </defs>

      <Field field={field} vb={vb} outer={outer} transform={rotated ? HALF_ROTATION : undefined} />
      <g transform={rotated ? HALF_ROTATION : undefined}>
        {(diagram.zones || []).map((z, i) => (
          <g key={`z${i}`}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} className="pitch-zone" />
            {z.label && !mini && (
              <text
                x={z.x + z.w / 2}
                y={z.y + z.h / 2}
                className="pitch-zone-label"
                fontSize={r * 1.1}
                transform={rotated ? `rotate(90 ${z.x + z.w / 2} ${z.y + z.h / 2})` : undefined}
              >
                {z.label}
              </text>
            )}
          </g>
        ))}

        {(diagram.lines || []).map((l, i) => (
          <line key={`l${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} className="pitch-dash" strokeWidth={stroke * 0.8} strokeDasharray={`${r * 0.6} ${r * 0.5}`} />
        ))}

        {(diagram.ladders || []).map((l, i) => (
          <Ladder key={`ld${i}`} {...l} />
        ))}

        {goals.map((g, i) => (
          <Goal key={`g${i}`} {...g} />
        ))}

        {[...gridCorners, ...(diagram.cones || [])].map(([x, y, color], i) => {
          const s = color ? r * 1.5 : r;
          return (
            <path
              key={`c${i}`}
              className={`pitch-cone cone-${color || "o"}`}
              d={`M ${x} ${y - s * 0.5} L ${x + s * 0.45} ${y + s * 0.35} L ${x - s * 0.45} ${y + s * 0.35} Z`}
            />
          );
        })}

        {trailArrows.length > 0 && (
          <g className="pitch-trail">
            {trailArrows.map((a, i) => (
              <path key={i} className={`arrow arrow-${a.k}`} {...arrowProps(a)} />
            ))}
          </g>
        )}

        <g key={`arrows-${idx}`} className="pitch-arrows">
          {arrows.map((a, i) => (
            <path
              key={i}
              className={`arrow arrow-${a.k}`}
              {...arrowProps(a)}
              pathLength={a.k === "pass" || a.k === "shot" ? 1 : undefined}
            />
          ))}
        </g>

        {diagram.players.map((p) => {
          const [x, y] = cur.pos[p.id];
          const t = cur.team[p.id];
          const label = p.n ?? (t === "gk" ? "GK" : t === "c" ? "C" : "");
          const face = cur.face[p.id];
          return (
            <g key={p.id} className={`player player-${t}${p.ghost ? " player-ghost" : ""}`} style={{ transform: `translate(${x}px, ${y}px)${upright}` }}>
              {face !== undefined && (
                <path
                  className="player-face"
                  d={`M ${r * 0.7} ${-r * 0.62} L ${r * 1.65} 0 L ${r * 0.7} ${r * 0.62} Z`}
                  style={{ transform: `rotate(${rotated ? face - 90 : face}deg)` }}
                />
              )}
              <circle r={r} strokeWidth={r * 0.14} />
              {label && (
                <text fontSize={label.length > 1 ? r * 0.82 : r * 1.05} dy="0.02em">
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {Object.entries(cur.balls).map(([key, holder]) => {
          const [x, y] = ballXY(cur, holder, r);
          return (
            <g key={key} className="ball" style={{ transform: `translate(${x}px, ${y}px)` }}>
              <circle r={r * 0.42} strokeWidth={r * 0.07} />
            </g>
          );
        })}

        {trailFeet.map((f, i) => (
          <Foot key={`tf${i}`} x={f[0]} y={f[1]} side={f[2]} angle={f[3]} labelled={labelFeet} faded />
        ))}

        <g key={`feet-${idx}`} className="pitch-feet">
          {cur.feet.map((f, i) => (
            <Foot key={i} x={f[0]} y={f[1]} side={f[2]} angle={f[3]} labelled={labelFeet} />
          ))}
        </g>

        {cur.call && cur.pos[cur.call.id] && (
          <CallOut
            key={`call-${idx}`}
            x={cur.pos[cur.call.id][0]}
            y={cur.pos[cur.call.id][1] - r * 2.3}
            text={cur.call.text}
            color={cur.call.color}
            size={r * 1.3}
          />
        )}
      </g>
    </svg>
  );
};

export default Pitch;
