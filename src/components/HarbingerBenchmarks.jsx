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
  { id: "conclusions", label: "What it supports" },
];

const SCOREBOARD = [
  ["Production flow", "Laptop, quiet re-run", { v: "Passed", kind: "pass" }, "Mean −25.6% vs FIFO"],
  ["Production flow, replicated", "AWS", { v: "Passed", kind: "pass" }, "Mean −30.8% vs FIFO"],
  ["30-minute run, broker on its own host", "AWS", { v: "3 of 8 checks failed", kind: "mixed" }, "Mean −6% to −7% vs FIFO"],
  ["Level weights + pausing aging, production flow", "Laptop", { v: "Not passed", kind: "fail" }, "Mean −56.7% vs FIFO, but P99 1.12× (limit 1.10×)"],
  ["Size-binned keys", "Laptop", { v: "Not passed", kind: "fail" }, "No measurable gain over job-type keys"],
  ["Azure Functions 2021 trace", "Simulation", { v: "Routing alone: 0 of 3", kind: "fail" }, "With the overload design: 3 of 3, mean −15% to −25%"],
  ["Huawei 2025 trace", "Simulation", { v: "Routing alone: 1 of 3", kind: "mixed" }, "With the overload design: 2 of 3, mean up to −50%"],
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

const TRACE_STORIES = {
  azure: {
    tab: "Azure",
    title: "Azure Functions 2021: 990,476 invocations",
    points: [
      "Routing alone gained only 1–3%. Under the default 5 s aging every waiting job is promoted to the top level, so the predicted order is lost.",
      "With weights and pausing aging, the same predictor cut mean latency 15–25% at every load, and all guardrails held.",
      "One backlog dominates the trace. A single window was offered 3.46× capacity, and FIFO's mean latency there was 2.4 hours. The gains come from the other windows, and that window is unchanged or slightly worse.",
    ],
  },
  huawei: {
    tab: "Huawei",
    title: "Huawei 2025 serverless trace",
    points: [
      "Queueing happens in the busy windows only. In the quiet windows every policy sits at the service time of about 0.2 s, so nothing can be gained, which is why load 0.5 fails.",
      "At load 0.8 the weighted design took the short-job median from 8.0 s to 54 ms. The long-job mean rose 17% (30.4 s to 35.5 s), and all-message P99 stayed within 1.10×.",
      "A hand-tuned static map matched the predictor here, because this trace's keys are stable within a day. The predictor's case is that it needs no map.",
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
        <caption>Mean latency vs FIFO by trace, arm and load. Filled cells passed the pre-registered gate; outlined cells did not.</caption>
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
            <G>The same pre-registered gates, run on a laptop, on AWS and on four public traces. This page collects the results and says which conclusions they support.</G>
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
              ["5 of 12", "trace cells passed with the overload design", "1 of 12 with routing alone"],
            ]}
          />
          <Table caption="Every benchmark and how it came out" head={["Benchmark", "Where", "Outcome", "Headline"]} rows={SCOREBOARD} />
          <p className="hb-fine"><G>Outcomes are against criteria frozen before the runs. A pass means every gate criterion passed. Raw files are hashed with SHA-256 and listed in the repository.</G></p>
        </Level>

        <Level level={1} tag="Method" title="How we measured" id="setup">
          <p className="hb-intro">
            <G>Two kinds of benchmark. The production flow runs a real gRPC broker with real worker processes on a workload we wrote: nine job types, a flash sale and a mid-run cost shift. The trace simulations replay public logs through the same scheduling code on simulated time, so load cannot affect them.</G>
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
              "Shadow mode was free: ±0.1% against FIFO.",
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
              "Shadow mode cost nothing, and predictive stayed ahead of the hand-tuned static map.",
              "After the mid-run cost shift, predictive was 15–23% ahead of FIFO with no drift alerts.",
            ]}
          />
        </Level>

        <Level level={1} tag="Benchmark 3" title="Real traces" id="traces">
          <p className="hb-intro">
            <G>Four public traces, replayed under common pre-registered rules at three loads. Two arms are gated: routing alone, as built, and routing with level weights and pausing aging. A third arm gives the scheduler perfect predictions, to show where a failure comes from.</G>
          </p>
          <TraceGrid />
          <p className="hb-fine"><G>The Huawei routing-alone result at load 0.8 is borderline: −15.01% against a −15% bar. On DAS2-fs2 the weighted design also failed its guardrails.</G></p>

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
            <G>The design helps where keys recur and predict well, which serverless functions have. Where keys churn or predict poorly, routing gives nothing, and with the overload design it can hurt long jobs. Two defaults are tuned for short jobs: aging at 5 s and the stale limit at 30 minutes. Scaled settings were not tested.</G>
          </Callout>
          <p className="exp-links">
            <a className="exp-src" href={`${RESULTS}/v3-traces/README.md`} target="_blank" rel="noopener noreferrer">Serverless traces ↗</a>
            <a className="exp-src" href={`${RESULTS}/v3-traces-2/README.md`} target="_blank" rel="noopener noreferrer">HPC logs ↗</a>
          </p>
        </Level>

        <Level level={2} tag="Conclusions" title="What the benchmarks support" id="conclusions">
          <div className="verdicts">
            <div className="verdict" data-kind="holds">
              <h3>Holds up</h3>
              <Points
                items={[
                  "Learning each key's duration from acknowledgements beats FIFO and hand-tuned priorities on mean and short-job latency, with no configuration.",
                  "The result replicates: laptop, quiet laptop re-run and AWS agree on every gate verdict.",
                  "Shadow mode is a safe first step. It costs nothing measurable.",
                  "The idea is not tied to Harbinger's broker. It also works beside RabbitMQ.",
                ]}
              />
            </div>
            <div className="verdict" data-kind="cond">
              <h3>Holds with conditions</h3>
              <Points
                items={[
                  "Keys must recur and predict well. They do on serverless traces and mostly do not on the two HPC logs.",
                  "Under backlogs lasting minutes or hours, routing alone is flattened by aging. The weighted design recovers the gain on serverless traces but can harm long jobs.",
                  "Short jobs win at the expense of long ones. On Huawei the long-job mean rose 17%.",
                  "Effect sizes depend on load relative to CPU speed.",
                ]}
              />
            </div>
            <div className="verdict" data-kind="no">
              <h3>Not claimed</h3>
              <Points
                items={[
                  "Better tail latency. The queue is non-preemptive, and P99 was flat or up to 12% worse.",
                  "Production readiness. All evidence is synthetic or trace-driven, and the broker is in-memory with no durability.",
                  "That learned models never help. The workloads tested had little for one to find.",
                  "Anything about other clouds, wide-area networks or durable queue modes.",
                ]}
              />
            </div>
          </div>

          <h3 className="sub">When to turn it on</h3>
          <ol className="steps">
            <li><strong>Start in shadow mode.</strong> It records predictions without changing routing, and costs nothing measurable.</li>
            <li><strong>Check that keys predict.</strong> Run a per-key predictability check on your own history. If most jobs sit on recurring keys with stable durations, move on.</li>
            <li><strong>Turn on predictive routing.</strong> Expect a lower mean and a much lower short-job median. Do not expect a better tail.</li>
            <li><strong>Add weights and pausing aging only if backlogs last minutes or longer</strong> and step 2 passed. Watch long-job waits.</li>
          </ol>
          <p className="hb-fine"><G>This sequence is our reading of the results, not a pre-registered result. The predictability check as a deployment guideline comes from the HPC-log findings, and an automatic safeguard is future work.</G></p>

          <h3 className="sub">Limits of the evidence</h3>
          <Points
            items={[
              "The production flow is one scenario that we wrote. The traces are real but simulated, with some arrivals reconstructed.",
              "One cloud provider, one region, one placement group and two instance types.",
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
