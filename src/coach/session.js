import { useSyncExternalStore } from "react";

// Today's session plan: an ordered list of drill ids, kept in this browser.
const KEY = "coach.session.v1";
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let current = read();

function write(next) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — keep the in-memory plan.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSession() {
  const ids = useSyncExternalStore(subscribe, () => current, () => current);
  // Mutations read the live store, not this render's snapshot, so rapid
  // clicks never overwrite each other.
  return {
    ids,
    has: (id) => ids.includes(id),
    toggle: (id) => write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]),
    remove: (id) => write(current.filter((x) => x !== id)),
    move: (id, delta) => {
      const i = current.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= current.length) return;
      const next = [...current];
      [next[i], next[j]] = [next[j], next[i]];
      write(next);
    },
    clear: () => write([]),
  };
}
