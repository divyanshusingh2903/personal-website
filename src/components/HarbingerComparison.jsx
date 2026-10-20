import { useState } from "react";
import { Link } from "react-router-dom";
import Shell, { Level, Top, GITHUB_URL } from "../harbinger/Shell";
import { G } from "../harbinger/Glossary";
import { Bars, Deltas } from "../harbinger/Charts";
import { Brand, Callout, Headlines, MoreFrom, Points, SectionNav, Table, Tabs } from "../harbinger/Ui";
import "../harbinger/harbinger.css";

const AWS = `${GITHUB_URL}/blob/main/benchmarks/results/v3-aws`;

const NAV = [
  { id: "summary", label: "Summary" },
  { id: "setup", label: "The setup" },
  { id: "scheduling", label: "Scheduling" },
  { id: "cost", label: "Broker cost" },
  { id: "together", label: "Taken together" },
];

const ARMS = [
  [<Brand name="Harbinger">Harbinger FIFO</Brand>, "One level"],
  [<Brand name="Harbinger">Harbinger static, tuned</Brand>, "A well-configured static priority map"],
  [<Brand name="Harbinger">Harbinger predictive</Brand>, "Per-key predictor, strict priority, default aging (primary arm)"],
  [<Brand name="Harbinger">Harbinger predictive, weighted</Brand>, "Predictor + level weights [8, 3, 1] + pausing aging"],
  [<Brand name="RabbitMQ">RabbitMQ FIFO</Brand>, "Classic queue, manual ack, prefetch 1"],
  [<Brand name="RabbitMQ">RabbitMQ priority</Brand>, "Max priority 3, the same static map, no aging"],
  [<Brand name="RabbitMQ">RabbitMQ predictive</Brand>, "Priorities from a sidecar running Harbinger's own predictor"],
  [<Brand name="Redis">Redis FIFO</Brand>, "Reliable list queue: LPUSH, BLMOVE to a per-worker list, LREM"],
];

const GATE = [
  ["P1 mean vs RabbitMQ FIFO (≤ −15%)", "−21.7% [−26.2, −18.4]", { v: "Pass", kind: "pass" }],
  ["P2 short-job median vs RabbitMQ FIFO (≤ −30%)", "−89.5% [−98.8, −75.5]", { v: "Pass", kind: "pass" }],
  ["P3 mean vs Redis FIFO (≤ −15%)", "−25.5% [−29.5, −22.6]", { v: "Pass", kind: "pass" }],
  ["P4 short-job median vs Redis FIFO (≤ −30%)", "−90.7% [−99.0, −78.0]", { v: "Pass", kind: "pass" }],
  ["G1 all-message P99 vs RabbitMQ FIFO (≤ 1.25×)", "1.10× [1.07, 1.12]", { v: "Pass", kind: "pass" }],
  ["G2 export max wait vs RabbitMQ priority (≤ 1.0×)", "0.20× [0.18, 0.23]", { v: "Pass", kind: "pass" }],
  ["G3 no lost work", "Every message completed", { v: "Pass", kind: "pass" }],
  ["G4 throughput vs RabbitMQ FIFO (≥ 0.98×)", "1.00× [0.99, 1.00]", { v: "Pass", kind: "pass" }],
];

const SECONDARY = [
  ["S1 Harbinger FIFO vs RabbitMQ FIFO, mean (±10%)", "+11.0% [+10.4, +11.6]", { v: "Fail", kind: "fail" }],
  ["S2 Harbinger FIFO vs Redis FIFO, mean (±10%)", "+5.6% [+4.9, +6.2]", { v: "Pass", kind: "pass" }],
  ["S3 RabbitMQ predictive vs RabbitMQ FIFO, mean (≤ −15%)", "−57.6% [−58.6, −56.8]", { v: "Pass", kind: "pass" }],
  ["S4 RabbitMQ predictive vs RabbitMQ priority, mean (≤ +10%)", "−26.3% [−31.5, −21.1]", { v: "Pass", kind: "pass" }],
  ["S6 Harbinger weighted vs RabbitMQ FIFO, mean (≤ −15%)", "−52.4% [−53.4, −51.0]", { v: "Pass", kind: "pass" }],
  ["S7 Harbinger weighted vs RabbitMQ FIFO, P99 (≤ 1.25×)", "1.21× [1.20, 1.24]", { v: "Pass", kind: "pass" }],
  ["S8 RabbitMQ priority vs RabbitMQ FIFO, export max wait (≤ 2×)", "5.23× [4.79, 5.55]", { v: "Fail, expected", kind: "fail" }],
];

