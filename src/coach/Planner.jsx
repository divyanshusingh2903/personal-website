import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Pitch from "./Pitch";
import Intensity from "./Intensity";
import { DRILLS, findDrill } from "./drills";
import { categoryLabel } from "./meta";
import { useSession } from "./session";
import {
  BANDS,
  FOCUSES,
  LENGTHS,
  MAX_DRILL,
  MIN_DRILL,
  SEGMENTS,
  bandOf,
  candidates,
  decodePlan,
  encodePlan,
  groupAdvice,
  isStale,
  planActions,
  planMinutes,
  savedActions,
  segmentLabel,
  usePlan,
  useSavedPlans,
} from "./plan";

const clock = (m) => {
  const h = Math.floor(m / 60);
  return `${h}:${String(m % 60).padStart(2, "0")}`;
};

function Options({ label, options, value, onChange, hint }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      <span className="chips-label">{label}</span>
      <div className="chips-row">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`chip${value === o.id ? " is-active" : ""}`}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            title={o.title}
          >
            {o.label}
            {o.sub && <small>{o.sub}</small>}
          </button>
        ))}
      </div>
      {hint}
    </div>
  );
}

// A thumbnail frame that shows the whole pattern (see Library's DrillCard).
function thumbFrame(drill) {
  const frames = drill.diagram.frames || [];
  let f = frames.length;
  while (f > 1 && frames[f - 1].reset) f--;
  return f;
}

