import { useCallback, useEffect, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Steps through diagram frames. Looping back to the start jumps instantly
// instead of animating every player backwards across the pitch.
export default function usePlayback(count) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion() && count > 1);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (!playing || count < 2) return undefined;
    const last = frame >= count - 1;
    const delay = last ? 2800 : frame === 0 ? 1200 : 1900;
    const t = setTimeout(() => {
      if (last) {
        setInstant(true);
        setFrame(0);
      } else {
        setFrame(frame + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [playing, frame, count]);

  useEffect(() => {
    if (!instant) return undefined;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [instant]);

  const go = useCallback(
    (i) => {
      const next = (i + count) % count;
      if (Math.abs(next - frame) > 1) setInstant(true);
      setFrame(next);
    },
    [count, frame],
  );

  return {
    frame,
    playing,
    instant,
    toggle: () => setPlaying((p) => !p),
    pause: () => setPlaying(false),
    next: () => go(frame + 1),
    prev: () => go(frame - 1),
    goTo: go,
    restart: () => {
      setInstant(true);
      setFrame(0);
      setPlaying(true);
    },
  };
}
