import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Pitch from "./Pitch";
import { buildStates, deriveArrows } from "./diagram";
import usePlayback from "./usePlayback";
import { DRILLS, findDrill } from "./drills";
import { POSITIONS, ageRange, categoryLabel, youtubeSearch } from "./meta";
import { useSession } from "./session";
import Intensity from "./Intensity";

const LEGEND = [
  { k: "pass", label: "Pass" },
  { k: "run", label: "Run" },
  { k: "dribble", label: "Dribble" },
  { k: "shot", label: "Shot" },
];

function Legend({ diagram, states }) {
  const teams = [...new Set(states.flatMap((st) => Object.values(st.team)))];
  const names = { a: "Coached", b: "Opponents", n: "Neutral", gk: "Keeper", c: "Coach / server" };
  const hasFeet = states.some((st) => st.feet.length);
  const hasFacing = diagram.players.some((p) => p.f !== undefined);
  const kinds = new Set(states.flatMap((st, i) => (i > 0 ? deriveArrows(states[i - 1], st, 1).map((a) => a.k) : [])));
  const arrowItems = LEGEND.filter((l) => kinds.has(l.k));
  return (
    <div className="legend">
      {teams.map((t) => (
        <span key={t} className="legend-item">
          <i className={`legend-dot player-${t}`} />
          {names[t]}
        </span>
      ))}
      {hasFacing && (
        <span className="legend-item">
          <i className="legend-face" />
          Facing
        </span>
      )}
      {hasFeet && (
        <>
          <span className="legend-item">
            <i className="legend-foot foot-L" />
            Left foot
          </span>
          <span className="legend-item">
            <i className="legend-foot foot-R" />
            Right foot
          </span>
        </>
      )}
      {arrowItems.length > 0 && <span className="legend-sep" />}
      {arrowItems.map((l) => (
        <span key={l.k} className="legend-item">
          <svg viewBox="0 0 28 8" className={`legend-line legend-${l.k}`} aria-hidden="true">
            {l.k === "dribble" ? (
              <path d="M1 4 Q 4 0 7 4 T 13 4 T 19 4 T 25 4" />
            ) : (
              <line x1="1" y1="4" x2="25" y2="4" />
            )}
          </svg>
          {l.label}
        </span>
      ))}
    </div>
  );
}

function Board({ diagram, title }) {
  const states = useMemo(() => buildStates(diagram), [diagram]);
  const pb = usePlayback(states.length);
  const [trail, setTrail] = useState(true);

  const onKey = (e) => {
    if (e.key === "ArrowRight") {
      pb.pause();
      pb.next();
    } else if (e.key === "ArrowLeft") {
      pb.pause();
      pb.prev();
    } else if (e.key === " ") {
      e.preventDefault();
      pb.toggle();
    }
  };

  return (
    <div className="board" tabIndex={0} onKeyDown={onKey} aria-label="Animated drill diagram. Space to play or pause, arrow keys to step.">
      <div className="board-pitch">
        <Pitch diagram={diagram} states={states} frame={pb.frame} instant={pb.instant} trail={trail} label={`${title} diagram`} />
      </div>
      <div className="board-bar">
        <div className="board-controls">
          <button type="button" onClick={() => { pb.pause(); pb.prev(); }} aria-label="Previous step">
            <svg viewBox="0 0 16 16"><path d="M10 3 L5 8 L10 13" /></svg>
          </button>
          <button type="button" className="board-play" onClick={pb.toggle} aria-label={pb.playing ? "Pause" : "Play"}>
            {pb.playing ? (
              <svg viewBox="0 0 16 16"><path d="M5 3 V13 M11 3 V13" /></svg>
            ) : (
              <svg viewBox="0 0 16 16"><path d="M5 3 L12 8 L5 13 Z" className="fill" /></svg>
            )}
          </button>
          <button type="button" onClick={() => { pb.pause(); pb.next(); }} aria-label="Next step">
            <svg viewBox="0 0 16 16"><path d="M6 3 L11 8 L6 13" /></svg>
          </button>
        </div>
        <div className="board-steps" role="tablist" aria-label="Steps">
          {states.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === pb.frame}
              aria-label={`Step ${i + 1}`}
              className={`step${i === pb.frame ? " is-current" : ""}${i < pb.frame ? " is-done" : ""}`}
              onClick={() => { pb.pause(); pb.goTo(i); }}
            />
          ))}
        </div>
        <span className="board-count">
          {pb.frame + 1}/{states.length}
        </span>
        <button
          type="button"
          className={`board-trail${trail ? " is-on" : ""}`}
          onClick={() => setTrail((t) => !t)}
          aria-pressed={trail}
          title="Keep earlier steps on the board"
        >
          Trail
        </button>
      </div>
      <p className="board-caption" aria-live="polite">
        {states[pb.frame].note}
      </p>
      <Legend diagram={diagram} states={states} />
    </div>
  );
}

