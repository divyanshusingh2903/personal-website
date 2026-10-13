import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Shell, { Level, Top, GITHUB_URL } from "../harbinger/Shell";
import { G } from "../harbinger/Glossary";
import { Bars, Deltas, Facts } from "../harbinger/Charts";
import { Headlines, MoreFrom, Pill, SectionNav } from "../harbinger/Ui";
import "../harbinger/harbinger.css";

const REPORT = `${GITHUB_URL}/blob/main`;

const NAV = [
  { id: "decisions", label: "Decisions" },
  { id: "phase-1", label: "1 · Foundations" },
  { id: "phase-2", label: "2 · Does routing work?" },
  { id: "phase-3", label: "3 · Closing gaps" },
  { id: "phase-4", label: "4 · Beyond the lab" },
  { id: "next", label: "Next" },
];

// What the experiments decided, and which ones decided it.
const DECISIONS = [
  ["Learn each key's duration as a decaying histogram inside the broker, in C++. No model server.", "Shipped", [2, 6]],
  ["Judge by mean and short-job median, per class. All-message P99 is a guardrail, not a goal.", "Shipped", [1]],
  ["Predictive routing is opt-in. Static priority stays the default, and shadow mode comes first.", "Shipped", [3, 4]],
  ["A prediction for a still-fresh key counts as activity, so keys stuck in a backlog are not written off.", "Shipped", [5]],
  ["Size-binned keys for jobs whose cost follows input size.", "Opt-in", [7, 8]],
  ["Level weights with pausing aging for sustained overload.", "Opt-in", [5, 9, 11]],
  ["Use the overload design only where per-key prediction has been shown to work.", "Guideline", [12]],
  ["The scheduling idea works on another broker too, so it is separable from Harbinger's own queue.", "Finding", [13]],
];

function MiniCompare({ title, rows, unit, max, digits }) {
  return (
    <div className="mini">
      <h5>{title}</h5>
      <Bars rows={rows} unit={unit} max={max} digits={digits ?? (rows.some((r) => r.value < 10) ? 2 : 1)} />
    </div>
  );
}

