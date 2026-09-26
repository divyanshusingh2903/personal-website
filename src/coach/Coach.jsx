import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Library from "./Library";
import DrillPage from "./DrillPage";
import { findDrill } from "./drills";
import { useSession } from "./session";
import { categoryLabel } from "./meta";
import "./coach.css";

function SessionTray() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const drills = session.ids.map(findDrill).filter(Boolean);
  const total = drills.reduce((s, d) => s + d.duration, 0);

  if (drills.length === 0) return null;

  const copy = async () => {
    const lines = drills.map((d, i) => `${i + 1}. ${d.title} (${d.duration} min) – ${categoryLabel(d.category)}`);
    const text = `Training session – ${total} min\n\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`session-tray${open ? " is-open" : ""}`}>
      {open && (
        <div className="session-panel" role="dialog" aria-label="Session plan">
          <div className="session-panel-head">
            <span className="kicker">Today's session</span>
            <span className="session-total">{total} min</span>
          </div>
          <ol className="session-list">
            {drills.map((d, i) => (
              <li key={d.id}>
                <span className="session-idx">{String(i + 1).padStart(2, "0")}</span>
                <Link to={`/coach/${d.id}`} onClick={() => setOpen(false)}>
                  {d.title}
                  <small>
                    {categoryLabel(d.category)} · {d.duration} min
                  </small>
                </Link>
                <span className="session-actions">
                  <button type="button" onClick={() => session.move(d.id, -1)} disabled={i === 0} aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => session.move(d.id, 1)} disabled={i === drills.length - 1} aria-label="Move down">
                    ↓
                  </button>
                  <button type="button" onClick={() => session.remove(d.id)} aria-label={`Remove ${d.title}`}>
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className="session-panel-foot">
            <button type="button" className="btn btn-ghost" onClick={session.clear}>
              Clear
            </button>
            <button type="button" className="btn" onClick={copy}>
              {copied ? "Copied" : "Copy plan"}
            </button>
          </div>
        </div>
      )}
      <button type="button" className="session-pill" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="session-dot" />
        Session · {drills.length} {drills.length === 1 ? "drill" : "drills"} · {total} min
      </button>
    </div>
  );
}

const Coach = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.classList.add("coach-mode");
    const prevTitle = document.title;
    return () => {
      document.body.classList.remove("coach-mode");
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="coach">
      <header className="coach-top">
        <Link to="/coach" className="coach-wordmark">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10.5" />
            <line x1="12" y1="1.5" x2="12" y2="22.5" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
          Coach
        </Link>
        <Link to="/" className="coach-home">
          Divyanshu Singh
        </Link>
      </header>
      <Routes>
        <Route index element={<Library />} />
        <Route path=":drillId" element={<DrillPage />} />
      </Routes>
      <footer className="coach-foot">
        <span>Drill diagrams are illustrative. Adapt distances and numbers to your players.</span>
        <Link to="/">← divyanshusingh</Link>
      </footer>
      <SessionTray />
    </div>
  );
};

export default Coach;
