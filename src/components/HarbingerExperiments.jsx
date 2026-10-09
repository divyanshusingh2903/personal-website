import Shell, { Level, Top, GITHUB_URL } from "../harbinger/Shell";
import { G } from "../harbinger/Glossary";
import { Bars, Deltas, Facts } from "../harbinger/Charts";
import "../harbinger/harbinger.css";

const REPORT = `${GITHUB_URL}/blob/main`;

const PATH = [
  ["Static priority is no universal winner and can't fix the tail.", "Hypothesis revised: expect median and mean wins, not P99.", "exp-1"],
  ["Simple per-key statistics matched or beat all eight online models.", "The predictor became a C++ per-key histogram. Python stayed offline.", "exp-2"],
  ["The v1 budgets could not be met even by a perfect static map.", "Re-pre-registered on a realistic workload before any predictive run.", "exp-3"],
  ["Production flow passed. The Azure trace did not.", "Predictive routing is opt-in. Aging under overload became a follow-up.", "exp-4"],
  ["A per-key median is off by 2× where cost follows input size.", "Added size-binned keys. No heavier model.", "exp-7"],
  ["Size bins made the predictor more accurate but not measurably faster under load.", "They stay opt-in. Next test needs a job type that spans tiers and carries a lot of the work.", "exp-8"],
  ["Under sustained overload, aging collapses every policy into FIFO.", "Level weights plus pausing aging: large mean gains, with caveats on the tail. Opt-in for now.", "exp-9"],
];

function Outcome({ kind, children }) {
  return <span className="exp-outcome" data-kind={kind}>{children}</span>;
}

function Exp({ id, n, title, outcome, kind, question, facts, children, learned, changed }) {
  return (
    <Level level={undefined} tag={`Experiment ${n}`} title={title} id={id}>
      <div className="exp-meta"><Outcome kind={kind}>{outcome}</Outcome></div>
      <p className="exp-q"><b>Question</b><G>{question}</G></p>
      {facts && <Facts items={facts} />}
      <div className="exp-viz">{children}</div>
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
    </Level>
  );
}

function MiniCompare({ title, rows, unit, max, digits }) {
  return (
    <div className="mini">
      <h5>{title}</h5>
      <Bars rows={rows} unit={unit} max={max} digits={digits ?? (rows.some((r) => r.value < 10) ? 2 : 1)} />
    </div>
  );
}