// Delivered at a fixed offered rate: kept up out of 5 runs, then median P50 and P99.
const RATES = {
  1000: { label: "1,000 msg/s", rows: [["Harbinger", 5, "0.24 ms", "0.62 ms"], ["RabbitMQ", 5, "0.15 ms", "0.52 ms"], ["Redis", 5, "0.16 ms", "0.54 ms"]],
    note: "All three keep up with sub-millisecond latency. Harbinger is slightly slower at the median." },
  5000: { label: "5,000 msg/s", rows: [["Harbinger", 5, "0.30 ms", "10.6 ms"], ["RabbitMQ", 5, "0.12 ms", "0.31 ms"], ["Redis", 5, "0.10 ms", "0.31 ms"]],
    note: "Harbinger is at its limit. Two of its five runs built a queue (P50 91 ms and 462 ms, P99 446 ms and 1,227 ms). The other three stayed at 0.30 ms P50." },
  20000: { label: "20,000 msg/s", rows: [["Harbinger", 0, "30.8 s", "40.6 s"], ["RabbitMQ", 5, "0.23 ms", "11.4 ms"], ["Redis", 3, "0.23 ms", "76.7 ms"]],
    note: "Harbinger falls behind in all five runs, so its latency is queueing time, in seconds. RabbitMQ keeps up in all five and Redis in three." },
};

function Dots({ n, of = 5 }) {
  return (
    <span className="dots" role="img" aria-label={`Kept up in ${n} of ${of} runs`}>
      {Array.from({ length: of }, (_, i) => <i key={i} data-on={i < n ? "" : undefined} />)}
      <b>{n}/{of}</b>
    </span>
  );
}

