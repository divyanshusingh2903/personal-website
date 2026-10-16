import { useSyncExternalStore } from "react";
import { DRILLS, findDrill } from "./drills";

/*
 * Session planner: builds a practice from the drill library and keeps it,
 * plus any saved plans, in this browser. A plan is
 *   { title, band, players, length, focus, seed, notes, built, items }
 * where each item is { id, min, seg }, and `built` records the settings the
 * items were generated from so the page can tell when they have changed.
 */

/* ─── Options ────────────────────────────────────────────── */

// Planner age groups: the same four the library lists (see AGE_GUIDE), with school grades.
export const BANDS = [
  {
    id: "U6-8",
    label: "U6–U8",
    sub: "K–2nd",
    tags: ["U6-8"],
    teamSizes: [3, 4],
    tips: [
      "Give every player a ball. Waiting in a line is the enemy at this age.",
      "Explain in 20 words or fewer, then demonstrate. Then let them play.",
      "Keep drills to 8–10 minutes. Change the activity before attention fades.",
      "Tell stories and use games: sharks, pirates, red light. Skip laps and lectures.",
      "Cheer effort and brave tries. Nobody 'plays goalie' for the whole practice.",
    ],
  },
  {
    id: "U9-12",
    label: "U9–U12",
    sub: "3rd–6th",
    tags: ["U9-12"],
    teamSizes: [3, 4, 5],
    tips: [
      "This is the skill window. Aim for many touches and many 1v1s.",
      "Use small-sided games (3v3, 4v4). They give far more touches than 11v11.",
      "Teach one idea per practice. Ask questions instead of giving instructions.",
      "Rotate positions every game so everyone tries defending, attacking and goal.",
      "No heading for under-10s. Keep tackling practice slow, safe and paired.",
    ],
  },
  {
    id: "U13-15",
    label: "U13–U15",
    sub: "7th–9th",
    tags: ["U13-15"],
    teamSizes: [4, 5, 6, 7],
    tips: [
      "Technique under pressure: add a defender, a time limit or a small space.",
      "Introduce shape and roles in 7v7, but keep switching positions.",
      "Growth spurts hit now. Watch for awkward, tired or sore players and ease the load.",
      "Keep conditioning inside the ball work. Skip laps and long lines.",
      "Let them solve problems. Ask 'What did you see?' before telling them.",
    ],
  },
  {
    id: "U16+",
    label: "U16+",
    sub: "10th +",
    tags: ["U16+"],
    teamSizes: [5, 6, 7],
    tips: [
      "Add pressure and decisions: limit touches, shrink the space or add a defender.",
      "Teach team shape, pressing and transitions, then let players apply them in games.",
      "Keep conditioning ball-based and monitor load during growth spurts.",
      "Give players roles and responsibility: let them lead a drill or a warm-up.",
      "Ask for feedback. Older players learn faster when they help solve the problem.",
    ],
  },
];

export const FOCUSES = [
  { id: "mixed", label: "Fun & fundamentals", tech: ["fundamentals", "ball-mastery"], applied: ["possession", "dribbling"] },
  { id: "dribbling", label: "Dribbling", tech: ["ball-mastery", "dribbling", "footwork"], applied: ["dribbling", "attacking"] },
  { id: "passing", label: "Passing & receiving", tech: ["passing", "fundamentals", "patterns"], applied: ["possession", "patterns"] },
  { id: "finishing", label: "Finishing", tech: ["finishing", "fundamentals"], applied: ["finishing", "attacking"] },
  { id: "defending", label: "Defending", tech: ["defending", "fundamentals"], applied: ["transition", "defending", "structure"] },
  { id: "teamplay", label: "Team play", tech: ["passing", "fundamentals"], applied: ["possession", "transition", "structure"] },
];

export const LENGTHS = [45, 60, 75, 90];

