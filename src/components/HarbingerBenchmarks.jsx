import { useState } from "react";
import Shell, { Level, Top, GITHUB_URL } from "../harbinger/Shell";
import { G } from "../harbinger/Glossary";
import { Bars, Deltas } from "../harbinger/Charts";
import { Callout, Headlines, MoreFrom, Points, SectionNav, Table, Tabs } from "../harbinger/Ui";
import "../harbinger/harbinger.css";

const RESULTS = `${GITHUB_URL}/blob/main/benchmarks/results`;

const NAV = [
  { id: "glance", label: "At a glance" },
  { id: "setup", label: "How we measured" },
  { id: "production", label: "Production flow" },
  { id: "sustained", label: "Long backlogs" },
  { id: "traces", label: "Real traces" },
  { id: "baselines", label: "Stronger baselines" },
  { id: "aging", label: "Isolating aging" },
  { id: "validation", label: "Validation & sensitivity" },
  { id: "conclusions", label: "What it supports" },
];

const SCOREBOARD = [
  ["Production flow", "Laptop, quiet re-run", { v: "Passed", kind: "pass" }, "Mean −25.6% vs FIFO"],
  ["Production flow, replicated", "AWS", { v: "Passed", kind: "pass" }, "Mean −30.8% vs FIFO"],
  ["30-minute run, broker on its own host", "AWS", { v: "3 of 8 checks failed", kind: "mixed" }, "Mean −6% to −7% vs FIFO"],
  ["Level weights + pausing aging, production flow", "Laptop + AWS", { v: "Not passed", kind: "fail" }, "AWS mean −57.5% vs FIFO; P99 interval exceeds the guardrail"],
  ["Size-binned keys", "Laptop + AWS", { v: "Not passed", kind: "fail" }, "AWS mean −1.5% vs job-type keys; no measurable gain"],
  ["Azure Functions 2021 trace", "Real-broker replay", { v: "Weights: 2 of 3", kind: "mixed" }, "Default-aging routing: 0 of 3; weighted mean −8% to −17%"],
  ["Huawei 2025 R5 trace", "Real-broker replay", { v: "Weights: 2 of 3", kind: "mixed" }, "Default-aging routing: 0 of 3; weighted mean −2% to −47%"],
  ["Huawei, aging off", "Real-broker replay", { v: "2 of 2", kind: "pass" }, "Mean −37% / −45% vs FIFO, with tail and long-wait costs"],
  ["Stronger baselines and ablations", "AWS production flow", { v: "Descriptive", kind: "note" }, "Per-type fair queueing beats predictive mean, with worse P99"],
  ["CPU-work simulator validation", "Laptop + AWS", { v: "Not passed", kind: "fail" }, "Simulated effects overstate measured gains by 11–12 points"],
  ["Parameter sensitivity", "Simulation", { v: "Incomplete", kind: "mixed" }, "Variant confirmation through the real broker was triggered but not run"],
  ["LPC-EGEE 2004 job log", "Simulation", { v: "0 of 6", kind: "fail" }, "Predictor gave a prediction for 21% of jobs"],
  ["DAS2-fs2 2003 job log", "Simulation", { v: "0 of 6", kind: "fail" }, "Overload design made the mean worse (+72% to +89%)"],
  ["Against RabbitMQ and Redis", "AWS", { v: "Passed", kind: "pass" }, "Mean −21.7% and −25.5% vs their FIFO"],
  ["Broker cost, empty handlers", "AWS", { v: "No gate", kind: "note" }, "Harbinger is the slowest of the three brokers"],
];

const CRITERIA = [
  ["P1 mean vs FIFO (≤ −15%)", "−25.6% [−29.4, −21.8]", "−30.8% [−35.3, −27.1]"],
  ["P2 short-job median vs FIFO (≤ −30%)", "−57.7% [−70.0, −45.3]", "−94.8% [−99.0, −86.5]"],
  ["G1 all-message P99 vs FIFO (≤ 1.25×)", "1.02× [1.00, 1.05]", "1.03× [1.02, 1.05]"],
  ["G2 export max wait vs FIFO (≤ 2.0×)", "0.99× [0.95, 1.03]", "0.99× [0.90, 1.05]"],
  ["G3 no lost work", "Pass", "Pass"],
  ["G4 throughput vs FIFO (≥ 0.98×)", "1.00×", "1.00× [1.00, 1.00]"],
  ["S1 vs hand-tuned static map (≤ +10%)", "−11.1%", "−14.4%"],
  ["S2 vs misconfigured static map", "−30.1%", "−36.8%"],
  ["S3 shadow-mode overhead (±5%)", "+0.1%", "−0.1%"],
  ["S4 producer-only keys vs FIFO (≤ −5%)", "−10.5%", "−15.7%"],
];

