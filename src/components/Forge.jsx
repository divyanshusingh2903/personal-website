import React from "react";
import { Link } from "react-router-dom";

const GITHUB_URL = "https://github.com/divyanshusingh2903/forge";

const features = [
  {
    number: "01",
    title: "Claude Code, in OpenCode",
    description:
      "Bring the focused, capable Claude Code experience to OpenCode's provider ecosystem and visual workflow.",
  },
  {
    number: "02",
    title: "Work at your pace",
    description:
      "Move between manual control, accepted edits, and full automation as the task calls for it.",
  },
  {
    number: "03",
    title: "Plan before the risk",
    description:
      "When a task grows in scope or consequence, Forge switches to a rigorous plan before writing code.",
  },
];

const Forge = () => {
  return (
    <main id="forge">
      <section className="forge-hero">
        <div className="forge-shell">
          <div className="forge-page-nav">
            <Link className="forge-home-link" to="/">
              <span aria-hidden="true">&lt;-</span> Back to home
            </Link>
            <img className="forge-mark" src="/forge-mark.svg" alt="Forge" />
          </div>
          <div className="forge-hero-layout">
            <div>
              <h1 className="forge-title">Forge your code, not blind trust.</h1>
            </div>
            <div className="forge-hero-copy">
              <p>
                A human-in-the-loop coding agent for developers who want useful
                automation without surrendering the steering wheel.
              </p>
              <p>
                Forge is tuned to make its next move visible, ask before it
                crosses a boundary, and help you move through complex work with
                intent.
              </p>
              <div className="forge-actions">
                <a
                  className="forge-button forge-button-primary"
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View source <span aria-hidden="true">-&gt;</span>
                </a>
                <Link className="forge-button forge-button-secondary" to="/projects">
                  Back to projects
                </Link>
              </div>
            </div>
          </div>
          <div className="forge-demo-placeholder">
            <div className="forge-demo-placeholder-copy">
              <span className="forge-kicker">Workflow preview</span>
              <h2>See Forge at work.</h2>
              <p>GIF demo coming soon.</p>
            </div>
            <span className="forge-demo-placeholder-mark">GIF</span>
          </div>
        </div>
      </section>

      <section className="forge-section forge-principles">
        <div className="forge-shell">
          <div className="forge-section-heading">
            <span className="forge-kicker">The operating principle</span>
            <h2>The Claude Code experience, built into OpenCode.</h2>
            <p>
              Forge pairs the coding workflow developers love in Claude Code
              with the flexibility of OpenCode. Choose how much autonomy a task
              deserves, without losing the ability to steer the work.
            </p>
          </div>
          <div className="forge-feature-grid">
            {features.map((feature) => (
              <article className="forge-feature" key={feature.number}>
                <span className="forge-feature-number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="forge-section forge-install-section">
        <div className="forge-shell forge-install-layout">
          <div className="forge-section-heading">
            <h2>Desktop app or browser.</h2>
            <p>
              Forge is an active personal fork built for a visual workflow. Run
              the desktop app locally or start the web interface in Chrome.
            </p>
          </div>
          <div className="forge-terminal">
            <div className="forge-terminal-bar">
              <span>run locally</span>
              <span>bash</span>
            </div>
            <pre><code>{`git clone git@github.com:divyanshusingh2903/forge.git
cd forge
bun install

## Desktop app
bun run --cwd packages/desktop dev

## Web interface (Chrome)
bun dev web`}</code></pre>
            <p>
              The terminal UI is no longer part of Forge.
            </p>
          </div>
        </div>
      </section>

      <section className="forge-footer">
        <div className="forge-shell forge-footer-layout">
          <div>
            <h2>Forge is where the work stays yours.</h2>
          </div>
          <div className="forge-footer-actions">
            <a href="https://opencode.ai/docs" target="_blank" rel="noopener noreferrer">
              OpenCode documentation -&gt;
            </a>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer">
              View OpenCode upstream -&gt;
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              Explore Forge on GitHub -&gt;
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Forge;
