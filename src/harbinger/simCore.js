// Discrete-event model of one worker pulling from either a single FIFO lane or Harbinger's three tiers.
// Costs are in abstract time units; the two panels replay the identical arrival sequence.

// Job types, grouped by cost class. A class's share of the mix is split across its types.
export const CLASSES = {
  short: [{ id: "push", cost: 0.8, p: 0.6 }, { id: "invoice", cost: 1.2, p: 0.4 }],
  mid: [{ id: "email", cost: 3, p: 1 }],
  long: [{ id: "resize", cost: 7, p: 0.6 }, { id: "export", cost: 12, p: 0.4 }],
};
export const DEFAULT_MIX = { short: 50, mid: 25, long: 25 };
export const N_JOBS = 60;
export const AGE_AFTER = 6;
export const MIN_SAMPLES = 3;
export const WEIGHTS = [8, 3, 1];
const AGING_PASS = 0.5;
export const TIER_BOUNDS = [1.6, 4];
const TARGET_LOAD = 1.12;
const BURST_FACTOR = 0.32;
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

export function makeJobs(seed, rawMix = DEFAULT_MIX) {
  // An all-zero mix means "no preference": use an even split.
  const mix = rawMix.short + rawMix.mid + rawMix.long > 0 ? rawMix : { short: 1, mid: 1, long: 1 };
  const total = mix.short + mix.mid + mix.long;
  const types = Object.entries(CLASSES).flatMap(([cls, list]) => list.map((k) => ({ ...k, p: ((mix[cls] || 0) / total) * k.p })));
  const meanCost = types.reduce((sum, k) => sum + k.p * k.cost, 0);
  // Keep offered load fixed (a little over capacity) so a backlog forms whatever the mix.
  const gap = meanCost / TARGET_LOAD;
  const r = rng(seed);
  let t = 0;
  return Array.from({ length: N_JOBS }, (_, id) => {
    // A burst up front (a flash sale) so a backlog forms immediately, then steady load.
    t += -Math.log(1 - r()) * gap * (id < 12 ? BURST_FACTOR : 1);
    let pick = r();
    const key = types.find((k) => (pick -= k.p) < 0) || types[types.length - 1];
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
  return {
    mode, t: 0, next: 0, lanes: [[], [], []], cur: null, done: [], hist: {},
    // weighted mode: per-level virtual clocks, Ack'd-duration averages, and the last aging pass
    clocks: [0, 0, 0], avg: [null, null, null], lastPass: 0, pausedAt: -Infinity,
  };
}

function route(p, job) {
  if (p.mode === "fifo") return 0;
  const h = p.hist[job.key];
  if (!h || h.length < MIN_SAMPLES) {
    job.cold = true;
    return 1;
  }
  const m = median(h);
  job.pred = m;
  return m <= TIER_BOUNDS[0] ? 0 : m <= TIER_BOUNDS[1] ? 1 : 2;
}

// Weighted mode: a level that was empty rejoins at the floor of the active clocks, so it can't save up credit.
function enqueue(p, job) {
  const lane = route(p, job);
  job.orig = lane;
  if (p.mode === "w" && !p.lanes[lane].length) {
    const active = p.lanes.map((l, i) => (l.length || p.cur?.lane === i ? p.clocks[i] : null)).filter((c) => c !== null);
    if (active.length) p.clocks[lane] = Math.max(p.clocks[lane], Math.min(...active));
  }
  p.lanes[lane].push(job);
}

// One aging pass of "pausing aging": at most one promotion per level, skipped while the level above is still behind.
function pausingPass(p) {
  for (let lane = 2; lane >= 1; lane--) {
    const above = p.lanes[lane - 1];
    const behind = above.some((j) => j.orig > lane - 1) && above.length && p.t - above[0].arrive >= AGE_AFTER;
    const due = p.lanes[lane].findIndex((j) => p.t - j.since > AGE_AFTER);
    if (due < 0) continue;
    if (behind) {
      p.pausedAt = p.t;
      continue;
    }
    const [job] = p.lanes[lane].splice(due, 1);
    job.since = p.t;
    job.aged = true;
    above.push(job);
  }
}

function pickLane(p) {
  const open = p.lanes.map((l, i) => (l.length ? i : -1)).filter((i) => i >= 0);
  if (!open.length) return -1;
  if (p.mode !== "w") return open[0];
  return open.reduce((best, i) => (p.clocks[i] < p.clocks[best] ? i : best), open[0]);
}

function tick(p, jobs, dt) {
  p.t += dt;
  while (p.next < jobs.length && jobs[p.next].arrive <= p.t) {
    enqueue(p, { ...jobs[p.next], since: p.t });
    p.next++;
  }
  if (p.mode === "w") {
    if (p.t - p.lastPass >= AGING_PASS) {
      p.lastPass = p.t;
      pausingPass(p);
    }
  } else if (p.mode === "h") {
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
      const a = p.avg[j.lane];
      p.avg[j.lane] = a === null ? j.dur : a + (j.dur - a) * 0.2;
      p.cur = null;
    }
  }
  if (!p.cur) {
    const idx = pickLane(p);
    if (idx >= 0) {
      p.cur = p.lanes[idx].shift();
      p.cur.lane = idx;
      p.cur.start = p.t;
      p.cur.left = p.cur.dur;
      if (p.mode === "w") p.clocks[idx] += (p.cur.pred ?? p.avg[idx] ?? 0.05) / WEIGHTS[idx];
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
  if (!p.done.length) return { mean: null, short: null, longest: null, n: 0 };
  const waits = p.done.map((j) => j.wait);
  const shortW = p.done.filter((j) => jobClass(j) === "short").map((j) => j.wait);
  return {
    n: p.done.length,
    mean: waits.reduce((a, b) => a + b, 0) / waits.length,
    short: shortW.length ? median(shortW) : null,
    longest: Math.max(...waits),
  };
}