export const SEGMENTS = [
  { id: "warmup", label: "Warm-up & stretch", note: "Ten minutes: dynamic warm-up, then stretch." },
  { id: "technical", label: "Skill work", note: "One idea, lots of repetitions. 15–20 min with talking and breaks." },
  { id: "applied", label: "Skill in play", note: "Use the skill with a defender or a goal." },
  { id: "game", label: "Game time", note: "Let them play. Coach from the sideline." },
  { id: "cooldown", label: "Cool-down", note: "Calm down and finish positive." },
];

export const segmentLabel = (id) => SEGMENTS.find((s) => s.id === id)?.label ?? id;
export const bandOf = (id) => BANDS.find((b) => b.id === id) ?? BANDS[1];
const focusOf = (id) => FOCUSES.find((f) => f.id === id) ?? FOCUSES[0];

/* ─── Choosing drills ────────────────────────────────────── */

const COOLDOWN_ID = "cool-down-circle";
const TECH_FALLBACK = ["fundamentals", "ball-mastery", "dribbling", "passing", "footwork"];
const APPLIED_CATS = ["possession", "transition", "attacking", "structure", "set-pieces", "patterns"];

export const segmentOf = (drill) => {
  if (drill.id === COOLDOWN_ID) return "cooldown";
  if (drill.category === "warmup") return "warmup";
  if (drill.category === "games") return "game";
  return APPLIED_CATS.includes(drill.category) ? "applied" : "technical";
};

const fitsBand = (d, b) => d.ages.some((a) => b.tags.includes(a));

// Drills spanning more of the band's ages, and its preferred age, rank higher.
const bandScore = (d, b) =>
  b.tags.reduce((s, t) => s + (d.ages.includes(t) ? (t === b.pref ? 2 : 1) : 0), 0);

const inCats = (cats) => (d) => cats.includes(d.category) && d.id !== COOLDOWN_ID;

// Ordered tiers of acceptable drills for a segment: best matches first, then wider fallbacks.
function tiersFor(seg, focus) {
  const f = focusOf(focus);
  switch (seg) {
    case "warmup":
      return [(d) => d.category === "warmup" && d.id !== COOLDOWN_ID, (d) => d.category === "ball-mastery" && d.intensity <= 2];
    case "technical":
      return [inCats(f.tech), inCats(TECH_FALLBACK)];
    case "applied":
      return [inCats(f.applied), inCats(["games", ...APPLIED_CATS]), inCats(TECH_FALLBACK)];
    case "game":
      return [inCats(["games"]), inCats(["attacking", "possession", "transition"])];
    default:
      return [];
  }
}

