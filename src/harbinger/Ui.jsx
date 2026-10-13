import { isValidElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { G } from "./Glossary";

// Outcome / status chip. kind: pass, fail, mixed, note.
export function Pill({ kind = "note", children }) {
  return <span className="exp-outcome" data-kind={kind}>{children}</span>;
}

// Sticky in-page navigation that highlights the section being read.
export function SectionNav({ items, label = "On this page" }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === "undefined") return undefined;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
        const visible = [...seen.entries()].filter(([, top]) => top !== null).sort((a, b) => a[1] - b[1]);
        if (visible.length) setActive(visible[0][0]);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="secnav" aria-label={label}>
      <div className="secnav-inner">
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} data-on={active === i.id ? "" : undefined} aria-current={active === i.id ? "true" : undefined}>
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// A row of segmented buttons. Controlled: value + onChange.
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="hb-pills" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} className="hb-pill" onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Simple data table that scrolls sideways on narrow screens. Cells may be strings or { v, kind }.
export function Table({ head, rows, caption, lead = true }) {
  return (
    <div className="tbl-wrap" role="region" tabIndex={0} aria-label={caption}>
      <table className="tbl" data-lead={lead ? "" : undefined}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => {
                const cell = typeof c === "object" && c !== null && !isValidElement(c) ? c : { v: c };
                const Tag = j === 0 && lead ? "th" : "td";
                return (
                  <Tag key={j} scope={Tag === "th" ? "row" : undefined} data-kind={cell.kind}>
                    {["pass", "fail", "mixed", "note"].includes(cell.kind) ? <Pill kind={cell.kind}>{cell.v}</Pill> : <G>{cell.v}</G>}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// A highlighted aside: what to take away, or a caveat.
export function Callout({ title, kind = "note", children }) {
  return (
    <aside className="callout" data-kind={kind}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </aside>
  );
}

// A big-number row for the headline results of a page.
export function Headlines({ items }) {
  return (
    <ul className="headlines">
      {items.map(([value, label, sub]) => (
        <li key={`${value}-${label}`}>
          <strong>{value}</strong>
          <span>{label}</span>
          {sub && <small>{sub}</small>}
        </li>
      ))}
    </ul>
  );
}

// Bulleted takeaway list with the same dot style as the experiment cards.
export function Points({ items, signal }) {
  return (
    <ul className={`points${signal ? " is-signal" : ""}`}>
      {items.map((t, i) => <li key={i}><G>{t}</G></li>)}
    </ul>
  );
}

const SIBLINGS = [
  { to: "/harbinger/experiments", name: "Experiments", text: "How each experiment steered the design, including the ones that failed." },
  { to: "/harbinger/benchmarks", name: "Benchmarks", text: "What we measured on a laptop, on AWS and on real traces, and what it supports." },
  { to: "/harbinger/comparison", name: "RabbitMQ and Redis", text: "Same workload, different broker: scheduling gains and raw broker cost." },
];

// Links to the other analysis pages, shown at the bottom of each.
export function MoreFrom({ current }) {
  return (
    <section className="more" aria-label="More from Harbinger">
      <h2>Keep reading</h2>
      <div className="more-grid">
        {SIBLINGS.filter((s) => s.to !== current).map((s) => (
          <Link key={s.to} to={s.to} className="more-card">
            <span>
              <strong>{s.name}</strong>
              {s.text}
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

const MASKS = { rabbitmq: "/rabbitmq.svg", redis: "/redis.svg" };

// Broker logo in the current text colour. Harbinger uses its own mark; the others are Simple Icons (CC0).
export function Brand({ name, children, bare }) {
  const key = name.toLowerCase();
  return (
    <span className="brand">
      {key === "harbinger" ? (
        <svg className="brand-icon" viewBox="0 0 64 64" aria-hidden="true">
          <line x1="10" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <line x1="10" y1="33" x2="36" y2="33" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <line x1="10" y1="47" x2="54" y2="47" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <circle className="hb-dot" cx="53" cy="19" r="5" />
        </svg>
      ) : (
        <i className="brand-icon" aria-hidden="true" style={{ "--icon": `url(${MASKS[key]})` }} />
      )}
      {bare ? null : (children ?? name)}
    </span>
  );
}
