import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GlossaryButton, GlossaryDrawer, GlossaryProvider } from "./Glossary";

export const GITHUB_URL = "https://github.com/divyanshusingh2903/predictive-multi-level-message-queue";
export const DOCS_URL = `${GITHUB_URL}/tree/main/docs`;

// The brand mark, unchanged: the dot stays ahead of the stack. A section's level is shown by dimming the other bars.
export function Glyph({ level, className = "" }) {
  const widths = [12, 26, 44];
  return (
    <svg className={`hb-glyph ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      {widths.map((w, i) => (
        <line key={i} x1="10" y1={19 + i * 14} x2={10 + w} y2={19 + i * 14} stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity={level === undefined || level === i ? 1 : 0.28} />
      ))}
      {level !== undefined && <circle className="hb-dot" cx="53" cy="19" r="5" />}
    </svg>
  );
}

export function Level({ level, tag, title, id, wide, children }) {
  return (
    <section className={`hb-level${wide ? " is-wide" : ""}`} id={id}>
      <div className="hb-level-head">
        <Glyph level={level} className={level === undefined ? "is-quiet" : ""} />
        <div>
          <span className="hb-level-tag">{tag}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="hb-level-body">{children}</div>
    </section>
  );
}

export function Top() {
  return (
    <header className="hb-top">
      <Link to="/harbinger" aria-label="Harbinger overview">
        <img src="/harbinger-lockup-dark.svg" alt="Harbinger" />
      </Link>
      <nav aria-label="Harbinger navigation">
        <NavLink to="/harbinger" end>Overview</NavLink>
        <NavLink to="/harbinger/experiments">Experiments</NavLink>
        <GlossaryButton className="hb-navbtn" />
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <Link to="/projects" className="hb-back">← Portfolio</Link>
      </nav>
    </header>
  );
}

export default function Shell({ title, children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const prevTitle = document.title;
    const icon = document.querySelector('link[rel="icon"]');
    const prevIcon = icon?.getAttribute("href");
    const prevType = icon?.getAttribute("type");
    document.title = title;
    icon?.setAttribute("href", "/harbinger-icon.svg");
    icon?.setAttribute("type", "image/svg+xml");
    return () => {
      document.title = prevTitle;
      if (prevIcon) icon.setAttribute("href", prevIcon);
      if (prevType) icon.setAttribute("type", prevType);
    };
  }, [title]);

  return (
    <main id="harbinger">
      <GlossaryProvider>
        {children}
        <GlossaryDrawer />
        <GlossaryButton className="hb-fab" />
      </GlossaryProvider>
      <footer className="hb-footer">
        <img src="/harbinger-mark-dark.svg" alt="" />
        <span>©{new Date().getFullYear()} Divyanshu Singh</span>
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">Docs ↗</a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </footer>
    </main>
  );
}
