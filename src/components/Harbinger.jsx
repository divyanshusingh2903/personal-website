import { useState } from "react";
import { Link } from "react-router-dom";
import Shell, { Level, Top } from "../harbinger/Shell";
import QueueSim from "../harbinger/QueueSim";
import FlowDiagram from "../harbinger/FlowDiagram";
import PredictorLab from "../harbinger/PredictorLab";
import { G } from "../harbinger/Glossary";
import { Bars } from "../harbinger/Charts";
import "../harbinger/harbinger.css";

const IDEA = [
  ["Predict", "Each message's cost, from what its key took before."],
  ["Route", "Cheap work to L0, heavy work to L2."],
  ["Learn", "Every Ack sharpens the next estimate."],
];

const installTabs = [
  { id: "deps", label: "deps", prefix: "sudo apt install -y ", highlight: "libgrpc++-dev protobuf-compiler-grpc libprotobuf-dev", suffix: "", copy: "sudo apt install -y libgrpc++-dev protobuf-compiler-grpc libprotobuf-dev" },
  { id: "build", label: "build", prefix: "cmake -B build -DCMAKE_BUILD_TYPE=Release && ", highlight: "cmake --build build -j$(nproc)", suffix: "", copy: "cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j$(nproc)" },
  { id: "server", label: "broker", prefix: "./build/harbinger_server ", highlight: "--routing-mode shadow", suffix: "", copy: "./build/harbinger_server --routing-mode shadow" },
  { id: "predictive", label: "predictive", prefix: "./build/harbinger_server ", highlight: "--routing-mode predictive", suffix: "", copy: "./build/harbinger_server --routing-mode predictive" },
  { id: "demo", label: "demo", prefix: "./build/demo/", highlight: "harbinger_demo", suffix: "", copy: "./build/demo/harbinger_demo" },
];

function Install() {
  const [active, setActive] = useState(installTabs[0].id);
  const [copied, setCopied] = useState(false);
  const tab = installTabs.find((t) => t.id === active);

  const copy = () => {
    navigator.clipboard?.writeText(tab.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="hb-install">
      <div className="hb-pills" role="tablist" aria-label="Build and run Harbinger">
        {installTabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === active} className="hb-pill" onClick={() => { setActive(t.id); setCopied(false); }}>
            {t.label}
          </button>
        ))}
      </div>
      <button className="hb-command" onClick={copy} aria-label={`Copy: ${tab.copy}`}>
        <span className="hb-prompt">$</span>
        <span className="hb-command-script">
          <span>{tab.prefix}</span>
          <span className="hb-highlight">{tab.highlight}</span>
          <span>{tab.suffix}</span>
        </span>
        <span className="hb-copy">{copied ? "copied" : "copy"}</span>
      </button>
    </div>
  );
}

function Harbinger() {
  return (
    <Shell title="Harbinger | Predictive multi-level message queue">
      <section className="hb-hero">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Predictive multi-level message queue</p>
          <h1>Same messages. Same worker. A smarter order.</h1>
          <p className="hb-lede">
            <G>Harbinger learns how long each kind of message takes, then serves cheap work first, with no hand-labelled priorities.</G>
          </p>
          <ol className="hb-idea">
            {IDEA.map(([name, text], i) => (
              <li key={name}>
                <span>{i + 1}</span>
                <div><strong>{name}</strong><G>{text}</G></div>
              </li>
            ))}
          </ol>
        </div>
        <QueueSim />
      </section>

      <div className="hb-page">
        <Level level={0} tag="The path of a message" title="How it flows" id="flow" wide>
          <FlowDiagram />
        </Level>

        <Level level={1} tag="The engine" title="What it learns" id="engine">
          <p className="hb-intro">
            <G>No model server. The broker keeps a decaying duration histogram per key and reads its median. Unready or erratic keys fall back to the middle tier.</G>
          </p>
          <PredictorLab />
        </Level>

        <Level level={2} tag="Measured" title="Does it work?" id="results">
          <Bars
            max={100}
            rows={[
              { label: "FIFO", value: 100, kind: "base", text: "baseline" },
              { label: "Mean latency", value: 72, kind: "ours", text: "−28%" },
              { label: "Short-job median", value: 12, kind: "ours", text: "−88%" },
              { label: "vs hand-tuned static map", value: 89, kind: "ours", text: "−11%" },
            ]}
          />
          <p className="hb-fine"><G>Production-flow benchmark, 5 seeds × 7 arms. The tail did not improve: all-message P99 rose 4%.</G></p>
          <Link className="hb-card-link" to="/harbinger/experiments">
            <span>
              <strong>See every experiment</strong>
              What we ran, what failed, and how each result changed the design.
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        </Level>

        <Level tag="Run it" title="Build and run">
          <Install />
          <p className="hb-fine"><G>Start in shadow mode: it records predictions without changing routing. Default routing stays static.</G></p>
        </Level>
      </div>
    </Shell>
  );
}

export default Harbinger;
