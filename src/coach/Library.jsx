import React, { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pitch from "./Pitch";
import { DRILLS } from "./drills";
import { AGES, AGE_GUIDE, CATEGORIES, POSITIONS, ageRange } from "./meta";
import { useSession } from "./session";
import Intensity from "./Intensity";

function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      <span className="chips-label">{label}</span>
      <div className="chips-row">
        <button type="button" className={`chip${!value ? " is-active" : ""}`} onClick={() => onChange("")}>
          All
        </button>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`chip${value === o.id ? " is-active" : ""}`}
            onClick={() => onChange(value === o.id ? "" : o.id)}
            aria-pressed={value === o.id}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DrillCard({ drill, search }) {
  const session = useSession();
  const inSession = session.has(drill.id);
  // Thumbnails show the final step with the full trail, so the whole pattern is
  // visible, stopping before any closing rotation that would clear it.
  const frames = drill.diagram.frames || [];
  let thumbFrame = frames.length;
  while (thumbFrame > 1 && frames[thumbFrame - 1].reset) thumbFrame--;
  const variations = drill.variations?.length ?? 0;
  return (
    <article className="card">
      <Link to={`/coach/${drill.id}`} state={{ search }} className="card-link">
        <div className="card-pitch">
          <Pitch diagram={drill.diagram} frame={thumbFrame} trail mini label={`${drill.title} diagram`} />
        </div>
        <div className="card-body">
          <h3>{drill.title}</h3>
          <p className="card-meta">
            <span>{ageRange(drill.ages)}</span>
            <span>{drill.duration} min</span>
            <span>{drill.format}</span>
            <Intensity level={drill.intensity} />
          </p>
          {variations > 0 && <span className="card-var">+{variations} {variations === 1 ? "variation" : "variations"}</span>}
        </div>
      </Link>
      <button
        type="button"
        className={`card-add${inSession ? " is-added" : ""}`}
        onClick={() => session.toggle(drill.id)}
        aria-pressed={inSession}
        aria-label={inSession ? `Remove ${drill.title} from session` : `Add ${drill.title} to session`}
        title={inSession ? "Remove from session" : "Add to session"}
      >
        {inSession ? "✓" : "+"}
      </button>
    </article>
  );
}

const Library = () => {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "";
  const age = params.get("age") || "";
  const pos = params.get("pos") || "";
  const q = params.get("q") || "";

  useEffect(() => {
    document.title = "Coach | Soccer Drill Library";
  }, []);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return DRILLS.filter(
      (d) =>
        (!cat || d.category === cat) &&
        (!age || d.ages.includes(age)) &&
        (!pos || d.positions.includes(pos)) &&
        (!needle ||
          `${d.title} ${d.summary} ${d.category} ${d.format} ${(d.variations || []).map((v) => v.name).join(" ")}`.toLowerCase().includes(needle)),
    );
  }, [cat, age, pos, q]);

  const groups = CATEGORIES.map((c) => ({
    ...c,
    drills: filtered.filter((d) => d.category === c.id),
  })).filter((g) => g.drills.length);

  const hasFilters = cat || age || pos || q;
  const search = params.toString();

  return (
    <main className="library">
      <section className="lib-hero wrap">
        <span className="kicker">Drill library</span>
        <h1>
          Every drill,
          <br />
          on the chalkboard.
        </h1>
        <p className="lib-lede">
          {DRILLS.length} animated sessions, from first touches for six-year-olds to pressing triggers for a
          back four. Filter by age, position or phase of play, and build today's session as you go.
        </p>
      </section>

      <section className="age-guide wrap" aria-label="Coaching by age">
        {AGE_GUIDE.map((g) => (
          <div key={g.age} className="age-cell">
            <span className="age-cell-age">{g.age}</span>
            <strong>{g.focus}</strong>
            <p>{g.text}</p>
          </div>
        ))}
      </section>

      <section className="filters wrap" aria-label="Filters">
        <div className="filters-top">
          <input
            type="search"
            className="search"
            placeholder="Search drills…"
            value={q}
            onChange={(e) => set("q", e.target.value)}
            aria-label="Search drills"
          />
          <span className="result-count">
            {filtered.length} {filtered.length === 1 ? "drill" : "drills"}
            {hasFilters && (
              <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>
                Reset
              </button>
            )}
          </span>
        </div>
        <Chips label="Phase" options={CATEGORIES} value={cat} onChange={(v) => set("cat", v)} />
        <Chips label="Age" options={AGES} value={age} onChange={(v) => set("age", v)} />
        <Chips label="Position" options={POSITIONS} value={pos} onChange={(v) => set("pos", v)} />
      </section>

      <section className="wrap">
        {groups.length === 0 && (
          <p className="empty">No drills match those filters. Try widening the age group or position.</p>
        )}
        {groups.map((g) => (
          <div key={g.id} className="group">
            <div className="group-head">
              <h2>{g.label}</h2>
              <span>{String(g.drills.length).padStart(2, "0")}</span>
            </div>
            <div className="grid">
              {g.drills.map((d) => (
                <DrillCard key={d.id} drill={d} search={search} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Library;