function Variations({ drill }) {
  const options = [
    { name: drill.diagramName || "Basic", summary: null, diagram: drill.diagram },
    ...(drill.variations || []),
  ];
  const [active, setActive] = useState(0);
  const current = options[active];

  return (
    <section className="variations">
      {options.length > 1 && (
        <div className="var-tabs" role="tablist" aria-label="Variations">
          {options.map((o, i) => (
            <button
              key={o.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`var-tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {o.name}
            </button>
          ))}
        </div>
      )}
      {current.summary && <p className="var-summary">{current.summary}</p>}
      <Board key={active} diagram={current.diagram} title={`${drill.title}: ${current.name}`} />
    </section>
  );
}

function Video({ video }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="video">
      <div className="video-frame">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="video-poster" onClick={() => setPlay(true)} aria-label={`Play: ${video.title}`}>
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="video-play">
              <svg viewBox="0 0 16 16"><path d="M5 3 L12 8 L5 13 Z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
          {video.title}
        </a>
        <span>{video.channel}</span>
      </figcaption>
    </figure>
  );
}

function List({ title, items, ordered }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="detail-block">
      <h2 className="kicker">{title}</h2>
      <Tag className={ordered ? "steps-list" : "points-list"}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </Tag>
    </div>
  );
}

const DrillPage = () => {
  const { drillId } = useParams();
  const { state } = useLocation();
  const drill = findDrill(drillId);
  const session = useSession();

  useEffect(() => {
    if (drill) document.title = `${drill.title} | Coach`;
  }, [drill]);

  const backTo = `/coach${state?.search ? `?${state.search}` : ""}`;

  if (!drill) {
    return (
      <main className="wrap detail-missing">
        <h1>Drill not found</h1>
        <Link to="/coach" className="btn">
          Back to the library
        </Link>
      </main>
    );
  }

  const siblings = DRILLS.filter((d) => d.category === drill.category);
  const idx = siblings.indexOf(drill);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const inSession = session.has(drill.id);

  return (
    <main className="detail wrap" key={drill.id}>
      <Link to={backTo} className="back-link">
        ← All drills
      </Link>

      <header className="detail-head">
        <span className="kicker">
          <Link to={`/coach?cat=${drill.category}`}>{categoryLabel(drill.category)}</Link> · {drill.format}
        </span>
        <h1>{drill.title}</h1>
        <p className="detail-summary">{drill.summary}</p>
        <button
          type="button"
          className={`btn${inSession ? " btn-ghost" : ""}`}
          onClick={() => session.toggle(drill.id)}
          aria-pressed={inSession}
        >
          {inSession ? "✓ In today's session" : "+ Add to session"}
        </button>
      </header>

      <Variations key={drill.id} drill={drill} />

      <dl className="facts">
        <div>
          <dt>Ages</dt>
          <dd>{ageRange(drill.ages)}</dd>
        </div>
        <div>
          <dt>Positions</dt>
          <dd>
            {POSITIONS.filter((p) => drill.positions.includes(p.id))
              .map((p) => p.id)
              .join(" · ")}
          </dd>
        </div>
        <div>
          <dt>Players</dt>
          <dd>{drill.players}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{drill.area}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{drill.duration} min</dd>
        </div>
        <div>
          <dt>Intensity</dt>
          <dd>
            <Intensity level={drill.intensity} />
          </dd>
        </div>
      </dl>

      <div className="detail-grid">
        <List title="Setup" items={drill.setup} />
        <List title="How it runs" items={drill.steps} ordered />
        <List title="Coaching points" items={drill.points} />
        <List title="Progressions" items={drill.progressions} />
      </div>

      <section className="videos">
        <div className="videos-head">
          <h2 className="kicker">Watch it</h2>
          <a href={youtubeSearch(drill.search)} target="_blank" rel="noopener noreferrer" className="link-arrow">
            More on YouTube →
          </a>
        </div>
        <div className="video-grid">
          {drill.videos.map((v) => (
            <Video key={v.id} video={v} />
          ))}
        </div>
      </section>

      <nav className="pager" aria-label="More drills in this category">
        {prev ? (
          <Link to={`/coach/${prev.id}`} state={state}>
            <span className="kicker">← Previous</span>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/coach/${next.id}`} state={state} className="pager-next">
            <span className="kicker">Next →</span>
            {next.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
};

export default DrillPage;
