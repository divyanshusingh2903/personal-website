// Plain-language definitions for the jargon used across the Harbinger pages.
// `match` is a regex source, matched case-insensitively on word boundaries; the first match in each text is linked.
const wiki = (page) => `https://en.wikipedia.org/wiki/${page}`;

export const ENTRIES = [
  { id: "ack", term: "Ack", match: "Acks?", def: "Short for acknowledgement. A consumer tells the broker it finished a message, and here it also reports how long the work took.", url: wiki("Acknowledgement_(data_networks)") },
  { id: "aging", term: "Aging", match: "aging", def: "A message that has waited too long is moved up one priority level, so low-priority work is delayed but never stuck forever.", url: wiki("Aging_(scheduling)") },
  { id: "backlog", term: "Backlog", match: "backlogs?", def: "Messages that have arrived but are still waiting because workers can't keep up." },
  { id: "bootstrap", term: "Bootstrap", match: "bootstrap", def: "A statistics method that re-samples your own results many times to see how much they could vary by chance.", url: wiki("Bootstrapping_(statistics)") },
  { id: "broker", term: "Broker", match: "broker", def: "The server in the middle. Producers hand messages to it, and consumers pull messages from it.", url: wiki("Message_broker") },
  { id: "cold", term: "Cold start", match: "cold start|cold keys?|cold", def: "The period before the predictor has seen enough finished jobs for a key to trust its estimate. Cold keys use the default middle tier." },
  { id: "ci", term: "Confidence interval", match: "95% intervals?|confidence intervals?", def: "A range that likely contains the true value. A 95% interval that sits entirely below zero means the improvement is unlikely to be luck.", url: wiki("Confidence_interval") },
  { id: "consumer", term: "Consumer", match: "consumers?", def: "A program that pulls messages from the queue and does the work they describe.", url: wiki("Producer%E2%80%93consumer_problem") },
  { id: "control", term: "Control", match: "controls?", def: "A test case designed so the thing being measured shouldn't help. If it still shows a gain, something is wrong.", url: wiki("Scientific_control") },
  { id: "dlq", term: "Dead-letter queue (DLQ)", match: "dead-letter queue|DLQ", def: "Where messages go after they fail too many times or expire, so they can be inspected instead of retried forever.", url: wiki("Dead_letter_queue") },
  { id: "fifo", term: "FIFO", match: "FIFO", def: "First in, first out. Messages are served strictly in arrival order, like a single supermarket line.", url: wiki("FIFO_(computing_and_electronics)") },
  { id: "gate", term: "Gate", match: "gates?", def: "A pass/fail test agreed before running an experiment. Predictive routing is only allowed if every gate passes." },
  { id: "gbm", term: "Gradient boosting", match: "gradient boosting", def: "A heavier machine-learning model that combines many small decision trees. Used here as a stand-in for \"a much more complex model\".", url: wiki("Gradient_boosting") },
  { id: "grpc", term: "gRPC", match: "gRPC", def: "A fast way for programs to call each other over a network. Harbinger's producers and consumers talk to the broker with it.", url: "https://grpc.io/docs/what-is-grpc/introduction/" },
  { id: "guardrail", term: "Guardrail", match: "guardrails?", def: "A metric that must not get much worse, even if the main metric improves. Tail latency and lost work are guardrails here." },
  { id: "hol", term: "Head-of-line blocking", match: "head-of-line blocking", def: "One slow item at the front of a line holds up everything behind it, however quick those items are.", url: wiki("Head-of-line_blocking") },
  { id: "histogram", term: "Histogram", match: "histograms?", def: "A count of how many times each range of values occurred. Here: how many jobs took 1–2 ms, 2–4 ms, and so on.", url: wiki("Histogram") },
  { id: "ewma", term: "EWMA", match: "EWMA|decaying average", def: "An exponentially weighted moving average. A running average that gives recent values more weight, so it adapts when things change.", url: wiki("Exponential_smoothing") },
  { id: "key", term: "Key", match: "keys?", def: "What Harbinger groups messages by when learning: the producer, optionally plus a job_type label (and size). Each key gets its own duration history." },
  { id: "latency", term: "Latency", match: "latency", def: "How long a message takes from being sent to being finished, including time spent waiting in the queue.", url: wiki("Latency_(engineering)") },
  { id: "mae", term: "MAE", match: "MAE", def: "Mean absolute error: on average, how far a prediction is from the real value, in the same units (here, milliseconds).", url: wiki("Mean_absolute_error") },
  { id: "mean", term: "Mean", match: "mean", def: "The ordinary average. It is pulled up by a few very slow items, so it shows the overall experience better than the median does.", url: wiki("Mean") },
  { id: "median", term: "Median", match: "median|P50", def: "The middle value: half the jobs are faster, half slower. It describes a typical job and ignores rare outliers.", url: wiki("Median") },
  { id: "mlfq", term: "Multi-level queue", match: "multi-level queue|multi-level feedback queue|MLFQ", def: "Several queues stacked by priority. The scheduler always serves the highest non-empty one first.", url: wiki("Multilevel_feedback_queue") },
  { id: "mq", term: "Message queue", match: "message queue", def: "Software that holds messages (jobs to do) until a worker is free to handle them, so senders don't have to wait.", url: wiki("Message_queue") },
  { id: "nonpreempt", term: "Non-preemptive", match: "non-preemptive", def: "Once a job starts it runs to the end. The scheduler can reorder waiting jobs but can't interrupt one that's running.", url: wiki("Preemption_(computing)") },
  { id: "oracle", term: "Oracle", match: "oracle", def: "A reference that cheats by knowing each job's true cost in advance. It shows what perfect knowledge would give, not what's achievable." },
  { id: "percentile", term: "P95 / P99 (tail latency)", match: "P99|P95|percentiles?", def: "P99 is the time that 99% of messages beat. It describes the slowest 1%, the \"tail\", which matters because users notice the slow ones.", url: wiki("Percentile") },
  { id: "predictor", term: "Predictor", match: "predictors?", def: "The part of the broker that estimates how long a message will take, using what earlier messages with the same key took." },
  { id: "prereg", term: "Pre-registration", match: "pre-?registered|pre-?registration|pre-?registering", def: "Writing down the hypotheses, setup and pass/fail rules before running the experiment, so results can't be quietly reinterpreted afterwards.", url: wiki("Preregistration_(science)") },
  { id: "producer", term: "Producer", match: "producers?", def: "A program that creates messages and sends them to the queue.", url: wiki("Producer%E2%80%93consumer_problem") },
  { id: "quantile", term: "Quantile", match: "quantiles?", def: "A cut point that splits sorted values into equal groups. Harbinger uses them to decide where one tier ends and the next begins.", url: wiki("Quantile") },
  { id: "rr", term: "Round-robin", match: "round-robin", def: "Take turns between queues in a fixed rotation, regardless of what's in them.", url: wiki("Round-robin_scheduling") },
  { id: "seed", term: "Seed", match: "seeds?", def: "A starting number for a random generator. Same seed, same random-looking data, so a run can be repeated exactly.", url: wiki("Random_seed") },
  { id: "serverless", term: "Serverless", match: "serverless|Azure Functions", def: "A cloud style where you upload small functions and the provider runs them on demand. The Azure Functions trace records one such platform's invocations.", url: wiki("Serverless_computing") },
  { id: "shadow", term: "Shadow mode", match: "shadow mode|shadow", def: "The predictor runs and learns, but its guesses are only recorded, never used. Safe way to try it on real traffic." },
  { id: "sjf", term: "Shortest job first", match: "shortest-job-first|shortest-expected-first", def: "Serve the quickest jobs first. It lowers the average wait but makes long jobs wait longer.", url: wiki("Shortest_job_next") },
  { id: "slowdown", term: "Slowdown", match: "slowdown", def: "Latency divided by the job's own work time. A 1 ms job that waits 1 s has a slowdown of 1000." },
  { id: "spread", term: "Spread gate", match: "spread gate|p99/p50 spread|p99/p50", def: "If a key's slowest runs (p99) are more than 16× its typical run (median), its cost is too erratic to trust, so it takes the default tier." },
  { id: "static", term: "Static priority", match: "static (?:priority )?maps?|static priority|static history", def: "A hand-written rule that fixes each job type's priority in advance and never changes with what's observed." },
  { id: "throughput", term: "Throughput", match: "throughput", def: "How many messages get finished per second.", url: wiki("Throughput") },
  { id: "tier", term: "Tier", match: "tiers?", def: "A priority level in the queue. L0 is served first, then L1, then L2.", url: wiki("Priority_queue") },
  { id: "tieracc", term: "Tier accuracy", match: "tier accuracy|correct tier", def: "How often a message's predicted tier matches the tier its real duration would have earned." },
  { id: "tree", term: "Decision tree", match: "(?:adaptive )?trees?", def: "A model that makes a prediction by answering a chain of yes/no questions about the input.", url: wiki("Decision_tree_learning") },
  { id: "ttl", term: "TTL", match: "TTL", def: "Time to live. After this long a message is considered expired and dropped.", url: wiki("Time_to_live") },
  { id: "worker", term: "Worker", match: "workers?", def: "A process that takes one message at a time and runs the work for it." },
];

const COMPILED = ENTRIES.map((e) => ({ ...e, re: new RegExp(`\\b(?:${e.match})\\b`, "i") }));

// First occurrence of each glossary term in `text`, in order, without overlaps.
export function findTerms(text) {
  const hits = [];
  for (const e of COMPILED) {
    const m = e.re.exec(text);
    if (m) hits.push({ entry: e, index: m.index, text: m[0] });
  }
  hits.sort((a, b) => a.index - b.index || b.text.length - a.text.length);
  const out = [];
  let end = 0;
  for (const h of hits) {
    if (h.index < end) continue;
    out.push(h);
    end = h.index + h.text.length;
  }
  return out;
}