const PHASES = [
  ["Steady (0–6 min)", "59", "50", "59", "46", "−23%"],
  ["Ramp (6–9)", "471", "284", "466", "215", "−54%"],
  ["Flash sale (9–15)", "67,720", "64,867", "67,733", "62,897", "−7%"],
  ["Recovery (15–21)", "91,573", "89,178", "91,274", "87,678", "−4%"],
  ["Shifted (21–30)", "12,593", "10,908", "12,367", "10,325", "−18%"],
];

const TRACE_GRID = [
  ["Azure Functions 2021", [
    ["Routing alone", [["−0.7%", 0], ["−0.9%", 0], ["−1.2%", 0]]],
    ["+ weights, pausing aging", [["−15.4%", 1], ["−22.8%", 1], ["−25.3%", 1]]],
    ["Perfect predictions + weights", [["−26.5%"], ["−33.3%"], ["−36.7%"]]],
  ]],
  ["Huawei 2025", [
    ["Routing alone", [["−4.8%", 0], ["−15.0%", 1], ["−7.9%", 0]]],
    ["+ weights, pausing aging", [["−4.3%", 0], ["−46.5%", 1], ["−49.9%", 1]]],
    ["Perfect predictions + weights", [["−3.2%"], ["−37.8%"], ["−50.0%"]]],
  ]],
  ["LPC-EGEE 2004", [
    ["Routing alone", [["0.0%", 0], ["0.0%", 0], ["0.0%", 0]]],
    ["+ weights, pausing aging", [["+1.0%", 0], ["+1.9%", 0], ["+8.5%", 0]]],
    ["Perfect predictions + weights", [["−33.1%"], ["−52.1%"], ["−53.8%"]]],
  ]],
  ["DAS2-fs2 2003", [
    ["Routing alone", [["0.0%", 0], ["0.0%", 0], ["0.0%", 0]]],
    ["+ weights, pausing aging", [["+2.7%", 0], ["+88.8%", 0], ["+72.2%", 0]]],
    ["Perfect predictions + weights", [["−6.0%"], ["−30.1%"], ["−49.2%"]]],
  ]],
];

const REPLAY = [
  ["Huawei R5 · 0.50", "−2.5% [−4.6, +0.0]", "Fail", "−2.4% [−4.4, +0.0]", "Fail"],
  ["Huawei R5 · 0.80", "−10.9% [−14.8, −1.6]", "Fail", "−37.0% [−66.0, −4.0]", "Pass"],
  ["Huawei R5 · 0.95", "−8.4% [−11.5, −3.2]", "Fail", "−47.1% [−74.8, −17.9]", "Pass"],
  ["Azure 2021 · 0.50", "−0.9% [−1.9, −0.2]", "Fail", "−8.0% [−11.5, −4.3]", "Fail"],
  ["Azure 2021 · 0.80", "−1.6% [−3.0, −0.6]", "Fail", "−15.3% [−23.9, −9.0]", "Pass"],
  ["Azure 2021 · 0.95", "−2.2% [−3.9, −1.1]", "Fail", "−17.2% [−25.8, −11.6]", "Pass"],
].map(([cell, a, av, b, bv]) => [cell, a, { v: av, kind: "fail" }, b, { v: bv, kind: bv === "Pass" ? "pass" : "fail" }]);

