// Turns a drill diagram into per-frame states and derives the arrows between them.

const frameBalls = (f) => {
  if (f.balls) return f.balls;
  if (f.ball !== undefined) return { b: f.ball };
  return {};
};

export function buildStates(diagram) {
  const pos = {};
  const team = {};
  const face = {};
  diagram.players.forEach((p) => {
    pos[p.id] = [p.x, p.y];
    team[p.id] = p.t;
    if (p.f !== undefined) face[p.id] = p.f;
  });
  const states = [
    {
      pos,
      team,
      face,
      balls: frameBalls(diagram),
      feet: diagram.feet || [],
      note: diagram.note || "Setup",
    },
  ];
  (diagram.frames || []).forEach((f) => {
    const prev = states[states.length - 1];
    states.push({
      pos: { ...prev.pos, ...f.move },
      team: { ...prev.team, ...f.team },
      face: { ...prev.face, ...f.face },
      balls: { ...prev.balls, ...frameBalls(f) },
      feet: f.feet || [],
      note: f.note,
      kind: f.kind,
      arc: f.arc,
      // A reset (rotation, next rep) repositions silently and clears the trail.
      quiet: f.quiet || f.reset,
      reset: f.reset,
      call: f.call,
    });
  });
  // Frames without a note inherit the previous caption.
  for (let i = 1; i < states.length; i++) {
    if (!states[i].note) states[i].note = states[i - 1].note;
  }
  return states;
}

const same = (a, b) =>
  Array.isArray(a) && Array.isArray(b) ? a[0] === b[0] && a[1] === b[1] : a === b;

export function ballXY(state, holder, r) {
  if (Array.isArray(holder)) return holder;
  const p = state.pos[holder];
  if (!p) return [0, 0];
  return [p[0] + r * 0.8, p[1] + r * 0.8];
}

export function deriveArrows(prev, cur, r) {
  // Quiet frames reposition players (resets, rotations) without drawing anything.
  if (!prev || cur.quiet) return [];
  const arrows = [];
  const dribblers = new Set();

  Object.keys(cur.balls).forEach((key) => {
    const h0 = prev.balls[key];
    const h1 = cur.balls[key];
    if (h0 === undefined) return;
    if (typeof h1 === "string" && h0 === h1) {
      if (!same(prev.pos[h1], cur.pos[h1])) {
        dribblers.add(h1);
        arrows.push({ k: "dribble", from: prev.pos[h1], to: cur.pos[h1] });
      }
    } else if (!same(h0, h1)) {
      arrows.push({
        k: cur.kind === "shot" ? "shot" : "pass",
        from: ballXY(prev, h0, r),
        to: ballXY(cur, h1, r),
        // Loose balls are trimmed less than balls at a player's feet.
        loose: [Array.isArray(h0), Array.isArray(h1)],
        arc: cur.arc,
      });
    }
  });

  Object.keys(cur.pos).forEach((id) => {
    if (dribblers.has(id)) return;
    if (!same(prev.pos[id], cur.pos[id])) {
      arrows.push({ k: "run", from: prev.pos[id], to: cur.pos[id] });
    }
  });
  return arrows;
}