// Candidates for one segment, best first. `rand` adds variety; omit it for a stable order.
export function candidates(seg, bandId, focus, exclude = new Set(), rand = null) {
  const b = bandOf(bandId);
  const out = [];
  const seen = new Set(exclude);
  for (const test of tiersFor(seg, focus)) {
    const tier = DRILLS.filter((d) => !seen.has(d.id) && fitsBand(d, b) && test(d)).sort(
      (x, y) => bandScore(y, b) + (rand ? rand() * 1.5 : 0) - (bandScore(x, b) + (rand ? rand() * 1.5 : 0)),
    );
    tier.forEach((d) => {
      seen.add(d.id);
      out.push(d);
    });
  }
  return out;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Every block is a full 15-20 minutes: explaining, water breaks and resets
// eat into each one, so a session has few drills. The warm-up and stretch is a
// fixed 10 minutes and the cool-down 5; the rest is divided into blocks.
export const WARMUP_MIN = 10;
export const COOLDOWN_MIN = 5;
const BLOCK_MIN = 17.5;
const LAYOUTS = {
  2: ["technical", "game"],
  3: ["technical", "applied", "game"],
  4: ["technical", "technical", "applied", "game"],
};

// Split `total` minutes across `n` blocks as evenly as whole minutes allow.
const split = (total, n) => {
  const base = Math.floor(total / n);
  const extra = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
};

export function generate({ band, length, focus, seed }) {
  const rand = mulberry32(seed * 9973 + 17);
  const used = new Set();
  const items = [];
  const take = (seg) => {
    const [d] = candidates(seg, band, focus, used, rand);
    if (d) used.add(d.id);
    return d;
  };

  const warm = take("warmup");
  if (warm) items.push({ id: warm.id, min: WARMUP_MIN, seg: "warmup" });

  const main = length - WARMUP_MIN - COOLDOWN_MIN;
  const count = Math.min(4, Math.max(2, Math.round(main / BLOCK_MIN)));
  const mins = split(main, count);
  LAYOUTS[count].forEach((seg, i) => {
    const d = take(seg);
    if (d) items.push({ id: d.id, min: mins[i], seg });
  });

  const cool = findDrill(COOLDOWN_ID);
  if (cool) items.push({ id: cool.id, min: COOLDOWN_MIN, seg: "cooldown" });
  return items;
}

// Suggest how to split `n` players into small-sided games.
export function groupAdvice(n, bandId) {
  if (!n || n < 2) return "";
  let best = null;
  for (const t of bandOf(bandId).teamSizes) {
    const fields = Math.floor(n / (2 * t));
    if (fields === 0) continue;
    const left = n - fields * 2 * t;
    if (!best || left < best.left || (left === best.left && t > best.t)) best = { t, fields, left };
  }
  if (!best) {
    const a = Math.floor(n / 2);
    return `${n} players: one game of ${a}v${n - a}. Use a neutral player if the numbers are uneven.`;
  }
  const fields = `${best.fields} ${best.fields === 1 ? "field" : "fields"} of ${best.t}v${best.t}`;
  const left = best.left
    ? ` ${best.left} left over: make them neutral players or rotate them in every four minutes.`
    : " Everyone plays at once with no waiting.";
  return `${n} players: ${fields}.${left}`;
}

export const planMinutes = (items) => items.reduce((s, it) => s + it.min, 0);

/* ─── Plan store ─────────────────────────────────────────── */

const KEY = "coach.plan.v1";
const SAVED_KEY = "coach.plans.v1";
export const MIN_DRILL = 2;
export const MAX_DRILL = 40;

const DEFAULTS = { title: "", band: "U9-12", players: 12, length: 60, focus: "mixed", seed: 1, notes: "" };

const settingsOf = (p) => ({ band: p.band, length: p.length, focus: p.focus });
const sameSettings = (a, b) => !!a && !!b && a.band === b.band && a.length === b.length && a.focus === b.focus;
export const isStale = (p) => !sameSettings(p.built, settingsOf(p));

// Plans saved before the planner used the library's age groups.
const LEGACY_BANDS = { k2: "U6-8", g35: "U9-12", g67: "U13-15", g8: "U13-15" };

function clean(raw) {
  if (!raw || typeof raw !== "object") return null;
  raw = { ...raw, band: LEGACY_BANDS[raw.band] ?? raw.band };
  const num = (v, lo, hi, d) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d);
  const plan = {
    title: typeof raw.title === "string" ? raw.title.slice(0, 80) : "",
    band: BANDS.some((b) => b.id === raw.band) ? raw.band : DEFAULTS.band,
    players: num(raw.players, 1, 60, DEFAULTS.players),
    length: num(raw.length, 15, 180, DEFAULTS.length),
    focus: FOCUSES.some((f) => f.id === raw.focus) ? raw.focus : DEFAULTS.focus,
    seed: num(raw.seed, 1, 1e6, 1),
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 1500) : "",
    items: (Array.isArray(raw.items) ? raw.items : [])
      .filter((it) => it && findDrill(it.id))
      .map((it) => {
        const d = findDrill(it.id);
        return { id: it.id, min: num(it.min, MIN_DRILL, MAX_DRILL, d.duration), seg: SEGMENTS.some((s) => s.id === it.seg) ? it.seg : segmentOf(d) };
      }),
  };
  plan.built = sameSettings(raw.built, settingsOf(plan)) ? settingsOf(plan) : null;
  return plan;
}

function fresh() {
  const plan = { ...DEFAULTS };
  plan.items = generate(plan);
  plan.built = settingsOf(plan);
  return plan;
}

function readPlan() {
  try {
    const raw = localStorage.getItem(KEY);
    const plan = raw ? clean(JSON.parse(raw)) : null;
    if (plan && plan.items.length) return plan;
  } catch {
    // Fall through to a fresh plan.
  }
  return fresh();
}

