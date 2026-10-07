import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ENTRIES, findTerms } from "./glossary";
import { GlossaryContext, useGlossary } from "./glossaryContext";

export function GlossaryProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, focusId: null });
  const open = useCallback((id = null) => setState({ isOpen: true, focusId: id }), []);
  const close = useCallback(() => setState((s) => ({ ...s, isOpen: false })), []);
  const value = useMemo(() => ({ ...state, open, close }), [state, open, close]);
  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
}

// Flip the tooltip to open leftwards when it would run off the right edge of the screen.
function placeTip(e) {
  const el = e.currentTarget;
  const room = window.innerWidth - el.getBoundingClientRect().left;
  if (room < Math.min(19 * 16, window.innerWidth * 0.72) + 16) el.setAttribute("data-flip", "");
  else el.removeAttribute("data-flip");
}

export function Term({ entry, children }) {
  const { open } = useGlossary();
  return (
    <span className="term" tabIndex={0} onMouseEnter={placeTip} onFocus={placeTip}>
      {children}
      <span className="term-tip" role="tooltip">
        <b>{entry.term}</b>
        {entry.def}
        {entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer">Learn more ↗</a>}
        <button type="button" onClick={() => open(entry.id)}>In glossary</button>
      </span>
    </span>
  );
}

// Wraps the first mention of each jargon term in a string with a tooltip. Non-string children pass through.
export function G({ children }) {
  if (typeof children !== "string") return children;
  const hits = findTerms(children);
  if (!hits.length) return children;
  const out = [];
  let last = 0;
  hits.forEach((h, i) => {
    out.push(children.slice(last, h.index));
    out.push(<Term key={i} entry={h.entry}>{h.text}</Term>);
    last = h.index + h.text.length;
  });
  out.push(children.slice(last));
  return <>{out}</>;
}

export function TermById({ id, children }) {
  const entry = ENTRIES.find((e) => e.id === id);
  return <Term entry={entry}>{children}</Term>;
}

export function GlossaryDrawer() {
  const { isOpen, focusId, close } = useGlossary();
  const [query, setQuery] = useState("");
  const closeRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    // Keep the reader's place on the page behind the drawer.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || !focusId) return;
    listRef.current?.querySelector(`#gl-${focusId}`)?.scrollIntoView({ block: "center" });
  }, [isOpen, focusId]);

  const q = query.trim().toLowerCase();
  const items = [...ENTRIES]
    .sort((a, b) => a.term.localeCompare(b.term))
    .filter((e) => !q || e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q));

  return (
    <>
      <div className="gl-scrim" data-open={isOpen ? "" : undefined} onClick={close} aria-hidden="true" />
      <aside className="gl-drawer" data-open={isOpen ? "" : undefined} aria-label="Glossary" aria-hidden={!isOpen} inert={!isOpen}>
        <header>
          <h2>Glossary</h2>
          <button type="button" ref={closeRef} onClick={close} aria-label="Close glossary">✕</button>
        </header>
        <input type="search" placeholder="Search terms" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search glossary" />
        <dl className="gl" ref={listRef}>
          {items.map((e) => (
            <div key={e.id} id={`gl-${e.id}`} data-focus={focusId === e.id ? "" : undefined}>
              <dt>{e.term}</dt>
              <dd>
                {e.def}
                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer"> Learn more ↗</a>}
              </dd>
            </div>
          ))}
          {!items.length && <p className="gl-empty">No matching terms.</p>}
        </dl>
      </aside>
    </>
  );
}

export function GlossaryButton({ className = "" }) {
  const { open } = useGlossary();
  return <button type="button" className={className} onClick={() => open()}>Glossary</button>;
}