function HarbingerExperiments() {
  return (
    <Shell title="Harbinger experiments | What we measured and learned">
      <section className="hb-hero hb-hero-short">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Experiments</p>
          <h1>What we ran, and where it pointed.</h1>
          <p className="hb-lede">
            <G>Nine experiments. Several missed some of their pre-registered gates, and those misses, with the caveats they exposed, shaped the research as much as the passes did.</G>
          </p>
        </div>
      </section>

      <div className="hb-page">
        <Level level={0} tag="Overview" title="Research path" id="path">
          <ol className="path">
            {PATH.map(([found, then, id], i) => (
              <li key={id}>
                <div className="path-row">
                  <span className="path-n">{i + 1}</span>
                  <span className="path-found"><G>{found}</G></span>
                  <span className="path-arrow" aria-hidden="true">→</span>
                  <span className="path-then"><G>{then}</G> <a className="path-go" href={`#${id}`}>Details ↓</a></span>
                </div>
              </li>
            ))}
          </ol>
        </Level>

        <Exp
          id="exp-1" n={1} title="Baseline scheduling policies" outcome="Mixed: no universal winner" kind="mixed"
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
          id="exp-2" n={2} title="Eight online duration predictors" outcome="No qualifier under the v1 gates" kind="fail"
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

        <Level level={undefined} tag="Experiment 3" title="Pre-registering v2" id="exp-3">
          <div className="exp-meta"><Outcome kind="mixed">Frozen 2026-10-05, before any predictive run</Outcome></div>
          <p className="exp-q"><b>Question</b>What should "it works" mean, and what would count as failing, before we look at a single predictive result?</p>
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
          <div className="exp-takeaways">
            <div>
              <h4>What we learned</h4>
              <ul>
                <li><G>The v1 "10% P95 improvement" budget could not be met even by a perfect static map, so it was the wrong yardstick.</G></li>
                <li><G>The new budgets were chosen after seeing experiment 1 data and two FIFO-only load pilots. They are not blind, and the pre-registration says so.</G></li>
              </ul>
            </div>
            <div className="exp-changed">
              <h4>What it changed</h4>
              <ul>
                <li><G>Gate = P1, P2 and G1–G4 must all pass. Anything unevaluable counts as a failure.</G></li>
                <li><G>Default routing stays static whatever the result.</G></li>
                <li><G>Results are paired by seed with bootstrap 95% intervals, and old results stay published.</G></li>
              </ul>
            </div>
          </div>
        </Level>

        <Exp
          id="exp-4" n={4} title="Production-flow benchmark" outcome="Gate passed" kind="pass"
          question="On a realistic e-commerce job queue with a flash sale and a mid-run cost shift, does learned routing beat FIFO and a hand-tuned static map, with no hand configuration?"
          facts={[["9", "job types, 5 services"], ["7", "arms"], ["5", "seeds"], ["~35,000", "messages per run"], ["10 / 10", "criteria passed"]]}
          learned={[
            "The learned map beat a human-tuned one by 10.9% mean latency. The operator put invoice generation in the middle tier, but its real median is milliseconds.",
            "With no job labels at all (key = producer) it still cut mean latency 15%, about half the labelled benefit.",
            "The tail did not improve: all-message P99 rose 4% and long jobs got no faster. Aging held export max wait to within 2% of FIFO.",
            "The \"oracle\" is a reference, not a ceiling. Under contention its planned costs are approximate, and predictive tied it statistically.",
            "Limits: one 4-vCPU machine, simulated network latency, one scenario that we wrote.",
          ]}
          changed={[
            "Predictive routing becomes an explicit opt-in. Static stays the default.",
            "Operating path defined: shadow mode first, then predictive. Rollback is one restart.",
            "Labelled job_type keys roughly doubled the benefit, so producers are encouraged to send them.",
          ]}
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
          <a className="exp-src" href={`${REPORT}/docs/phase2-report.md`} target="_blank" rel="noopener noreferrer">Full report and tables ↗</a>
        </Exp>

        <Exp
          id="exp-5" n={5} title="Azure Functions trace simulation" outcome="Gate not passed" kind="fail"
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
          id="exp-6" n={6} title="Real-data predictability" outcome="Per-key stats predict real durations" kind="pass"
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

        <Exp
          id="exp-7" n={7} title="Features beyond the key" outcome="Binned size feature worthwhile" kind="pass"
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
          id="exp-8" n={8} title="Size-binned keys under load" outcome="Gate not passed" kind="fail"
          question="Experiment 7 showed size bins predict better on their own. Do they actually lower latency in the production-flow benchmark, where resize and invoice jobs vary widely in cost?"
          facts={[["20", "runs, 5 seeds"], ["28 vs 9", "keys with bins vs without"], ["0.84 → 0.66", "median prediction error (octaves)"], ["−1.5%", "mean latency vs job-type keys"]]}
          learned={[
            "The predictor did get better: median prediction error fell from 0.84 to 0.66 octaves. But mean latency moved only −1.5%, and the 95% interval ran from −5.1% to +1.7%, so we can't tell it from no change.",
            "Reordering worked as intended. Small resizes moved up (−12% for the cheapest third) and large invoices moved down (+28% for the costliest third).",
            "Invoices are cheap (about 5 ms) and use under 3% of worker time, so demoting the big ones cost them more than it saved everyone else.",
            "Most of the benefit was already captured by job-type keys: predictive beat FIFO by 25%, the oracle by 28.5%.",
            "All five guardrails passed, so the cost side was clean.",
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
          id="exp-9" n={9} title="Aging under sustained overload" outcome="Improves, with caveats" kind="mixed"
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
          <a className="exp-src" href={`${REPORT}/benchmarks/results/v3-aging/README.md`} target="_blank" rel="noopener noreferrer">Full results ↗</a>
        </Exp>

        <Level level={2} tag="Next" title="Open follow-ups" id="next">
          <ol className="next">
            <li><strong>Bottom-level weight.</strong> Try a larger weight on the lowest level to see whether it wins back some of the long-job tail that experiment 9 cost.</li>
            <li><strong>Weights-only arm.</strong> Add it to the production flow to separate the effect of weights from the effect of pausing aging.</li>
            <li><strong>A workload where size bins should win.</strong> One job type that spans tiers and carries a large share of the work, pre-registered before running.</li>
            <li><strong>Per-function worker pools</strong> in the trace simulator, to model serverless scaling more honestly.</li>
            <li><strong>Cloud repeat</strong> of the feature-signal collection, on hardware other than one laptop.</li>
          </ol>
        </Level>
      </div>
    </Shell>
  );
}

export default HarbingerExperiments;