// One collapsible experiment. The header always shows the finding and the decision it led to.
function Exp({ id, n, title, outcome, kind, finding, decision, question, facts, children, learned, changed, links, open, onToggle }) {
  return (
    <article className="exp" id={id} data-open={open ? "" : undefined} data-kind={kind}>
      <button type="button" className="exp-head" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => onToggle(id)}>
        <span className="exp-n">{n}</span>
        <span className="exp-title">
          <strong>{title}</strong>
          <Pill kind={kind}>{outcome}</Pill>
        </span>
        <span className="exp-chev" aria-hidden="true" />
      </button>
      <dl className="exp-brief">
        <div><dt>Found</dt><dd><G>{finding}</G></dd></div>
        <div><dt>So</dt><dd><G>{decision}</G></dd></div>
      </dl>
      {open && (
        <div className="exp-body" id={`${id}-body`}>
          <p className="exp-q"><b>Question</b><G>{question}</G></p>
          {facts && <Facts items={facts} />}
          {children && <div className="exp-viz">{children}</div>}
          <div className="exp-takeaways">
            <div>
              <h4>What we learned</h4>
              <ul>{learned.map((t) => <li key={t}><G>{t}</G></li>)}</ul>
            </div>
            <div className="exp-changed">
              <h4>What it changed</h4>
              <ul>{changed.map((t) => <li key={t}><G>{t}</G></li>)}</ul>
            </div>
          </div>
          {links && (
            <p className="exp-links">
              {links.map((l) => (l.to ? (
                <Link key={l.label} className="exp-src" to={l.to}>{l.label} →</Link>
              ) : (
                <a key={l.label} className="exp-src" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
              )))}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function HarbingerExperiments() {
  const [open, setOpen] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const reveal = useCallback((id, smooth = true) => {
    setOpen((prev) => new Set(prev).add(id));
    // Two frames: let the card expand before measuring where to scroll.
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" })));
  }, []);

  // Deep links like /harbinger/experiments#exp-9 open that experiment.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (id.startsWith("exp-")) reveal(id, false);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [reveal]);

  const ALL = Array.from({ length: 13 }, (_, i) => `exp-${i + 1}`);
  const allOpen = ALL.every((id) => open.has(id));
  const props = (id) => ({ id, n: Number(id.slice(4)), open: open.has(id), onToggle: toggle });

  return (
    <Shell title="Harbinger experiments | How they shaped the design">
      <section className="hb-hero hb-hero-short">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Experiments</p>
          <h1>How the experiments shaped Harbinger.</h1>
          <p className="hb-lede">
            <G>Every experiment ended in a design decision. Several missed their own pre-registered gates, and those misses shaped the design as much as the passes did. The numbers behind the headline results are on the benchmarks page.</G>
          </p>
        </div>
      </section>

      <SectionNav items={NAV} />

      <div className="hb-page">
        <Level level={0} tag="Overview" title="What was decided" id="decisions">
          <Headlines items={[["13", "steps", "12 experiments and 1 pre-registration"], ["4", "passed their gate"], ["4", "mixed results"], ["4", "missed their gate"]]} />
          <ul className="ledger">
            {DECISIONS.map(([text, status, ids]) => (
              <li key={text}>
                <span className="ledger-text"><G>{text}</G></span>
                <span className="ledger-status">{status}</span>
                <span className="ledger-ids">
                  {ids.map((n) => (
                    <button key={n} type="button" className="chip" onClick={() => reveal(`exp-${n}`)} aria-label={`Open experiment ${n}`}>{n}</button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <div className="exp-toolbar">
            <span>Each experiment opens to its question, evidence and takeaways.</span>
            <button type="button" className="hb-pill" onClick={() => setOpen(allOpen ? new Set() : new Set(ALL))}>
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </Level>

        <Level level={0} tag="Phase 1" title="Foundations: what to build, and how to judge it" id="phase-1">
          <div className="exp-list">
            <Exp
              {...props("exp-1")} title="Baseline scheduling policies" outcome="Mixed: no universal winner" kind="mixed"
              finding="Static priority is no universal winner and can't fix the tail."
              decision="Hypothesis revised: expect median and mean wins, not P99."
              question="Before predicting anything, how do FIFO, static priority and round-robin behave on a real gRPC broker, and what does a good priority map actually buy?"
              facts={[["750", "trials"], ["15 × 5 × 2 × 5", "cases × seeds × repeats × policies"], ["707", "valid; 43 lost feedback"], ["200", "messages per trial"]]}
              learned={[
                "Static priority only helps when job metadata is informative, and then it lowers median latency, not the tail.",
                "On controls where metadata is uninformative or its relationship shifts, static priority was clearly worse than FIFO.",
                "Non-preemptive reordering cannot shorten a long job's own service time, so P95 stays flat and P99 can rise.",
                "43 trials lost feedback records. They are kept and flagged rather than dropped.",
              ]}
              changed={[
                "Hypothesis revised: expect lower median and mean and less head-of-line blocking, not a better P99.",
                "Metrics moved to per-class percentiles, slowdown and starvation, with all-message P99 as a guardrail.",
              ]}
            >
              <h5 className="viz-title">Static priority vs FIFO, median per-trial P95 (descriptive)</h5>
              <Deltas
                rows={[
                  { label: "Bimodal, near capacity", value: -1 },
                  { label: "Bimodal, overload", value: -7 },
                  { label: "Uniform, overload", value: 7 },
                  { label: "Heavy tail, overload", value: 30 },
                  { label: "Relationship shifts", value: 50 },
                  { label: "Uninformative metadata", value: 63 },
                ]}
              />
            </Exp>

            <Exp
              {...props("exp-2")} title="Eight online duration predictors" outcome="No qualifier under the v1 gates" kind="fail"
              finding="Simple per-key statistics matched or beat all eight online models."
              decision="The predictor became a C++ per-key histogram. Python stayed offline."
              question="Can any incremental model predict handler duration well enough, within a strict latency and memory budget, to drive routing?"
              facts={[["8", "candidates"], ["6", "workload cells"], ["120,000", "messages"], ["0.077 ms", "worst P99 lookup (1 ms budget)"], ["87 KB", "max model state (32 MiB budget)"]]}
              learned={[
                "Per-job means do almost all the work where metadata is informative. Trees added cost without winning.",
                "Where the job-to-duration relationship shifts, the per-job mean fails, while a decaying average (EWMA) adapts.",
                "Every candidate fit the resource budgets easily, so cost was never the limiting factor.",
                "The synthetic workload made a per-key average near-optimal by construction, so it can't separate richer models.",
              ]}
              changed={[
                "The predictor became a per-key decaying duration histogram in C++, inside the broker. No model server on the serving path.",
                "Decay and idle half-life were designed in to handle drift.",
                "Python stayed as the offline evaluation harness.",
              ]}
            >
              <div className="mini-grid">
                <MiniCompare title="Informative, uniform (MAE ms)" unit="" rows={[
                  { label: "Global mean", value: 4.769 }, { label: "Per-job mean", value: 1.601, kind: "ours" }, { label: "Per-job EWMA", value: 1.617 }, { label: "Adaptive tree", value: 4.769 },
                ]} />
                <MiniCompare title="Informative, bimodal (MAE ms)" unit="" rows={[
                  { label: "Global mean", value: 5.358 }, { label: "Per-job mean", value: 0.306, kind: "ours" }, { label: "Per-job EWMA", value: 0.305 }, { label: "Adaptive tree", value: 0.568 },
                ]} />
                <MiniCompare title="Relationship shift (MAE ms)" unit="" rows={[
                  { label: "Global mean", value: 1.892 }, { label: "Per-job mean", value: 1.943 }, { label: "Per-job EWMA", value: 1.279, kind: "ours" }, { label: "Adaptive tree", value: 1.696 },
                ]} />
              </div>
            </Exp>

            <Exp
              {...props("exp-3")} title="Pre-registering v2" outcome="Frozen 2026-10-05, before any predictive run" kind="note"
              finding="The v1 budgets could not be met even by a perfect static map."
              decision="Re-pre-registered on a realistic workload before any predictive run."
              question={'What should "it works" mean, and what would count as failing, before we look at a single predictive result?'}
              learned={[
                'The v1 "10% P95 improvement" budget could not be met even by a perfect static map, so it was the wrong yardstick.',
                "The new budgets were chosen after seeing experiment 1 data and two FIFO-only load pilots. They are not blind, and the pre-registration says so.",
              ]}
              changed={[
                "Gate = P1, P2 and G1–G4 must all pass. Anything unevaluable counts as a failure.",
                "Default routing stays static whatever the result.",
                "Results are paired by seed with bootstrap 95% intervals, and old results stay published.",
              ]}
              links={[{ label: "Pre-registration", href: `${REPORT}/docs/v2-preregistration.md` }]}
            >
              <div className="crit">
                {[
                  ["Improve", ["P1 mean latency ≤ −15% vs FIFO", "P2 short-job median ≤ −30%"]],
                  ["Guardrails", ["G1 P99 ≤ 1.25× FIFO", "G2 long-job max wait ≤ 2×, none over 60 s", "G3 no lost work", "G4 throughput ≥ 0.98×"]],
                  ["Secondary", ["S1 non-inferior to a tuned static map", "S2 beats a misconfigured map", "S3 shadow overhead within ±5%", "S4 zero-config beats FIFO"]],
                ].map(([name, items]) => (
                  <div key={name}>
                    <h5>{name}</h5>
                    <ul>{items.map((t) => <li key={t}><G>{t}</G></li>)}</ul>
                  </div>
                ))}
              </div>
            </Exp>
          </div>
        </Level>

        <Level level={1} tag="Phase 2" title="Does routing work on real work?" id="phase-2">
          <div className="exp-list">
            <Exp
              {...props("exp-4")} title="Production-flow benchmark" outcome="Gate passed" kind="pass"
              finding="Learned routing beat FIFO and a hand-tuned map with no configuration, but the tail did not improve."
              decision="Predictive routing is opt-in and static stays the default. Shadow mode comes first."
              question="On a realistic e-commerce job queue with a flash sale and a mid-run cost shift, does learned routing beat FIFO and a hand-tuned static map, with no hand configuration?"
              facts={[["9", "job types, 5 services"], ["7", "arms"], ["5", "seeds"], ["~35,000", "messages per run"], ["10 / 10", "criteria passed"]]}
              learned={[
                "The learned map beat a human-tuned one by 10.9% mean latency. The operator put invoice generation in the middle tier, but its real median is milliseconds.",
                "With no job labels at all (key = producer) it still cut mean latency 15%, about half the labelled benefit.",
                "The tail did not improve: all-message P99 rose 4% and long jobs got no faster. Aging held export max wait to within 2% of FIFO.",
                'The "oracle" is a reference, not a ceiling. Under contention its planned costs are approximate, and predictive tied it statistically.',
                "Limits: one 4-vCPU machine, simulated network latency, one scenario that we wrote.",
              ]}
              changed={[
                "Predictive routing becomes an explicit opt-in. Static stays the default.",
                "Operating path defined: shadow mode first, then predictive. Rollback is one restart.",
                "Labelled job_type keys roughly doubled the benefit, so producers are encouraged to send them.",
              ]}
              links={[{ label: "Full report and tables", href: `${REPORT}/docs/phase2-report.md` }, { label: "Later replicated on AWS", to: "/harbinger/benchmarks#production" }]}
            >
              <div className="mini-grid two">
                <MiniCompare title="Mean latency (s)" unit=" s" rows={[
                  { label: "FIFO", value: 8.03, kind: "base" },
                  { label: "Static, misconfigured", value: 8.69 },
                  { label: "Shadow", value: 7.97 },
                  { label: "Static, tuned", value: 6.95 },
                  { label: "Predictive, no labels", value: 6.91 },
                  { label: "Oracle", value: 6.64 },
                  { label: "Predictive", value: 6.16, kind: "ours" },
                ]} />
                <MiniCompare title="Short-job median latency (s)" unit=" s" rows={[
                  { label: "Static, misconfigured", value: 7.94 },
                  { label: "FIFO", value: 6.03, kind: "base" },
                  { label: "Predictive, no labels", value: 3.45 },
                  { label: "Static, tuned", value: 1.64 },
                  { label: "Oracle", value: 1.05 },
                  { label: "Predictive", value: 0.098, kind: "ours", text: "0.10 s" },
                ]} />
              </div>
              <p className="viz-note">Original local run. A later quiet-machine re-run gave smaller short-job gains because its CPU was slower. See the benchmarks page.</p>
            </Exp>

            <Exp
              {...props("exp-5")} title="Azure Functions trace simulation" outcome="Gate not passed" kind="fail"
              finding="Under sustained overload, aging collapses every policy into FIFO."
              decision="The failed gate stands, a stale-key bug was fixed, and level weights with pausing aging became experiment 9."
              question="Does the same routing help on a real-world trace: 990,476 invocations from the Azure Functions 2021 dataset, replayed through 64 shared workers?"
              facts={[["990,476", "invocations"], ["64", "shared workers"], ["3", "load levels: 0.5 / 0.8 / 0.95"], ["1–3%", "gain for every policy, even the oracle"]]}
              learned={[
                "The trace is extremely bursty: a handful of hours exceed capacity and create multi-hour backlogs that dominate every mean.",
                "With 5 s aging, every message in a backlog that long is promoted to the top tier within seconds, so all policies collapse into FIFO.",
                "Re-running with aging off (exploratory, not part of the registered result) separates them: the oracle −50%, predictive −31%, static history −2%.",
                "Pooling 64 workers across all functions isn't how serverless scales, so the model limits what this trace can show too.",
                "Digging in also exposed a bug: staleness was measured from a key's last completed job. Keys stuck in a backlog had no completions, so the predictor wrote them off. 47.6% of predictions during backlogs fell back as stale at load 0.5, against 0.6% otherwise.",
              ]}
              changed={[
                "The failed gate is reported unchanged. Nothing was re-tuned.",
                "Stale-key fix (#38): a prediction for a still-fresh key now counts as activity. Stale share during backlogs fell to 36.4% / 24.9% / 21.7% across the three loads, and with aging off predictive improved slightly at every load.",
                "Aging and sustained overload interact: aging turns any priority policy into FIFO. This led straight to experiment 9.",
              ]}
            >
              <div className="mini-grid two">
                <MiniCompare title="Mean latency reduction vs FIFO, aging on (5 s)" unit="%" max={100} digits={1} rows={[
                  { label: "Load 0.50", value: 0.9, kind: "ours", text: "−0.9%" },
                  { label: "Load 0.80", value: 1.4, kind: "ours", text: "−1.4%" },
                  { label: "Load 0.95", value: 2.8, kind: "ours", text: "−2.8%" },
                ]} />
                <MiniCompare title="Mean latency reduction vs FIFO at load 0.5, aging off" unit="%" max={100} rows={[
                  { label: "Static history map", value: 2, text: "−2%" },
                  { label: "Predictive", value: 31, kind: "ours", text: "−31%" },
                  { label: "Oracle", value: 50, text: "−50%" },
                ]} />
              </div>
            </Exp>

            <Exp
              {...props("exp-6")} title="Real-data predictability" outcome="Per-key stats predict real durations" kind="pass"
              finding="The Azure failure came from queueing dynamics, not from unpredictable jobs."
              decision="Per-key statistics are confirmed as the serving model. Cold-start fallback matters."
              question="Setting scheduling aside, are real job durations predictable from the key alone? Learn on the trace's first week, then predict the second."
              facts={[["73%", "of held-out traffic passes the sample and spread gates"], ["17%", "comes from keys unseen in week one"]]}
              learned={[
                "A per-key median is off by a median factor of 1.3. A single global median is off by 29.",
                "79% of held-out jobs land in the correct tier with per-key medians, against 57% for a global one.",
                "The signal exists in real traffic. The Azure failure came from queueing dynamics, not from unpredictable jobs.",
              ]}
              changed={[
                "Confirms that per-key statistics are the right serving model.",
                "Unseen keys are real (17%), so the cold-start fallback matters.",
              ]}
            >
              <div className="mini-grid two">
                <MiniCompare title="Predicted within 2× of actual" unit="%" rows={[
                  { label: "Global median", value: 10, kind: "base" }, { label: "Per-key median", value: 62, kind: "ours" },
                ]} max={100} digits={0} />
                <MiniCompare title="Assigned the correct tier" unit="%" rows={[
                  { label: "Global median", value: 57, kind: "base" }, { label: "Per-key median", value: 79, kind: "ours" },
                ]} max={100} digits={0} />
              </div>
            </Exp>
          </div>
        </Level>

        <Level level={2} tag="Phase 3" title="Closing gaps: features and overload" id="phase-3">
          <div className="exp-list">
            <Exp
              {...props("exp-7")} title="Features beyond the key" outcome="Binned size feature worthwhile" kind="pass"
              finding="A per-key median is off by 2× where cost follows input size."
              decision="Added opt-in size-binned keys. No heavier model."
              question="For jobs whose cost follows their input size, do payload-size or image-size features beat a per-key median, and is a heavier model needed?"
              facts={[["568,592", "jobs"], ["6", "runs, 5–30 min"], ["6 / 6", "runs agree"], ["60 / 40", "train / test split in time order"]]}
              learned={[
                "A per-key median is off by about 1.95×. Adding a log2 size bin per key cuts that to 1.2× and lifts tier accuracy from 68% to 93%.",
                "Gradient boosting over every feature added almost nothing (1.17×, 93%), so a richer model isn't warranted.",
                "The control key, whose latency doesn't depend on its payload, gained nothing, as it should.",
                "Size-driven keys have p99/p50 spreads of 37–46, so today's spread gate (16) sends them to the default tier. Bins make them routable.",
                "Limits: one machine, job mix and corpus chosen by us, millisecond-scale jobs.",
              ]}
              changed={[
                "Opt-in size-binned keys (key × floor(log2 size)), with a cold bin borrowing its own key's history, never another key's.",
                "No heavier model. Evaluated end-to-end under load in experiment 8.",
              ]}
            >
              <div className="mini-grid two">
                <MiniCompare title="Median prediction error (× actual)" unit="×" rows={[
                  { label: "Global median", value: 7.4, kind: "base" },
                  { label: "Per-key median", value: 1.95 },
                  { label: "Per-key × size bin", value: 1.2, kind: "ours" },
                  { label: "Gradient boosting", value: 1.17 },
                ]} />
                <MiniCompare title="Tier accuracy" unit="%" max={100} digits={0} rows={[
                  { label: "Global median", value: 35, kind: "base" },
                  { label: "Per-key median", value: 68 },
                  { label: "Per-key × size bin", value: 93, kind: "ours" },
                  { label: "Gradient boosting", value: 93 },
                ]} />
              </div>
              <h5 className="viz-title">Per-key error (log2), before and after size bins</h5>
              <div className="bins">
                {[
                  ["catalog/resize_image", 4.02, 0.16],
                  ["api/parse_json", 2.25, 0.29],
                  ["reports/sqlite_report", 1.93, 0.26],
                  ["storage/compress_file", 0.9, 0.24],
                  ["search/index_text", 0.88, 0.27],
                  ["storage/checksum", 0.52, 0.33],
                  ["notify/http_call (control)", 0.48, 0.48],
                ].map(([k, a, b]) => (
                  <div key={k} className="bins-row">
                    <span>{k}</span>
                    <div className="bins-track">
                      <i className="bins-a" style={{ width: `${(a / 4.02) * 100}%` }} />
                      <i className="bins-b" style={{ width: `${(b / 4.02) * 100}%` }} />
                    </div>
                    <strong>{a.toFixed(2)} → {b.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </Exp>

            <Exp
              {...props("exp-8")} title="Size-binned keys under load" outcome="Gate not passed" kind="fail"
              finding="Size bins made the predictor more accurate but not measurably faster under load."
              decision="They stay opt-in. The next test needs a job type that spans tiers and carries a lot of the work."
              question="Experiment 7 showed size bins predict better on their own. Do they actually lower latency in the production-flow benchmark, where resize and invoice jobs vary widely in cost?"
              facts={[["20", "runs, 5 seeds"], ["28 vs 9", "keys with bins vs without"], ["0.84 → 0.66", "median prediction error (octaves)"], ["−1.5%", "mean latency vs job-type keys"]]}
              learned={[
                "The predictor did get better: median prediction error fell from 0.84 to 0.66 octaves. But mean latency moved only −1.5%, and the 95% interval ran from −5.1% to +1.7%, so we can't tell it from no change.",
                "Reordering worked as intended. Small resizes moved up (−12% for the cheapest third) and large invoices moved down (+28% for the costliest third).",
                "Invoices are cheap (about 5 ms) and use under 3% of worker time, so demoting the big ones cost them more than it saved everyone else.",
                "Most of the benefit was already captured by job-type keys: predictive beat FIFO by 25%, the oracle by 28.5%.",
                "All five guardrails passed, so the cost side was clean.",
                "A quiet-machine re-run was less noisy and agreed: size bins do not help on this workload.",
              ]}
              changed={[
                "Size bins stay opt-in, as shipped.",
                "They should help most when one job type spans tiers and carries a big share of the work. This workload has no such job type, so that claim is untested and needs a new pre-registered workload.",
              ]}
            >
              <h5 className="viz-title">Size-binned vs job-type keys: mean latency change by planned cost</h5>
              <Deltas
                span={30}
                legend={["← faster with bins", "slower with bins →"]}
                rows={[
                  { label: "resize_image · cheapest third", value: -12 },
                  { label: "resize_image · middle third", value: -1 },
                  { label: "resize_image · costliest third", value: 3 },
                  { label: "generate_invoice · cheapest", value: 0 },
                  { label: "generate_invoice · middle", value: 6 },
                  { label: "generate_invoice · costliest", value: 28 },
                ]}
              />
              <p className="viz-note">Exploratory breakdown, not part of the pre-registered result.</p>
            </Exp>

            <Exp
              {...props("exp-9")} title="Aging under sustained overload" outcome="Improves, with caveats" kind="mixed"
              finding="Weights plus pausing aging give large mean gains, with caveats on the tail."
              decision="Opt-in for now. Strict priority stays the default until the tail cost is understood."
              question="Experiment 5 showed aging turns every policy into FIFO when a backlog lasts hours. Can sharing worker time between levels, with aging that pauses during a backlog, keep priority meaningful without starving long jobs?"
              facts={[["[8, 3, 1]", "level weights"], ["3", "Azure loads: 0.5 / 0.8 / 0.95"], ["15", "production-flow runs"], ["−56.9%", "mean vs FIFO in production flow"]]}
              learned={[
                "The improvement is real and consistent. On the Azure trace, weights with pausing cut mean latency against FIFO at every load (−14.6% to −27.3%) and against today's aging by 14–25%. In the production flow, mean latency fell 42% against today's predictive routing and 57% against FIFO.",
                "Two caveats, both against pre-registered limits. At load 0.5 the Azure gain was −14.6%, a hair under the −15% bar, with the interval entirely below zero. At load 0.95 the long-job wait ratio was 1.46×, but its interval reached 2.23×, over the 2× limit. By the letter of the pre-registration the Azure gate passed at load 0.8 only, and the production-flow gate did not pass.",
                "The gain lives in ordinary busy windows (15–52% lower mean), not in the single extreme window, where FIFO's mean latency was about 8 hours.",
                "In the production flow short-job median fell from 6.4 s to 18 ms. The one guardrail that tripped was all-message P99, up 12% against today's predictive routing, over the 10% limit.",
                "Our expectation that pausing would rarely trigger in the production flow was wrong. Flash-sale backlogs of 16–23 s are well past the 5 s aging threshold, so the same collapse happens at small scale.",
                "The cost is the tail of longer job types: P99 rose from about 28 s to 31–32 s.",
                "The oracle with the same scheduler gains 24–39%, so better predictions would still pay off.",
              ]}
              changed={[
                "Level weights ship as opt-in, with pausing aging on whenever weights are set. The gates were not all met, so the default stays strict priority until the tail cost is understood.",
                "Conclusion: it helps substantially, at a bounded cost to the longest jobs. Operators who value mean and short-job latency over the tail of the longest jobs should turn it on.",
                "Next, with a new pre-registration: a larger bottom-level weight to win back some long-job tail, and a weights-only arm in the production flow to separate weights from pausing.",
              ]}
              links={[{ label: "Full results", href: `${REPORT}/benchmarks/results/v3-aging/README.md` }, { label: "Repeated on two more traces", to: "/harbinger/benchmarks#traces" }]}
            >
              <div className="mini-grid two">
                <MiniCompare title="Azure trace: mean latency reduction vs FIFO" unit="%" max={100} digits={1} rows={[
                  { label: "Load 0.50", value: 14.6, kind: "ours", text: "−14.6%" },
                  { label: "Load 0.80", value: 23.7, kind: "ours", text: "−23.7%" },
                  { label: "Load 0.95", value: 27.3, kind: "ours", text: "−27.3%" },
                ]} />
                <MiniCompare title="Azure trace: long-job max wait vs FIFO (limit 2×)" unit="×" max={2.5} digits={2} rows={[
                  { label: "Limit", value: 2, kind: "base", text: "2.00×" },
                  { label: "Load 0.50", value: 1.21, kind: "ours" },
                  { label: "Load 0.80", value: 1.23, kind: "ours" },
                  { label: "Load 0.95", value: 1.46, kind: "ours", text: "1.46×" },
                ]} />
                <MiniCompare title="Production flow: mean latency (s)" unit=" s" rows={[
                  { label: "FIFO", value: 13.17, kind: "base" },
                  { label: "Predictive, today's aging", value: 9.66 },
                  { label: "Weights + pausing", value: 5.71, kind: "ours" },
                ]} />
                <MiniCompare title="Production flow: all-message P99 vs predictive (limit 1.10×)" unit="×" max={1.3} digits={2} rows={[
                  { label: "Limit", value: 1.1, kind: "base", text: "1.10×" },
                  { label: "Weights + pausing", value: 1.12, kind: "ours", text: "1.12×" },
                ]} />
              </div>
              <p className="viz-note">At load 0.95 the long-job wait interval reaches 2.23×, over the 2× limit.</p>
            </Exp>
          </div>
        </Level>

        <Level tag="Phase 4" title="Beyond the lab: cloud, other traces, other brokers" id="phase-4">
          <div className="exp-list">
            <Exp
              {...props("exp-10")} title="Replicating on AWS" outcome="Replicated; long runs shrink" kind="mixed"
              finding="Every verdict held on cloud hardware, but the gain shrinks when backlogs last minutes."
              decision="Results now report load next to every number. AWS is the independent replication."
              question="Is the production-flow result a laptop artefact? Run it again on separate cloud hardware, then hold a 30-minute run with the broker on its own host."
              facts={[["35", "runs: 7 arms × 5 seeds"], ["10 / 10", "criteria passed"], ["−30.8%", "mean vs FIFO"], ["−94.8%", "short-job median vs FIFO"], ["−6% to −7%", "mean over 30 minutes (2 runs)"]]}
              learned={[
                "Every v2 verdict held on AWS: mean −30.8%, short-job median −94.8%, and no guardrail moved.",
                "The short-job gain is larger than on the laptop because the AWS CPU was about 2× faster than the quiet re-run's, so the same workload is a lighter load.",
                "The predictor sits close to its ceiling: the oracle was 32% below FIFO and predictive 29%.",
                "In the 30-minute run the mean gain shrank to 6–7%. The six-minute flash sale pushes FIFO's mean to 68 s, and with waits that long the default 5 s aging lifts almost every waiting job to the top level.",
                "Outside overload, predictive routing still halves latency (steady −23%, ramp −54%).",
                "The quiet laptop re-run (turbo off, 2.3 GHz) reproduced every gate verdict and all four simulations byte for byte, but the short-job gain fell from −88% to −58%, because the original run's CPU was about 1.6–1.8× faster.",
              ]}
              changed={[
                "Effect sizes depend on load relative to CPU speed, so every production-flow result now reports a load measure, not just the rate scale.",
                "The quiet re-run replaces the original laptop numbers as the cited local result.",
                "The 30-minute run is the experiment 5 aging collapse on real infrastructure, the case the opt-in weights were built for.",
              ]}
              links={[{ label: "See the numbers", to: "/harbinger/benchmarks#production" }, { label: "AWS results", href: `${REPORT}/benchmarks/results/v3-aws/README.md` }]}
            />

            <Exp
              {...props("exp-11")} title="Real traces under common rules" outcome="Overload design generalises" kind="mixed"
              finding="With weights and pausing aging the same predictor passed 5 of 6 serverless cells. Routing alone passed 1."
              decision="Weights plus pausing is confirmed as the overload design, still opt-in."
              question="Do experiments 5 and 9 hold on a second serverless provider? Run Azure and Huawei under the same pre-registered rules, with and without the weights and pausing aging design."
              facts={[["2", "serverless traces: Azure 2021, Huawei 2025"], ["3", "loads each: 0.5 / 0.8 / 0.95"], ["5 of 6", "cells passed with weights + pausing"], ["1 of 6", "cells passed with routing alone"]]}
              learned={[
                "With strict priority and today's aging, predictive routing beat FIFO by 15% or more only once, and barely: Huawei at load 0.8, −15.0% against a −15% bar.",
                "With weights [8, 3, 1] and pausing aging, mean latency fell 15–25% on Azure and 47–50% on Huawei at loads 0.8 and 0.95.",
                "Short jobs win and long jobs pay a little. On Huawei at 0.8 the short-job median fell from 8.0 s to 54 ms, the long-job mean rose 17%, and all-message P99 stayed within 1.10×.",
                "A hand-tuned static map did as well as the predictor on Huawei, because that trace's keys are stable within a day. The predictor's case is that it needs no map.",
                "The strict-priority oracle was no better than the predictor, so under today's aging the ordering is lost to aging, not to prediction error.",
              ]}
              changed={[
                "Predictive routing alone is not enough under backlogs. The overload design is what carries the gain.",
                "The weighted design stays opt-in. Experiment 12 shows where it should not be used.",
              ]}
              links={[{ label: "See the numbers", to: "/harbinger/benchmarks#traces" }, { label: "Full results", href: `${REPORT}/benchmarks/results/v3-traces/README.md` }]}
            />

            <Exp
              {...props("exp-12")} title="Job queues that do not recur" outcome="No gate passed: found the boundary" kind="fail"
              finding="On HPC logs the predictor mostly can't predict, and the overload design can hurt long jobs."
              decision="Enable the overload design only where per-key prediction has been shown to work."
              question="Does the same design work on HPC job logs, where jobs run for minutes to days and keys may not recur? Tested as shipped, with no tuning, on LPC-EGEE 2004 and DAS2-fs2 2003."
              facts={[["2", "HPC job logs"], ["0 of 12", "gates passed"], ["24,402 / 117,823", "LPC-EGEE jobs that got a prediction"], ["+72% to +89%", "mean vs FIFO on DAS2-fs2, weighted, loads 0.8–0.95"]]}
              learned={[
                "Every strict-priority arm, even the oracle, landed within 0.1% of FIFO. Waits of minutes to days let the 5 s aging promote everything.",
                "On LPC-EGEE most keys had been idle longer than the 30-minute stale limit, and the rest were too new or too variable, so most jobs took the default tier.",
                "On DAS2-fs2 the weighted design cut short-job medians 4–11× but made long jobs wait 2.5–4.6× longer. Long jobs carry 88% of the work, so the mean got worse and the P99 and long-job guardrails failed.",
                "With perfect sizes the same scheduler cut mean latency 30–54% at loads 0.8–0.95. The scheduler is not the limit: the predictions and the time-scale settings are.",
                "Exploratory diagnosis, not pre-registered: workers don't preempt, so a job predicted short that runs for a day blocks a worker for that day. Weights without aging were 7% better than FIFO, and with pausing aging 44% worse.",
              ]}
              changed={[
                "A deployment guideline: turn on the overload design only after a per-key predictability check on the system's own history. An automatic safeguard is future work.",
                "Two defaults are tuned for short jobs, aging (5 s) and stale_after (30 min). Scaling them to the workload was not tested and needs its own pre-registration.",
              ]}
              links={[{ label: "See the numbers", to: "/harbinger/benchmarks#traces" }, { label: "Full results", href: `${REPORT}/benchmarks/results/v3-traces-2/README.md` }]}
            />

            <Exp
              {...props("exp-13")} title="Against RabbitMQ and Redis" outcome="Gate passed" kind="pass"
              finding="The scheduling gain carries to RabbitMQ and Redis, but Harbinger is the slowest broker."
              decision="Claim the scheduling idea, not broker speed. Broker overhead is a tracked limitation."
              question="Is the gain specific to Harbinger's own broker? Run the same production flow through RabbitMQ and Redis on AWS, then measure what each broker costs with empty handlers."
              facts={[["8", "arms across 3 brokers"], ["5", "seeds"], ["−21.7%", "mean vs RabbitMQ FIFO"], ["−25.5%", "mean vs Redis FIFO"], ["−57.6%", "mean with the predictor as a RabbitMQ sidecar"]]}
              learned={[
                "The gate passed by less than expected: −21.7% against RabbitMQ FIFO and −25.5% against Redis FIFO, where −25% to −28% was expected.",
                "Part of the gap is Harbinger's own FIFO arm running 11% slower than RabbitMQ's, just outside the ±10% equivalence bar.",
                "The same predictor running beside RabbitMQ as a sidecar cut mean latency by 57.6%, more than inside Harbinger. RabbitMQ's priorities never age, and Harbinger's default aging likely gives some of the gain back. This experiment does not isolate that.",
                "RabbitMQ static priorities starved the long class: the longest export waited 101 s, 5.2× FIFO. Harbinger's predictive routing held that wait to a fifth of it.",
                "With empty handlers Harbinger delivered about 5,300 messages per second against 7,400 for RabbitMQ (prefetch 1) and 21,200 for Redis, and fell behind at 20,000 msg/s in all five runs.",
              ]}
              changed={[
                "The claim is scoped to scheduling. Harbinger is a prototype, and its throughput and lack of durability are stated limits.",
                "The predictor carries over to another broker, so the idea is separable from Harbinger's own queue.",
              ]}
              links={[{ label: "Full comparison", to: "/harbinger/comparison" }, { label: "Results", href: `${REPORT}/benchmarks/results/v3-aws/README.md` }]}
            />
          </div>
        </Level>

        <Level level={2} tag="Next" title="Open questions" id="next">
          <p className="hb-intro"><G>None of these is needed for the results above. They are what the experiments left open, and the ones that change a design default would need a new pre-registration first.</G></p>
          <ol className="next">
            <li><strong>Bottom-level weight.</strong> Try a larger weight on the lowest level to see whether it wins back some of the long-job tail that experiment 9 cost.</li>
            <li><strong>Weights-only arm.</strong> Add it to the production flow to separate the effect of weights from the effect of pausing aging.</li>
            <li><strong>Time-scaled aging.</strong> Scale aging and the stale limit to the workload's own job durations, then retest the HPC logs.</li>
            <li><strong>A predictability safeguard.</strong> Switch the overload design off automatically when a workload's keys do not predict well.</li>
            <li><strong>A workload where size bins should win.</strong> One job type that spans tiers and carries a large share of the work, pre-registered before running.</li>
            <li><strong>Isolating aging against RabbitMQ.</strong> An arm that separates aging from the rest of the scheduler, to test why the sidecar gained more.</li>
            <li><strong>Per-function worker pools</strong> in the trace simulator, to model serverless scaling more honestly.</li>
            <li><strong>Cloud repeat</strong> of the feature-signal collection (experiment 7), on hardware other than one laptop.</li>
          </ol>
        </Level>

        <MoreFrom current="/harbinger/experiments" />
      </div>
    </Shell>
  );
}

export default HarbingerExperiments;
