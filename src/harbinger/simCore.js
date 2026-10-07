// Discrete-event model of one worker pulling from either a single FIFO lane or Harbinger's three tiers.
// Costs are in abstract time units; the two panels replay the identical arrival sequence.

export const KEYS = [
  { id: "push", cost: 0.8, p: 0.3 },
  { id: "invoice", cost: 1.2, p: 0.2 },
  { id: "email", cost: 3, p: 0.25 },
  { id: "resize", cost: 7, p: 0.15 },
  { id: "export", cost: 12, p: 0.1 },
];
export const N_JOBS = 60;
export const AGE_AFTER = 20;
export const MIN_SAMPLES = 3;
export const TIER_BOUNDS = [1.6, 4];
const MEAN_GAP = 3.1;
const BURST_GAP = 1.0;
const TICK = 0.05;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeJobs(seed) {
  const r = rng(seed);
  let t = 0;
  return Array.from({ length: N_JOBS }, (_, id) => {
    // A burst up front (a flash sale) so a backlog forms immediately, then steady load.
    t += -Math.log(1 - r()) * (id < 12 ? BURST_GAP : MEAN_GAP);
    let pick = r();
    const key = KEYS.find((k) => (pick -= k.p) < 0) || KEYS[KEYS.length - 1];
    return { id, key: key.id, arrive: t, dur: key.cost * (0.8 + 0.4 * r()) };
  });
}

export function jobClass(job) {
  return job.dur <= 1.7 ? "short" : job.dur <= 4.4 ? "mid" : "long";
}

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function newPanel(mode) {
  return { mode, t: 0, next: 0, lanes: [[], [], []], cur: null, done: [], hist: {} };
}

function route(p, job) {
  if (p.mode === "fifo") return 0;
  const h = p.hist[job.key];
  if (!h || h.length < MIN_SAMPLES) {
    job.cold = true;
    return 1;
  }
  const m = median(h);
  return m <= TIER_BOUNDS[0] ? 0 : m <= TIER_BOUNDS[1] ? 1 : 2;
}

function tick(p, jobs, dt) {
  p.t += dt;
  while (p.next < jobs.length && jobs[p.next].arrive <= p.t) {
    const job = { ...jobs[p.next], since: p.t };
    p.lanes[route(p, job)].push(job);
    p.next++;
  }
  if (p.mode === "h") {
    for (let lane = 2; lane >= 1; lane--) {
      const keep = [];
      for (const job of p.lanes[lane]) {
        if (p.t - job.since > AGE_AFTER) {
          job.since = p.t;
          job.aged = true;
          p.lanes[lane - 1].push(job);
        } else keep.push(job);
      }
      p.lanes[lane] = keep;
    }
  }
  if (p.cur) {
    p.cur.left -= dt;
    if (p.cur.left <= 0) {
      const j = p.cur;
      p.done.push({ ...j, wait: j.start - j.arrive });
      (p.hist[j.key] ||= []).push(j.dur);
      p.cur = null;
    }
  }
  if (!p.cur) {
    const lane = p.lanes.find((l) => l.length);
    if (lane) {
      p.cur = lane.shift();
      p.cur.start = p.t;
      p.cur.left = p.cur.dur;
    }
  }
}

export function advance(p, jobs, span) {
  while (span > 1e-9) {
    const dt = Math.min(TICK, span);
    tick(p, jobs, dt);
    span -= dt;
  }
}

export function isDone(p, jobs) {
  return p.next >= jobs.length && !p.cur && p.lanes.every((l) => !l.length);
}

export function stats(p) {
  if (!p.done.length) return { mean: null, short: null, n: 0 };
  const waits = p.done.map((j) => j.wait);
  const shortW = p.done.filter((j) => jobClass(j) === "short").map((j) => j.wait);
  return {
    n: p.done.length,
    mean: waits.reduce((a, b) => a + b, 0) / waits.length,
    short: shortW.length ? median(shortW) : null,
  };
}