const TRACE_STORIES = {
  azure: {
    tab: "Azure",
    title: "Azure Functions 2021 · real-broker replay",
    points: [
      "On the real broker, default-aging routing gained only 1–2% and failed all three cells. Weights and pausing aging passed at loads 0.8 and 0.95, not 0.5.",
      "The load-0.8 pass is narrow: −15.3% against a −15% point-estimate bar. Azure ran once per cell, so repeat-based stability is unknown.",
      "The gate averages equal-time windows. Whole-run weighted mean gains are only −7.9% and −9.3% at loads 0.8 and 0.95, because the final day's backlog holds most of the work.",
    ],
  },
  huawei: {
    tab: "Huawei",
    title: "Huawei 2025 serverless trace",
    points: [
      "All three repeats agree: default-aging routing fails every load, while weights with pausing aging pass at 0.8 and 0.95. Quiet windows offer little queueing benefit.",
      "At load 0.8, whole-run means are FIFO 17.9 s, predictive 15.0 s and weighted 1.7 s. That roughly 90% whole-run reduction is not the registered −37.0% window-average estimate.",
      "A static map built from the same history matches or beats the live predictor. Predictive fails +10% non-inferiority at loads 0.8 (+8.2% [+0.1, +17.2]) and 0.95 (+28.6% [+0.5, +58.2]). Stable keys do not establish a benefit from online adaptation.",
    ],
  },
  lpc: {
    tab: "LPC-EGEE",
    title: "LPC-EGEE 2004 job log: 117,823 evaluation jobs",
    points: [
      "Only 24,402 jobs received a prediction. 62,046 hit a stale key, 28,399 a cold key and 2,976 a key with too much spread.",
      "The predictor drops a key's history after 30 minutes without activity, and on this log most keys are idle longer than that. So most jobs take the default tier and the result stays near FIFO (+1% to +9%).",
      "With perfect predictions the same scheduler cut mean latency 33–54%. The failure is in the prediction, not the scheduler.",
    ],
  },
  das2: {
    tab: "DAS2-fs2",
    title: "DAS2-fs2 2003 job log",
    points: [
      "Short jobs gain 4–11×, but long jobs wait 2.5–4.6× longer. Long jobs carry 88% of the work, so the mean gets worse and P99 and long-job guardrails fail.",
      "The cause, from an exploratory run that was not pre-registered: wrong predictions misorder jobs, and jobs do not get preempted, so a job wrongly predicted short can hold a worker for a day.",
      "The 5 s pausing aging is also the wrong time scale for waits of hours. Weights without aging were 7% better than FIFO.",
    ],
  },
};

const DAS2_DIAG = [
  { label: "FIFO", value: 3.82, kind: "base" },
  { label: "Routing, strict, 5 s aging", value: 3.82 },
  { label: "Routing, strict, no aging", value: 5.44 },
  { label: "Routing, weights, no aging", value: 3.56, kind: "ours" },
  { label: "Routing, weights + pausing aging", value: 5.51 },
  { label: "Oracle, weights + pausing", value: 1.73 },
];