function Block({ item, index, start, last, plan, swapping, onSwap }) {
  const drill = findDrill(item.id);
  const used = useMemo(() => new Set(plan.items.map((it) => it.id)), [plan.items]);
  const options = useMemo(
    () => (swapping ? candidates(item.seg, plan.band, plan.focus, used).slice(0, 8) : []),
    [swapping, item.seg, plan.band, plan.focus, used],
  );
  if (!drill) return null;

  return (
    <li className={`block block-${item.seg}`}>
      <div className="block-time">
        <strong>{clock(start)}</strong>
        <span>{item.min} min</span>
      </div>
      <Link to={`/coach/${drill.id}`} state={{ from: "/coach/plan" }} className="block-pitch" aria-label={`Open ${drill.title}`}>
        <Pitch diagram={drill.diagram} frame={thumbFrame(drill)} trail mini label={`${drill.title} diagram`} />
      </Link>
      <div className="block-info">
        <span className="kicker">{segmentLabel(item.seg)}</span>
        <h3>
          <Link to={`/coach/${drill.id}`} state={{ from: "/coach/plan" }}>
            {drill.title}
          </Link>
        </h3>
        <p className="block-meta">
          <span>{categoryLabel(drill.category)}</span>
          <span>{drill.format}</span>
          <span>{drill.players} players</span>
          <Intensity level={drill.intensity} />
        </p>
        <p className="block-summary">{drill.summary}</p>
      </div>
      <div className="block-controls no-print">
        <div className="stepper" role="group" aria-label={`Minutes for ${drill.title}`}>
          <button type="button" onClick={() => planActions.nudge(index, -1)} disabled={item.min <= MIN_DRILL} aria-label="One minute less">
            −
          </button>
          <span>{item.min}′</span>
          <button type="button" onClick={() => planActions.nudge(index, 1)} disabled={item.min >= MAX_DRILL} aria-label="One minute more">
            +
          </button>
        </div>
        <div className="block-actions">
          {item.seg !== "cooldown" && (
            <button type="button" onClick={onSwap} aria-expanded={swapping} title="Swap for a similar drill">
              Swap
            </button>
          )}
          <button type="button" onClick={() => planActions.move(index, -1)} disabled={index === 0} aria-label="Move up">
            ↑
          </button>
          <button type="button" onClick={() => planActions.move(index, 1)} disabled={last} aria-label="Move down">
            ↓
          </button>
          <button type="button" onClick={() => planActions.remove(index)} aria-label={`Remove ${drill.title}`}>
            ×
          </button>
        </div>
      </div>
      {swapping && (
        <div className="swap-list no-print">
          <span className="kicker">Swap for…</span>
          {options.length === 0 && <p>No other drills fit this slot. Use “Add a drill” below.</p>}
          {options.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                planActions.swap(index, d.id);
                onSwap();
              }}
            >
              <strong>{d.title}</strong>
              <small>
                {categoryLabel(d.category)} · {d.duration} min · {d.format}
              </small>
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

function AddDrill({ plan }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const band = bandOf(plan.band);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return DRILLS.filter(
      (d) =>
        (all || d.ages.some((a) => band.tags.includes(a))) &&
        (!needle || `${d.title} ${d.summary} ${categoryLabel(d.category)}`.toLowerCase().includes(needle)),
    ).slice(0, 40);
  }, [q, all, band]);

  return (
    <div className="add-drill no-print">
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "Close" : "+ Add a drill"}
      </button>
      {open && (
        <div className="add-panel">
          <div className="add-head">
            <input type="search" className="search" placeholder="Search drills…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search drills to add" />
            <label className="check">
              <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
              Show all ages
            </label>
          </div>
          <ul className="add-list">
            {results.map((d) => (
              <li key={d.id}>
                <span>
                  <strong>{d.title}</strong>
                  <small>
                    {categoryLabel(d.category)} · {d.duration} min · {d.format}
                  </small>
                </span>
                <button type="button" onClick={() => planActions.add(d.id)}>
                  Add
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="add-empty">No drills match.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function SavedPlans() {
  const saved = useSavedPlans();
  const [name, setName] = useState("");
  return (
    <div className="side-block no-print">
      <h2 className="kicker">Saved plans</h2>
      <form
        className="save-form"
        onSubmit={(e) => {
          e.preventDefault();
          savedActions.save(name);
          setName("");
        }}
      >
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this plan" aria-label="Plan name" maxLength={60} />
        <button type="submit" className="btn btn-ghost">
          Save
        </button>
      </form>
      {saved.length === 0 && <p className="side-empty">Saved plans stay in this browser.</p>}
      <ul className="saved-list">
        {saved.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => savedActions.open(s.id)}>
              <strong>{s.name}</strong>
              <small>
                {bandOf(s.plan.band).label} · {planMinutes(s.plan.items)} min
              </small>
            </button>
            <button type="button" className="saved-del" onClick={() => savedActions.delete(s.id)} aria-label={`Delete ${s.name}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function planText(plan) {
  let t = 0;
  const band = bandOf(plan.band);
  const lines = plan.items.map((it, i) => {
    const d = findDrill(it.id);
    const line = `${i + 1}. ${clock(t)} · ${d.title} (${it.min} min) – ${segmentLabel(it.seg)}\n   ${d.summary}`;
    t += it.min;
    return line;
  });
  const head = `${plan.title || "Practice plan"}\n${band.label} · ${band.sub} · ${plan.players} players · ${t} min`;
  const notes = plan.notes.trim() ? `\n\nNotes:\n${plan.notes.trim()}` : "";
  return `${head}\n\n${lines.join("\n")}${notes}`;
}

// Copies text and confirms on the button itself, since the page header is out of sight down here.
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API blocked (insecure origin, permissions): fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

function CopyButton({ label, done, getText }) {
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (state === "idle") return undefined;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const onClick = async () => setState((await writeClipboard(getText())) ? "done" : "failed");

  return (
    <button type="button" className={`btn btn-ghost copy-btn${state === "done" ? " is-done" : ""}${state === "failed" ? " is-failed" : ""}`} onClick={onClick}>
      <span aria-live="polite">{state === "done" ? `✓ ${done}` : state === "failed" ? "Couldn't copy" : label}</span>
    </button>
  );
}

const Planner = () => {
  const plan = usePlan();
  const session = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [swapping, setSwapping] = useState(-1);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    document.title = "Session Planner | Coach";
  }, []);

  // A shared link carries the whole plan in ?p=. Load it once, then tidy the URL
  // and leave a notice in the navigation state.
  const shared = params.get("p");
  useEffect(() => {
    if (!shared) return;
    const ok = planActions.load(decodePlan(shared));
    const notice = ok ? "Loaded the shared plan. Edit it freely: your changes stay in this browser." : "That link didn't contain a valid plan.";
    navigate("/coach/plan", { replace: true, state: { notice } });
  }, [shared, navigate]);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(""), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  const band = bandOf(plan.band);
  const total = planMinutes(plan.items);
  const diff = total - plan.length;
  const stale = isStale(plan);
  const advice = groupAdvice(plan.players, plan.band);
  const starts = plan.items.reduce((acc, it) => [...acc, acc[acc.length - 1] + it.min], [0]);
  const trayIds = session.ids.filter((id) => findDrill(id));

  const shareUrl = () => `${window.location.origin}/coach/plan?p=${encodePlan(plan)}`;

  const setPlayers = (n) => planActions.setSettings({ players: Math.min(60, Math.max(2, n)) });

  const rebuildClass = `btn${stale ? " pulse" : ""}`;

  return (
    <main className="planner wrap">
      <Link to="/coach" className="back-link no-print">
        ← All drills
      </Link>

      <header className="plan-head no-print">
        <span className="kicker">Session planner</span>
        <h1>
          A practice,
          <br />
          ready in a minute.
        </h1>
        <p className="lib-lede">
          Pick an age group, how many players you have and how long you've got. The planner builds a balanced session from the youth
          drills: a 10-minute warm-up and stretch, two to four 15–20 minute blocks and a short cool-down. Each block leaves room for explaining, water breaks and resets. Swap anything you don't like, then share it or print it.
        </p>
      </header>

      <section className="plan-setup no-print" aria-label="Session settings">
        <Options
          label="Age group"
          value={plan.band}
          onChange={(v) => planActions.setSettings({ band: v })}
          options={BANDS.map((b) => ({ id: b.id, label: b.label, sub: b.sub }))}
        />
        <Options
          label="Length"
          value={plan.length}
          onChange={(v) => planActions.setSettings({ length: v })}
          options={LENGTHS.map((m) => ({ id: m, label: `${m} min` }))}
        />
        <Options
          label="Focus"
          value={plan.focus}
          onChange={(v) => planActions.setSettings({ focus: v })}
          options={FOCUSES.map((f) => ({ id: f.id, label: f.label }))}
        />
        <div className="setup-row">
          <div className="players-field">
            <span className="chips-label">Players</span>
            <div className="num-stepper">
              <button type="button" onClick={() => setPlayers(plan.players - 1)} disabled={plan.players <= 2} aria-label="One fewer player">
                −
              </button>
              <span aria-live="polite" aria-label="Number of players">
                {plan.players}
              </span>
              <button type="button" onClick={() => setPlayers(plan.players + 1)} disabled={plan.players >= 60} aria-label="One more player">
                +
              </button>
            </div>
          </div>
          <div className="setup-actions">
            <button type="button" className={rebuildClass} onClick={() => planActions.build()}>
              {stale ? "Rebuild with these settings" : "Build plan"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={planActions.shuffle} title="Same settings, different drills">
              Shuffle
            </button>
          </div>
        </div>
        {stale && <p className="stale-note">Settings changed. Rebuild to update the plan below.</p>}
        {advice && <p className="advice">{advice}</p>}
      </section>

      {(flash || location.state?.notice) && (
        <p className="plan-flash no-print" role="status">
          {flash || location.state.notice}
        </p>
      )}

      <div className="plan-layout">
        <section className="plan-main" aria-label="Your session">
          <div className="plan-title-row">
            <input
              className="plan-title no-print"
              type="text"
              value={plan.title}
              onChange={(e) => planActions.setSettings({ title: e.target.value })}
              placeholder="Name this practice (e.g. Tuesday U11 Red)"
              aria-label="Practice name"
              maxLength={80}
            />
            <h2 className="print-only plan-print-title">{plan.title || "Practice plan"}</h2>
            <p className="plan-sub">
              {band.label} · {band.sub} · {plan.players} players · {plan.focus === "mixed" ? "Fun & fundamentals" : FOCUSES.find((f) => f.id === plan.focus)?.label}
            </p>
          </div>

          <div className="plan-total">
            <strong>{total} min</strong>
            <span className={diff === 0 ? "ok" : "off"}>
              {diff === 0 ? `on target for ${plan.length} min` : diff > 0 ? `${diff} min over your ${plan.length} min` : `${-diff} min under your ${plan.length} min`}
            </span>
          </div>
          <div className="plan-bar" aria-hidden="true">
            {plan.items.map((it, i) => (
              <i key={i} className={`bar-${it.seg}`} style={{ flexGrow: it.min }} title={`${findDrill(it.id)?.title} · ${it.min} min`} />
            ))}
          </div>
          <div className="plan-key no-print" aria-hidden="true">
            {SEGMENTS.map((s) => (
              <span key={s.id}>
                <i className={`bar-${s.id}`} />
                {s.label}
              </span>
            ))}
          </div>

          {plan.items.length === 0 ? (
            <p className="empty">The plan is empty. Build one with the settings above, or add a drill.</p>
          ) : (
            <ol className="blocks">
              {plan.items.map((it, i) => (
                <Block
                  key={`${it.id}-${i}`}
                  item={it}
                  index={i}
                  start={starts[i]}
                  last={i === plan.items.length - 1}
                  plan={plan}
                  swapping={swapping === i}
                  onSwap={() => setSwapping((s) => (s === i ? -1 : i))}
                />
              ))}
            </ol>
          )}

          <AddDrill plan={plan} />

          <div className="plan-notes no-print">
            <label htmlFor="plan-notes" className="kicker">
              Coach notes
            </label>
            <textarea
              id="plan-notes"
              value={plan.notes}
              onChange={(e) => planActions.setSettings({ notes: e.target.value })}
              placeholder="Reminders for yourself or a helper: equipment, who sits out, what to praise…"
              rows={4}
              maxLength={1500}
            />
          </div>
          {plan.notes.trim() && (
            <div className="print-only">
              <h3 className="kicker">Coach notes</h3>
              <p className="print-notes">{plan.notes}</p>
            </div>
          )}
        </section>

        <aside className="plan-side">
          <div className="side-block no-print">
            <h2 className="kicker">Share & print</h2>
            <div className="side-buttons">
              <button type="button" className="btn" onClick={() => window.print()}>
                Print or save PDF
              </button>
              <CopyButton label="Copy share link" done="Link copied" getText={shareUrl} />
              <CopyButton label="Copy as text" done="Plan copied" getText={() => planText(plan)} />
              <p className="copy-hint" aria-hidden="true">
                The link opens this exact plan on any device.
              </p>
            </div>
            {trayIds.length > 0 && (
              <button
                type="button"
                className="link-btn side-link"
                onClick={() => {
                  planActions.importIds(trayIds);
                  setFlash(`Replaced the plan with your ${trayIds.length} session-tray drills.`);
                }}
              >
                Use the {trayIds.length} drills from my session tray
              </button>
            )}
          </div>

          <div className="side-block">
            <h2 className="kicker">Coaching {band.label} · {band.sub}</h2>
            <ul className="tips">
              {band.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="side-block no-print">
            <h2 className="kicker">Running the session</h2>
            <ol className="run-order">
              {SEGMENTS.map((s) => (
                <li key={s.id}>
                  <strong>{s.label}</strong>
                  <span>{s.note}</span>
                </li>
              ))}
            </ol>
            <p className="side-empty">Give a water break between blocks. Arrive early to set cones before players arrive.</p>
          </div>

          <SavedPlans />

          <button
            type="button"
            className="btn btn-ghost start-over no-print"
            onClick={() => {
              if (window.confirm("Start over with a fresh plan? Your current plan will be replaced.")) planActions.reset();
            }}
          >
            Start over with a fresh plan
          </button>
        </aside>
      </div>

      {/* Printed handout: every drill's setup, steps and coaching points. */}
      <section className="print-only print-details">
        <h2>Drill details</h2>
        {plan.items.map((it, i) => {
          const d = findDrill(it.id);
          if (!d) return null;
          return (
            <article key={`${it.id}-${i}`} className="print-drill">
              <h3>
                {i + 1}. {d.title} <span>{it.min} min · {d.area}</span>
              </h3>
              <div className="print-cols">
                <div>
                  <h4>Setup</h4>
                  <ul>{d.setup.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
                <div>
                  <h4>How it runs</h4>
                  <ol>{d.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                </div>
                <div>
                  <h4>Coaching points</h4>
                  <ul>{d.points.map((s) => <li key={s}>{s}</li>)}</ul>
                  {d.ask && (
                    <>
                      <h4>Ask the players</h4>
                      <ul>{d.ask.map((s) => <li key={s}>{s}</li>)}</ul>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default Planner;