function HarbingerComparison() {
  const [view, setView] = useState("mean");
  const [rate, setRate] = useState("5000");
  const r = RATES[rate];

  return (
    <Shell title="Harbinger vs RabbitMQ and Redis | Scheduling and broker cost">
      <section className="hb-hero hb-hero-short">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Comparison</p>
          <h1>Same workload. Different broker.</h1>
          <p className="hb-lede">
            <G>On the tested synthetic workload, predictive scheduling beats RabbitMQ and Redis FIFO, while Harbinger has higher broker cost. The v4 follow-up isolates aging's contribution and tests a stronger scheduling baseline.</G>
          </p>
        </div>
      </section>

      <SectionNav items={NAV} />

      <div className="hb-page">
        <Level level={0} tag="Summary" title="Two questions, two answers" id="summary">
          <Headlines
            items={[
              ["−21.7%", "mean latency vs RabbitMQ FIFO"],
              ["−25.5%", "mean latency vs Redis FIFO"],
              ["−57.6%", "mean latency with the predictor as a RabbitMQ sidecar"],
              ["5,293/s", "Harbinger's peak throughput", "RabbitMQ 7,371, Redis 21,182"],
            ]}
          />
          <div className="duo">
            <div className="duo-card" data-kind="win">
              <span>Scheduling outcome</span>
              <h3>A win against the tested FIFO baselines</h3>
              <p><G>On the same production-flow workload, predictive routing cut mean latency by more than 20% against both FIFO brokers and the short-job median by about 90%. The gate passed.</G></p>
            </div>
            <div className="duo-card" data-kind="lose">
              <span>Broker cost</span>
              <h3>Harbinger the broker loses</h3>
              <p><G>With empty handlers it delivers about 5,300 messages per second, 72% of RabbitMQ and a quarter of Redis, and falls behind at 20,000 per second.</G></p>
            </div>
          </div>
        </Level>

        <Level level={1} tag="Method" title="The setup" id="setup">
          <p className="hb-intro">
            <G>Identical producers, handlers, workers, arrival schedule and seeds. Only the broker and its policy change. The comparison was pre-registered and frozen before any registered run.</G>
          </p>
          <Table caption="The eight arms of the scheduling comparison" head={["Arm", "Policy"]} rows={ARMS} />
          <h3 className="sub">Ground rules</h3>
          <Points
            items={[
              "AWS us-east-1a in one placement group. Broker on a c8i.xlarge (4 vCPU), clients on a c8i.2xlarge (8 vCPU), with a fresh broker container for every arm, seed and rate.",
              "Versions: RabbitMQ 3.12.1 (Erlang 25.3), Redis 7.0.15. Default settings except those listed.",
              "Nothing is durable on any broker: Harbinger is in memory, RabbitMQ uses transient messages with no publisher confirms, and Redis has no RDB or AOF.",
              "RabbitMQ runs with prefetch 1, which is how its priorities reorder anything at all, and which also limits its throughput.",
              "Retries follow each broker's own rules: near the head of RabbitMQ's queue, the tail of Redis's, and the original priority on Harbinger.",
            ]}
          />
          <Callout title="The sidecar">
            <G>RabbitMQ has no predictor, so one arm runs Harbinger's own per-key predictor in the client process. It predicts at publish, sets the message's priority and learns from successful attempts. This tests whether the idea works without Harbinger's broker.</G>
          </Callout>
        </Level>

        <Level level={2} tag="Question 1" title="Scheduling outcome" id="scheduling">
          <p className="hb-intro">
            <G>The production flow: nine job types, a flash sale and a mid-run cost shift, five seeds, 300 s of arrivals and 4 workers. The primary arm is Harbinger predictive.</G>
          </p>
          <div className="exp-viz">
            <Tabs
              label="Chart view"
              value={view}
              onChange={setView}
              tabs={[{ id: "mean", label: "Mean latency" }, { id: "delta", label: "Change vs RabbitMQ FIFO" }]}
            />
            {view === "mean" ? (
              <>
                <h5 className="viz-title">Mean latency, median across seeds (s). Lower is better.</h5>
                <Bars
                  unit=" s"
                  digits={2}
                  rows={[
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger FIFO", value: 7.319, kind: "base" },
                    { icon: <Brand name="Redis" bare />, label: "Redis FIFO", value: 7.008, kind: "base" },
                    { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ FIFO", value: 6.643, kind: "base" },
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger predictive", value: 5.296, kind: "ours" },
                    { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ priority", value: 4.153 },
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger weighted", value: 3.141, kind: "ours" },
                    { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ + sidecar", value: 2.839 },
                  ]}
                />
              </>
            ) : (
              <>
                <h5 className="viz-title">Mean latency against RabbitMQ FIFO, paired by seed</h5>
                <Deltas
                  span={70}
                  legend={["← faster than RabbitMQ FIFO", "slower than RabbitMQ FIFO →"]}
                  rows={[
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger FIFO", value: 11.0 },
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger predictive", value: -21.7 },
                    { icon: <Brand name="Harbinger" bare />, label: "Harbinger weighted", value: -52.4 },
                    { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ + sidecar", value: -57.6 },
                  ]}
                />
              </>
            )}
            <p className="viz-note">Grey bars are FIFO. Bars with a dot are Harbinger's own routing. The paired changes are medians of per-seed differences, so they differ slightly from the ratio of the medians.</p>
          </div>

          <Table caption="The gate. Primary arm: Harbinger predictive. Paired by seed, bootstrap 95% intervals." head={["Criterion", "Estimate [95% interval]", "Result"]} rows={GATE} />

          <h3 className="sub">What it shows</h3>
          <Points
            items={[
              "The gate passes by less than expected. The pre-registration expected −25% to −28%, and against RabbitMQ it is −21.7%. Part of the gap is Harbinger's own FIFO arm running 11% slower than RabbitMQ's, just outside the ±10% bar.",
              "The idea transfers: on this workload the RabbitMQ sidecar cut mean latency by 57.6% against its FIFO, versus Harbinger predictive at −21.7% and weighted at −52.4% against RabbitMQ FIFO.",
              "This original cross-broker experiment does not isolate aging. RabbitMQ priorities never age, while Harbinger's default aging promotes waiting long jobs. Separate v4 experiments now measure the cost of that protection within Harbinger.",
            ]}
          />
          <Callout title="v4 follow-up: aging's cost is now isolated">
            <G>A preregistered synthetic production-flow experiment lowers Harbinger's mean another 37.4% [35.1, 39.8] by turning aging off, reaching −57.6% vs its own FIFO. That supports aging as the mechanism behind the sidecar gap. The matching −57.6% figures are not a paired equivalence test: the experiments use different host layouts and baselines. Without aging, P99 and long-class maximum wait each rise 13.6% vs FIFO. Separate Huawei replay also recovers gains, but its 20–25-minute runs cannot establish starvation freedom over hours.</G>
          </Callout>
          <p className="exp-links">
            <a className="exp-src" href={`${GITHUB_URL}/blob/main/benchmarks/results/v4-baselines/README.md`} target="_blank" rel="noopener noreferrer">Aging isolation results ↗</a>
            <Link className="exp-src" to="/harbinger/benchmarks#aging">Tail costs and real-trace isolation →</Link>
          </p>
          <Callout title="A stronger scheduling baseline also matters">
            <G>On the v4 synthetic workload, predictive mean is 74.1% worse than per-type fair queueing, which needs no predictions. The fair scheduler's P99 is 51.7% worse than predictive, and it requires operator-configured per-type queues. These FIFO comparisons establish a scheduling benefit, not superiority to every policy. <Link to="/harbinger/benchmarks#baselines">See the baseline study.</Link></G>
          </Callout>
          <h3 className="sub">Protecting long jobs</h3>
          <p className="hb-intro">
            <G>Static priorities without aging greatly increase long-job waits here. The longest export waited 101 s on RabbitMQ priority, 5.2× FIFO. Harbinger's predictive routing held that wait to a fifth of it. Finite observed waits do not establish general starvation freedom for either policy.</G>
          </p>
          <div className="exp-viz">
            <h5 className="viz-title">Longest export wait, median across seeds (s)</h5>
            <Bars
              unit=" s"
              digits={1}
              rows={[
                { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ FIFO", value: 18.3, kind: "base" },
                { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ + sidecar", value: 20.9 },
                { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ priority", value: 101 },
              ]}
            />
          </div>
          <Table caption="Secondary criteria, reported but not gated" head={["Criterion", "Estimate [95% interval]", "Result"]} rows={SECONDARY} />
        </Level>

        <Level level={0} tag="Question 2" title="What each broker costs" id="cost">
          <p className="hb-intro">
            <G>Empty handlers, 64-byte payloads, 4 producers and 4 consumers, 30 s runs with a 5 s warm-up and five repetitions. This tests the broker itself, with no scheduling in play.</G>
          </p>
          <div className="exp-viz">
            <h5 className="viz-title">Peak sustained delivery rate, median (messages per second)</h5>
            <Bars
              digits={0}
              rows={[
                { icon: <Brand name="Harbinger" bare />, label: "Harbinger", value: 5293, kind: "ours", text: "5,293" },
                { icon: <Brand name="RabbitMQ" bare />, label: "RabbitMQ (prefetch 1)", value: 7371, text: "7,371" },
                { icon: <Brand name="Redis" bare />, label: "Redis", value: 21182, text: "21,182" },
              ]}
            />
          </div>

          <h3 className="sub">At a fixed rate</h3>
          <Tabs
            label="Offered rate"
            value={rate}
            onChange={setRate}
            tabs={Object.entries(RATES).map(([id, v]) => ({ id, label: v.label }))}
          />
          <div className="tbl-wrap" role="region" tabIndex={0} aria-label={`Results at ${r.label}`}>
            <table className="tbl" data-lead="">
              <caption>Offered {r.label}. Kept up means no loss, at least 99% of the rate delivered, and sends on time.</caption>
              <thead><tr><th scope="col">Broker</th><th scope="col">Kept up</th><th scope="col">P50</th><th scope="col">P99</th></tr></thead>
              <tbody>
                {r.rows.map(([name, n, p50, p99]) => (
                  <tr key={name}>
                    <th scope="row"><Brand name={name} /></th>
                    <td><Dots n={n} /></td>
                    <td>{p50}</td>
                    <td>{p99}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hb-fine"><G>{r.note}</G></p>

          <h3 className="sub">What it shows</h3>
          <Points
            items={[
              "Harbinger is the slowest of the three, as the pre-registration expected: about 72% of RabbitMQ's throughput and a quarter of Redis's.",
              "Its latency matches the others only at 1,000 msg/s. The pre-registration expected the same sub-millisecond range at 5,000 msg/s, and that held in only three of five runs.",
              "RabbitMQ's undelivered messages at peak rate need care. It accepted about 56,000 publishes per second but delivered about 7,400, and 8–14% of messages were still undelivered when the 60 s drain ended. Without publisher confirms the benchmark cannot tell whether they were still queued, so they count as not delivered. Every fixed-rate RabbitMQ run lost nothing.",
            ]}
          />
        </Level>

        <Level level={2} tag="Conclusions" title="Taken together" id="together">
          <Points
            items={[
              "The scheduling idea is separable from Harbinger's broker. The same predictor lowers mean latency on RabbitMQ by more than half and beats a hand-tuned RabbitMQ priority map by 26%.",
              "In the production flow broker cost is small. Handlers take milliseconds to seconds at about 116 messages per second, far below Harbinger's limit, so it shows only as the 11% gap in the FIFO arms.",
              "If handlers are trivial and the rate is tens of thousands per second, this benchmark says Redis or RabbitMQ will serve better today. Harbinger fell behind at 20,000 msg/s.",
              "Prioritising short jobs has a long-job cost. In this workload RabbitMQ static priority's longest export waited 5.2× longer than under FIFO; v4 Harbinger aging-off runs separately measure higher P99 and long waits.",
            ]}
          />
          <h3 className="sub">Limits of the comparison</h3>
          <Points
            items={[
              "One synthetic workload, one cloud provider and region, two instance types.",
              "The broker comparison and throughput measurements are the original v3 results. V4 adds separate baseline and aging studies, not a new RabbitMQ/Redis rerun.",
              "Default broker settings, except those listed. RabbitMQ prefetch 1 limits its throughput and is noted wherever it matters.",
              "Harbinger's scheduling arms ran the benchmark build of the broker, which has observation hooks. The broker-cost test ran the production server.",
              "Non-durable modes only. Kafka, Pulsar, managed cloud queues and durable modes were out of scope.",
            ]}
          />
          <p className="exp-links">
            <a className="exp-src" href={`${AWS}/README.md`} target="_blank" rel="noopener noreferrer">All AWS results ↗</a>
            <a className="exp-src" href={`${GITHUB_URL}/blob/main/docs/v3-brokers-preregistration.md`} target="_blank" rel="noopener noreferrer">Pre-registration ↗</a>
          </p>
        </Level>

        <MoreFrom current="/harbinger/comparison" />
      </div>
    </Shell>
  );
}

export default HarbingerComparison;
