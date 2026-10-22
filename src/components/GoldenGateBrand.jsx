import { LOGOS, OCTICONS } from "./goldengateLogos";

// Golden Gate mark and icon set, from goldengate/docs/brand (logo-mark.svg, icons.svg).

export function Mark({ className = "gg-mark", draw = false }) {
  return (
    <svg className={className} viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4V44M44 4V44" />
      <path className={draw ? "gg-cable" : undefined} pathLength="1" d="M2 34Q14 30 20 6Q32 46 44 6Q50 30 62 34" />
    </svg>
  );
}

const ICONS = {
  project: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  shared: <><path d="M7 4v16M17 4v16" /><path d="M1 14Q5 12 7 5Q12 18 17 5Q19 12 23 14" /></>,
  denied: <><path d="M7 4v16M17 4v16" /><path d="M1 14Q5 12 7 5Q9 10.2 11 11.24M13 11.24Q15 10.2 17 5Q19 12 23 14" /></>,
  redact: <><path d="M4 7h16M4 17h6M14 17h6" /><rect x="4" y="11" width="16" height="2.5" rx="1" /></>,
  preview: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></>,
  sync: <path d="M4 9h13l-3-3M20 15H7l3 3" />,
  server: <><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></>,
  token: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3" /></>,
  source: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" />,
  laptop: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></>,
  assistant: <path d="M4 5h16v11H9l-5 4z" />,
};

export function Icon({ name, label }) {
  return (
    <svg
      className="gg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      {ICONS[name]}
    </svg>
  );
}

// A key in a log line is inked over, then replaced by its marker. Static (marker only) when motion is reduced.
export function RedactDemo() {
  const key = "AKIA" + "Z7Q3M5XK2PLR9WTE"; // synthetic
  return (
    <div className="gg-rd" role="img" aria-label="A secret key in a log line is covered by an ink bar and replaced with a redaction marker">
      <span className="gg-rd-pre">key: </span>
      <span className="gg-rd-swap">
        <span className="gg-rd-orig">{key}</span>
        <span className="gg-rd-after">[REDACTED:aws-access-key]</span>
        <span className="gg-rd-bar" />
      </span>
    </div>
  );
}

// A product mark, drawn in the current text colour.
export function Logo({ name, className = "gg-logo-mark", label }) {
  const paths = LOGOS[name];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}>
      {paths.map((p, i) => <path key={i} d={p.d} clipRule={p.evenodd ? "evenodd" : undefined} />)}
    </svg>
  );
}

// The icons GitHub itself uses for commits, pull requests and issues.
export function Octicon({ name }) {
  return (
    <svg className="gg-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {OCTICONS[name].map((d, i) => <path key={i} fillRule="evenodd" d={d} />)}
    </svg>
  );
}