function Env({ title, rows }) {
  return (
    <div className="env">
      <h3>{title}</h3>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function TraceGrid() {
  return (
    <div className="tbl-wrap" role="region" tabIndex={0} aria-label="Mean latency change against FIFO for each trace and load">
      <table className="tbl tg-table">
        <caption>Historical v3 simulation: mean latency vs FIFO under the original seven-window analysis. Filled cells passed then; serverless verdicts were revised in v4.</caption>
        <thead>
          <tr><th scope="col">Trace</th><th scope="col">Arm</th><th scope="col">Load 0.5</th><th scope="col">Load 0.8</th><th scope="col">Load 0.95</th></tr>
        </thead>
        <tbody>
          {TRACE_GRID.map(([trace, rows]) =>
            rows.map(([arm, cells], i) => (
              <tr key={`${trace}-${arm}`} data-group={i === 0 ? "" : undefined}>
                {i === 0 && <th scope="rowgroup" rowSpan={rows.length}>{trace}</th>}
                <th scope="row" className="tg-arm">{arm}</th>
                {cells.map(([text, ok], j) => (
                  <td key={j}>
                    <span className="tg" data-ok={ok === 1 ? "" : undefined} data-ref={ok === undefined ? "" : undefined}>{text.replace("-", "−")}</span>
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

function HarbingerBenchmarks() {
  const [metric, setMetric] = useState("mean");
  const [trace, setTrace] = useState("azure");

  const reduction = {
    mean: { title: "Mean latency reduction vs FIFO", rows: [["Original laptop run", 27.9], ["Quiet laptop re-run", 25.6], ["AWS", 30.8]] },
    short: { title: "Short-job median reduction vs FIFO", rows: [["Original laptop run", 88.4], ["Quiet laptop re-run", 57.7], ["AWS", 94.8]] },
  }[metric];
  const story = TRACE_STORIES[trace];

  return (
    <Shell title="Harbinger benchmarks | What we measured, and what it supports">
      <section className="hb-hero hb-hero-short">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Benchmarks</p>
          <h1>What the benchmarks show, and what they don't.</h1>
          <p className="hb-lede">
             <G>Real-work production flow, public traces through the real broker, and simulations with explicit limits. The latest studies test stronger baselines, isolate aging, and show where the original conclusions needed to narrow.</G>
          </p>
        </div>
      </section>

      <SectionNav items={NAV} />

      <div className="hb-page">
        <Level level={0} tag="Summary" title="At a glance" id="glance">
          <Headlines
            items={[
              ["−26%", "mean latency vs FIFO", "quiet laptop re-run"],
              ["−31%", "mean latency vs FIFO", "AWS"],
              ["−6% to −7%", "mean latency vs FIFO", "30-minute run with long backlogs"],
               ["4 of 6", "real-broker trace cells passed with weights + pausing", "0 of 6 with default-aging routing"],
            ]}
          />
          <Table caption="Every benchmark and how it came out" head={["Benchmark", "Where", "Outcome", "Headline"]} rows={SCOREBOARD} />
           <p className="hb-fine"><G>A gate pass means every applicable criterion passed. Descriptive studies have no overall gate, and incomplete registrations are labeled separately. Raw artifacts are hashed, but not all per-message files are committed.</G></p>
        </Level>

        <Level level={1} tag="Method" title="How we measured" id="setup">
          <p className="hb-intro">
             <G>Three evidence types. Production flow runs a real gRPC broker and CPU-work handlers on nine synthetic job types, a flash sale and a cost shift. Real-broker trace replay uses public durations with sleeping handlers. Simulations run scheduling code on simulated time; HPC results and parameter sensitivity remain simulation-only. These are different tests, not interchangeable replications.</G>
          </p>
          <div className="envs">
            <Env title="Laptop" rows={[
              ["CPU", "Intel Core i7-11800H, 8 cores / 16 threads"],
              ["Settings", "Turbo off, 2.3 GHz cap, performance profile"],
              ["Machine", "14 GB RAM, Ubuntu 26.04.1, on AC power"],
              ["Conditions", "Sampled every 30 s: median load 1.04 on 16 threads"],
            ]} />
            <Env title="AWS" rows={[
              ["Hosts", "Client c8i.2xlarge (8 vCPU), broker c8i.xlarge (4 vCPU)"],
              ["Placement", "us-east-1a, one cluster placement group"],
              ["Software", "Ubuntu 24.04, same Docker image on every host"],
              ["Replication", "Pre-registered, then run from commit 2da0e3a"],
            ]} />
          </div>
          <h3 className="sub">Why effect sizes move between machines</h3>
          <p className="hb-intro">
            <G>Job sizes and arrival rates are fixed, so a slower CPU means a heavier load. The original laptop run had a CPU 1.6–1.8× faster than the quiet re-run, and AWS is faster again.</G>
          </p>
          <div className="exp-viz">
            <div className="mini-grid two">
              <div className="mini">
                <h5>Image resize kernel (ms per megapixel, lower is faster)</h5>
                <Bars unit="" digits={2} rows={[
                  { label: "AWS", value: 6.6 },
                  { label: "Original laptop run", value: 8.11 },
                  { label: "Quiet laptop re-run", value: 13.15, kind: "base" },
                ]} />
              </div>
              <div className="mini">
                <h5>FIFO mean latency on the same workload (s)</h5>
                <Bars unit=" s" digits={1} rows={[
                  { label: "Original laptop run", value: 8.0 },
                  { label: "Quiet laptop re-run", value: 13.1, kind: "base" },
                ]} />
              </div>
            </div>
          </div>
          <Callout title="How to read the production-flow numbers">
            <G>Quote an effect size together with its load. The mean gain barely moves across machines (−26% to −31%), but the short-job median gain swings from −58% to −95%, because heavier backlogs give aging more to promote.</G>
          </Callout>
        </Level>

        <Level level={2} tag="Benchmark 1" title="Production flow: laptop and AWS" id="production">
          <p className="hb-intro">
            <G>Seven arms, five seeds, about 35,000 messages per run. The gate needs every criterion to pass, with intervals paired by seed.</G>
          </p>
          <div className="exp-viz">
            <Tabs
              label="Metric"
              value={metric}
              onChange={setMetric}
              tabs={[{ id: "mean", label: "Mean latency" }, { id: "short", label: "Short-job median" }]}
            />
            <h5 className="viz-title">{reduction.title}</h5>
            <Bars
              max={100}
              digits={1}
              unit="%"
              rows={reduction.rows.map(([label, value]) => ({ label, value, kind: "ours", text: `−${value}%` }))}
            />
            <p className="viz-note">Predictive routing against FIFO. The AWS point is the independent replication.</p>
          </div>
          <Table
            caption="Every v2 criterion, laptop re-run against AWS. All ten passed on both."
            head={["Criterion", "Laptop re-run", "AWS"]}
            rows={CRITERIA}
          />
          <h3 className="sub">What it shows</h3>
          <Points
            items={[
              "Every verdict reproduced on a quiet machine and again on separate cloud hardware.",
              "Mean latency gains were 26–31% in every environment, and the tuned static map was beaten by 11–14%.",
              "The predictor is close to its ceiling. On AWS the oracle was 32% below FIFO and predictive 29%.",
                 "Shadow-mode overhead was not measurable in this benchmark: ±0.1% against FIFO.",
              "The tail did not improve. All-message P99 was 1.02–1.03× FIFO, so the claim is about the mean and the median, not the tail.",
            ]}
          />
          <p className="exp-links">
            <a className="exp-src" href={`${RESULTS}/rerun-2026-10-12/README.md`} target="_blank" rel="noopener noreferrer">Laptop re-run ↗</a>
            <a className="exp-src" href={`${RESULTS}/v3-aws/README.md`} target="_blank" rel="noopener noreferrer">AWS results ↗</a>
          </p>
        </Level>

        <Level level={0} tag="Benchmark 2" title="Long backlogs: a 30-minute run" id="sustained">
          <p className="hb-intro">
            <G>AWS, broker on its own host, two repetitions with a flash sale lasting six minutes. This run had no gate, only eight checks that had to hold in both repetitions. Three failed.</G>
          </p>
          <div className="exp-viz">
            <h5 className="viz-title">Predictive routing vs FIFO, mean latency by phase</h5>
            <Deltas
              span={60}
              rows={[
                { label: "Steady", value: -23 },
                { label: "Ramp", value: -54 },
                { label: "Flash sale", value: -7 },
                { label: "Recovery", value: -4 },
                { label: "Shifted", value: -18 },
              ]}
            />
          </div>
          <Table
            caption="Mean latency by phase in milliseconds, median of two repetitions"
            head={["Phase", "FIFO", "Static, tuned", "Shadow", "Predictive", "Change"]}
            rows={PHASES}
          />
          <Callout title="Why the overall gain shrinks to 6–7%">
            <G>Outside overload the predictor still halves latency in the ramp. But the flash sale pushes FIFO's mean to 68 s, and 92 s in the recovery, and those phases dominate the average. With waits that long the default 5 s aging lifts almost every waiting job to the top level, so routing changes the order very little. This is the aging collapse from the Azure trace, seen on real infrastructure.</G>
          </Callout>
          <Points
            items={[
              "No guardrail moved: P99 and the export max wait match FIFO.",
              "Shadow-mode overhead was not measurable, and predictive stayed ahead of the hand-tuned static map in this run.",
              "After the mid-run cost shift, predictive was 15–23% ahead of FIFO with no drift alerts.",
            ]}
          />
        </Level>

         <Level level={1} tag="Benchmark 3 · v4" title="Real traces through the real broker" id="traces">
           <p className="hb-intro">
             <G>Azure Functions 2021 and Huawei Cloud 2025 R5, at three loads, on AWS. Gate A uses default-aging predictive routing; gate B adds level weights and pausing aging. Gate A passes 0 of 6 cells; gate B passes 4 of 6. All three Huawei repeats agree on every verdict.</G>
           </p>
           <Table caption="v4 real-broker replay: window-average mean-latency change vs FIFO, with 95% intervals" head={["Trace · load", "Default-aging routing", "Gate A", "Weights + pausing", "Gate B"]} rows={REPLAY} />
           <p className="hb-fine"><G>28 equal-trace-time windows; moving-block bootstrap, block length 4, 10,000 resamples. Huawei pools three repeats; Azure has one run per cell. P1 requires a point estimate ≤ −15% and an interval below zero, not an entire interval below −15%. G1 and G2 require interval upper bounds ≤ 2.0× FIFO for P99 and long-class maximum wait. Valid runs also require all messages completed, no DLQ or lease expiry, and producer P99 lateness ≤ 10 ms in real time. Gate B's point ratios are at most 1.12× for P99 and 1.14× for long-class maximum wait across these cells.</G></p>
           <Callout title="What this replay does—and does not—validate">
             <G>Handlers sleep for recorded durations; they do not do CPU-bound application work. Azure uses time scale 4.5 and Huawei 1; reported latency is in trace time. Azure's load-0.8 pass clears the bar by 0.3 points on one run. All 76 planned cells counted after registered retries, but two Huawei attempts lost the broker for an unknown reason. Their container logs were removed before diagnosis. Successful retries do not explain those failures.</G>
           </Callout>
           <p className="exp-links">
             <a className="exp-src" href={`${RESULTS}/v4-replay/README.md`} target="_blank" rel="noopener noreferrer">Replay results and artifacts ↗</a>
             <a className="exp-src" href={`${GITHUB_URL}/blob/main/docs/v4-replay-preregistration.md`} target="_blank" rel="noopener noreferrer">Replay criteria and validity rules ↗</a>
           </p>

           <h3 className="sub">Historical simulations and the HPC boundary</h3>
           <p><G>The original v3 serverless simulation passed 1/6 routing cells and 5/6 weighted cells. Re-estimating with 28 windows and block bootstrap changes Huawei routing at 0.8 and Azure weighted at 0.5 to failures, yielding 0/6 and 4/6—the same verdicts as real-broker replay. The HPC logs below were not replayed through the real broker and are not pooled with those six cells.</G></p>
           <TraceGrid />
           <p className="hb-fine"><G>This grid preserves the original v3 analysis, not the latest serverless verdicts. DAS2-fs2 also failed its tail and long-job guardrails.</G></p>

          <h3 className="sub">Look closer</h3>
          <Tabs
            label="Trace"
            value={trace}
            onChange={setTrace}
            tabs={Object.entries(TRACE_STORIES).map(([id, t]) => ({ id, label: t.tab }))}
          />
          <div className="story" role="tabpanel">
            <h4>{story.title}</h4>
            <Points items={story.points} />
            {trace === "das2" && (
              <div className="exp-viz">
                <h5 className="viz-title">Mean latency over all jobs at load 0.8 (hours, exploratory)</h5>
                <Bars unit=" h" digits={2} rows={DAS2_DIAG} />
                <p className="viz-note">Exploratory arms, not part of any gate. Lower is better.</p>
              </div>
            )}
          </div>

          <Callout title="The boundary">
             <G>Recurring, predictable keys are useful but not sufficient for a scheduling gain. Default aging can erase the ordering, and prioritising short jobs can hurt long ones. Parameter variants were tested in serverless simulation; HPC time-scale tuning and real-broker confirmation of the sensitivity variants remain untested.</G>
          </Callout>
          <p className="exp-links">
            <a className="exp-src" href={`${RESULTS}/v3-traces/README.md`} target="_blank" rel="noopener noreferrer">Serverless traces ↗</a>
            <a className="exp-src" href={`${RESULTS}/v3-traces-2/README.md`} target="_blank" rel="noopener noreferrer">HPC logs ↗</a>
          </p>
         </Level>

         <Level level={2} tag="v4 · Baselines" title="Prediction is not the best scheduler here" id="baselines">
           <p className="hb-intro"><G>Eleven arms, ten seeds, 110 production-flow runs; all messages completed. This is a descriptive study, with no overall pass gate. Predictive routing lowered mean latency 32.1% [29.6, 34.4] vs FIFO and 15.5% [13.3, 17.8] vs a tuned static map. But per-type fair queueing did better on the mean without predicting durations.</G></p>
           <Table caption="Median run metrics on the v4 synthetic workload; milliseconds, lower is better" head={["Arm", "Mean", "Short-job P50", "All-message P99"]} rows={[
             ["FIFO", "6,927.7", "4,965.1", "21,099.4"],
             ["Predictive", "4,779.7", "39.3", "21,753.9"],
             ["Per-type fair queueing", "2,726.4", "16.1", "31,954.9"],
           ]} />
           <Callout title="A stronger baseline, with a different trade-off"><G>Predictive mean latency is 74.1% [64.5, 83.9] worse than per-type fair queueing. The fair scheduler's P99 is 51.7% [45.9, 58.1] worse than predictive. It requires operator-configured per-type queues/levels and was tested on nine near-deterministic types, not hundreds of trace keys. Harbinger avoids a per-endpoint priority map; it does not beat every scheduler.</G></Callout>
           <h3 className="sub">What the predictor ablations establish</h3>
           <Points items={[
             "Removing decay/idle forgetting, the spread gate, staleness, or minimum observations changes the overall mean by only 0.0–0.4%; each interval is within ±3%. This workload does not demonstrate an overall benefit from those components.",
             "Shifted-phase results are inconclusive, not proof that adaptation never helps. Censored-share handling was not ablated.",
             "The median remains the better tested summary: the mean estimator is +3.6% [+1.4, +6.1] worse and P75 +3.8% [+1.6, +6.3] worse than default predictive routing.",
           ]} />
           <p className="exp-links"><a className="exp-src" href={`${RESULTS}/v4-baselines/README.md`} target="_blank" rel="noopener noreferrer">Baseline and ablation results ↗</a></p>
         </Level>

         <Level level={0} tag="v4 · Mechanism" title="Aging's cost is now measured" id="aging">
           <p className="hb-intro"><G>Turning aging off is a separate intervention from adding weights with pausing aging. Both can preserve the predicted order, but neither removes the trade-off between short jobs and long waits.</G></p>
           <Table caption="Separate Huawei aging-off replay: window metrics vs each run's own FIFO, with 95% intervals" head={["Metric", "Load 0.8", "Load 0.95"]} rows={[
             ["Default-aging mean change", "−11.0% [−15.1, −1.7] · fail", "−8.5% [−11.7, −3.2] · fail"],
             ["Aging-off mean change", "−37.4% [−66.0, −4.4] · pass", "−45.4% [−73.6, −16.2] · pass"],
             ["Aging-off P99 ratio", "1.07× [1.01, 1.15]", "1.12× [1.02, 1.18]"],
             ["Aging-off long max-wait ratio", "1.16× [1.02, 1.23]", "1.14× [1.03, 1.21]"],
           ]} />
           <p><G>All three repeats agree at each load; all 18 runs completed without DLQ, submit errors or lost leases. Aging off also improves mean vs default-aging predictive by 34.1% and 41.8%. These runs use their own controls and different host sizes from the main replay. Runs of roughly 20–25 minutes do not establish starvation freedom over hours.</G></p>
           <h3 className="sub">Synthetic production-flow isolation</h3>
           <p><G>Across ten seeds, aging off lowers mean latency another 37.4% [35.1, 39.8] vs predictive and 57.6% [57.1, 58.1] vs FIFO. Against FIFO, P99 rises 13.6% [12.6, 14.6] and long-class maximum wait 13.6% [12.0, 14.7]. Against predictive, those costs are 10.1% and 12.2%. The mechanism is measured; the cost is measured too.</G></p>
           <h3 className="sub">AWS repeats the weighted-aging and size-bin misses</h3>
           <Points items={[
             "Weights with pausing aging lower mean latency 57.5% vs FIFO and 38.4% [34.7, 41.9] vs predictive. But P99 vs predictive is 1.100× [1.091, 1.107]; its upper bound exceeds the 1.10× limit, so the gate fails despite the rounded point estimate.",
             "Size bins change mean latency −1.5% [−4.5, +0.4] vs job-type keys, failing the −3% criterion. Invoice mean rises 9.5% [4.4, 15.9]; resize intervals are too wide for a directional conclusion. Better prediction is not automatically better end-to-end latency.",
           ]} />
           <p className="exp-links">
             <a className="exp-src" href={`${RESULTS}/v4-replay-aging/README.md`} target="_blank" rel="noopener noreferrer">Huawei aging-off replay ↗</a>
             <a className="exp-src" href={`${RESULTS}/v4-baselines/README.md`} target="_blank" rel="noopener noreferrer">Synthetic aging isolation ↗</a>
             <a className="exp-src" href={`${RESULTS}/v4-cloud-reruns/README.md`} target="_blank" rel="noopener noreferrer">AWS reruns ↗</a>
           </p>
         </Level>

         <Level level={1} tag="v4 · Limits" title="Validate the model, not just the result" id="validation">
           <Table caption="CPU-work production-flow validation: predictive mean change vs FIFO" head={["Environment", "Measured", "Simulated", "Effect gap"]} rows={[
             ["Quiet laptop", "−25.6%", "−37.0%", "11.4 points · fail"],
             ["AWS", "−30.8%", "−42.7%", "11.8 points · fail"],
           ]} />
           <p><G>Both fail the 10-percentage-point effect-agreement criterion, though phase directions and policy-group order pass. Simulated absolute latencies are only 0.31–0.41× measured. Production-flow conversion also omits failed-attempt work for 64 retried local messages. The simulation does not faithfully model CPU contention.</G></p>
           <Callout title="Agreement depends on the kind of work"><G>On the sleeping-handler serverless replays, simulated and measured whole-run effects generally agree to about one percentage point. That supports the queueing model on those traces, not CPU-bound application realism. There is no universal correction factor for simulation results.</G></Callout>
           <h3 className="sub">Parameter sensitivity is still simulation-only</h3>
           <Points items={[
             "At load 0.8 under the original seven-window rule, P1 passes across 18 tested configurations (including default): Azure routing 0, weighted 16; Huawei routing 10, weighted 18. Azure weighted fails with min_samples=100 and with two levels. These are P1 sensitivity results, not full-gate robustness counts.",
             "Huawei routing is sensitive to aging: thresholds of 1 s, 5 s and 30 s yield −3.3%, −15.0% and −40.7% mean changes. A parameter setting can change the verdict.",
             "Using 28 windows and block bootstrap changes two original simulation passes to failures. The registered Part C—real-broker replay of verdict-flipping variants—was triggered but not run. Main replay of the default configuration does not substitute for that missing confirmation.",
           ]} />
           <p className="exp-links">
             <a className="exp-src" href={`${RESULTS}/v4-simvalidation/README.md`} target="_blank" rel="noopener noreferrer">Simulator validation ↗</a>
             <a className="exp-src" href={`${RESULTS}/v4-sensitivity/README.md`} target="_blank" rel="noopener noreferrer">Sensitivity and missing confirmation ↗</a>
           </p>
         </Level>

        <Level level={2} tag="Conclusions" title="What the benchmarks support" id="conclusions">
          <div className="verdicts">
            <div className="verdict" data-kind="holds">
              <h3>Holds up</h3>
              <Points
                items={[
                   "On the tested synthetic production flow, predictive routing beats FIFO and the hand-tuned map on mean and short-job latency, without a per-endpoint priority map.",
                   "The original production-flow result replicates: laptop, quiet laptop re-run and AWS agree on every v2 gate verdict.",
                   "Shadow mode changes no routing and had no measurable overhead in those runs.",
                  "The idea is not tied to Harbinger's broker. It also works beside RabbitMQ.",
                ]}
              />
            </div>
            <div className="verdict" data-kind="cond">
              <h3>Holds with conditions</h3>
              <Points
                items={[
                  "Keys must recur and predict well. They do on serverless traces and mostly do not on the two HPC logs.",
                   "Default-aging routing passes 0/6 real-broker serverless cells. Weights with pausing aging pass 4/6; aging off also restores gains on Huawei, with tail and long-wait costs.",
                   "Predictive is not universally better: per-type fair queueing beats its mean on the synthetic workload, and a history-built static map matches or beats it on Huawei.",
                  "Effect sizes depend on load relative to CPU speed.",
                ]}
              />
            </div>
            <div className="verdict" data-kind="no">
              <h3>Not claimed</h3>
              <Points
                items={[
                   "Better tail latency or hours-long starvation freedom. Short-job gains can increase P99 and long-job waits.",
                  "Production readiness. All evidence is synthetic or trace-driven, and the broker is in-memory with no durability.",
                  "That learned models never help. The workloads tested had little for one to find.",
                  "Anything about other clouds, wide-area networks or durable queue modes.",
                ]}
              />
            </div>
          </div>

          <h3 className="sub">When to turn it on</h3>
          <ol className="steps">
             <li><strong>Start in shadow mode.</strong> It records predictions without changing routing. Measure its overhead on your workload.</li>
            <li><strong>Check that keys predict.</strong> Run a per-key predictability check on your own history. If most jobs sit on recurring keys with stable durations, move on.</li>
             <li><strong>Replay your workload against meaningful baselines.</strong> Include FIFO, a history-built static map and an appropriate fair scheduler. Predictability alone does not guarantee a gain.</li>
             <li><strong>Set tail and long-job budgets before enabling a policy.</strong> Compare default aging, weights with pausing, and aging off where relevant; use measured benefits and costs, not a blanket recommendation.</li>
          </ol>
          <p className="hb-fine"><G>This sequence is our reading of the results, not a pre-registered result. The predictability check as a deployment guideline comes from the HPC-log findings, and an automatic safeguard is future work.</G></p>

          <h3 className="sub">Limits of the evidence</h3>
          <Points
            items={[
               "The production flow is one scenario that we wrote. Serverless replay uses sleeping handlers and some reconstructed arrivals; HPC and sensitivity variants remain simulation-only.",
               "One cloud provider and region, with experiment-specific host layouts. Results do not establish behaviour on other infrastructure.",
               "Azure has one run per replay cell; two Huawei broker deaths remain unexplained. Roughly 5.8 GB of raw replay artifacts are hashed but not committed; run summaries are available.",
              "The 30-minute run has two repetitions, so its checks carry no intervals.",
              "The budgets of the first experiment were set after seeing earlier data, so that gate is less independent than the later ones.",
            ]}
          />
        </Level>

        <MoreFrom current="/harbinger/benchmarks" />
      </div>
    </Shell>
  );
}

export default HarbingerBenchmarks;
