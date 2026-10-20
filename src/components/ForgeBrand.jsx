// Pixel-block "FORGE" wordmark, same grid as Forge's own logo (packages/ui/src/components/logo.tsx).
const WORDMARK = [
  ["####", "#...", "###.", "#...", "#...", "#..."],
  ["####", "#..#", "#..#", "#..#", "#..#", "####"],
  ["###.", "#..#", "###.", "#.#.", "#..#", "#..#"],
  ["####", "#...", "#.##", "#..#", "#..#", "####"],
  ["####", "#...", "###.", "#...", "#...", "####"],
];

export function Wordmark() {
  return (
    <svg className="forge-wordmark" viewBox="0 0 144 42" role="img" aria-label="Forge">
      <g fill="currentColor">
        {WORDMARK.flatMap((letter, l) =>
          letter.flatMap((row, r) =>
            [...row].map((cell, c) =>
              cell === "#" ? <rect key={`${l}-${r}-${c}`} x={l * 30 + c * 6} y={3 + r * 6} width="6" height="6" /> : null,
            ),
          ),
        )}
      </g>
    </svg>
  );
}

export function Mark() {
  return (
    <svg className="forge-mark" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0" y="0" width="16" height="4" fill="currentColor" />
      <rect x="4" y="6" width="8" height="4" fill="currentColor" />
      <rect x="0" y="12" width="16" height="4" fill="currentColor" />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 12L17 12M13 16.5L17.5 12L13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