let current = readPlan();
const listeners = new Set();

function write(next) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep the plan in memory.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const withItems = (items) => write({ ...current, items });

export const planActions = {
  setSettings: (patch) => write({ ...current, ...patch }),
  build: (patch = {}) => {
    const next = { ...current, ...patch };
    write({ ...next, items: generate(next), built: settingsOf(next) });
  },
  shuffle: () => planActions.build({ seed: current.seed + 1 }),
  swap: (index, id) => {
    const d = findDrill(id);
    if (!d || !current.items[index]) return;
    withItems(current.items.map((it, i) => (i === index ? { ...it, id } : it)));
  },
  nudge: (index, delta) => {
    if (!current.items[index]) return;
    withItems(current.items.map((it, i) => (i === index ? { ...it, min: Math.min(MAX_DRILL, Math.max(MIN_DRILL, it.min + delta)) } : it)));
  },
  move: (index, delta) => {
    const j = index + delta;
    if (index < 0 || j < 0 || j >= current.items.length) return;
    const next = [...current.items];
    [next[index], next[j]] = [next[j], next[index]];
    withItems(next);
  },
  remove: (index) => withItems(current.items.filter((_, i) => i !== index)),
  add: (id) => {
    const d = findDrill(id);
    if (!d) return;
    const seg = segmentOf(d);
    const long = seg === "technical" || seg === "applied" || seg === "game";
    const item = { id, min: Math.min(MAX_DRILL, Math.max(MIN_DRILL, long ? 15 : d.duration)), seg };
    // Keep the cool-down last and slot other drills in before it.
    const items = [...current.items];
    const tail = items.length && items[items.length - 1].seg === "cooldown" && seg !== "cooldown";
    items.splice(tail ? items.length - 1 : items.length, 0, item);
    withItems(items);
  },
  importIds: (ids) => {
    const known = ids.map(findDrill).filter(Boolean);
    if (!known.length) return;
    write({ ...current, items: known.map((d) => ({ id: d.id, min: d.duration, seg: segmentOf(d) })) });
  },
  load: (raw) => {
    const plan = raw ? clean(raw) : null;
    if (plan) write(plan);
    return !!plan;
  },
  reset: () => write(fresh()),
};

export function usePlan() {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

/* ─── Share links ────────────────────────────────────────── */

const toB64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

export function encodePlan(plan) {
  const { title, band, players, length, focus, notes, items } = plan;
  return toB64(JSON.stringify({ title, band, players, length, focus, notes, items: items.map((it) => [it.id, it.min, it.seg]) }));
}

export function decodePlan(code) {
  try {
    const raw = JSON.parse(fromB64(code));
    return clean({
      ...raw,
      items: (raw.items || []).map(([id, min, seg]) => ({ id, min, seg })),
      // A shared plan is taken as built: don't offer to regenerate it.
      built: { band: raw.band, length: raw.length, focus: raw.focus },
    });
  } catch {
    return null;
  }
}

/* ─── Saved plans ────────────────────────────────────────── */

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((s) => s && s.id && s.name && s.plan) : [];
  } catch {
    return [];
  }
}

let saved = readSaved();
const savedListeners = new Set();

function writeSaved(next) {
  saved = next;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    // Keep in memory only.
  }
  savedListeners.forEach((l) => l());
}

const subscribeSaved = (l) => {
  savedListeners.add(l);
  return () => savedListeners.delete(l);
};

export const savedActions = {
  save: (name) => {
    const entry = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: (name.trim() || current.title.trim() || "Untitled plan").slice(0, 60), savedAt: Date.now(), plan: current };
    writeSaved([entry, ...saved].slice(0, 30));
  },
  open: (id) => {
    const entry = saved.find((s) => s.id === id);
    if (entry) planActions.load(entry.plan);
  },
  delete: (id) => writeSaved(saved.filter((s) => s.id !== id)),
};

export function useSavedPlans() {
  return useSyncExternalStore(subscribeSaved, () => saved, () => saved);
}
