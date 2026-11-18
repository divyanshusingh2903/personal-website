import { Icon } from "./GoldenGateBrand";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";

// Written from goldengate/SECURITY.md; keep the two in step when the security model changes.

const crosses = [
  "Titles and goals",
  "Outcomes: tests passed, commit made",
  "File names touched",
  "Command names",
  "Closing message, redacted",
  "Commits and PRs, with status",
];

const neverSent = [
  "Projects you did not pick",
  "Raw transcripts",
  "Tool output",
  "File contents",
  "Command arguments",
  "Paths outside the project",
];

const abilities = ["Manage tokens", "Write work data", "Delete work data", "Read through MCP"];
// Which of the four each token can do, in the order above.
const matrix = [
  ["admin secret", [true, false, false, false]],
  ["upload", [false, true, true, false]],
  ["assistant", [false, false, false, true]],
];

// Off unless you turn it on: each in one line.
const optIn = [
  ["assistant", "Model summarizer", "Off by default. Redacted before and after. A local model stays local."],
  ["token", "OAuth", <>Only with <code>--oauth</code>. You approve each app with your admin secret.</>],
  ["redact", "Prompt injection", "Every answer is marked as data, and every tool only reads."],
];

const risks = [
  ["A compromised server", "leaks its summaries. Keep sensitive projects at titles-only."],
  ["Regex redaction", "can miss a secret."],
  ["The assistant token", "lives in your assistant's settings."],
  ["No OS keyring", "means a private 0600 file, and a warning."],
];

const revoke = [
  ["Unshare and delete", "goldengate share remove ~/code/myproject --delete-from-server"],
  ["New assistant token", "goldengate token rotate assistant"],
  ["Remove an OAuth app", "goldengatebridge oauth clients delete <id>"],
  ["Summarizer off", "goldengate summarizer use heuristic"],
];

function GoldenGateSecurity() {
  return (
    <GoldenGateShell title="Security | Golden Gate">
      <section className="gg-page-head">
        <div className="gg-wrap">
          <h1>Security</h1>
          <p className="gg-lede">Nothing leaves until you pick it.</p>
        </div>
      </section>

      <section className="gg-section" id="promises">
        <div className="gg-wrap">
          <h2>What crosses the bridge</h2>
          <div className="gg-cross-grid">
            <div className="gg-cross gg-cross-yes">
              <h3><Icon name="shared" /> Crosses</h3>
              <ul>{crosses.map((t, i) => <li key={t} style={{ "--k": i }}>{t}</li>)}</ul>
            </div>
            <div className="gg-cross gg-cross-no">
              <h3><Icon name="denied" /> Stays on your machine</h3>
              <ul>{neverSent.map((t, i) => <li key={t} style={{ "--k": i }}><span className="gg-strike">{t}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="tokens">
        <div className="gg-wrap gg-narrow">
          <h2>Three tokens, three jobs</h2>
          <div className="gg-table-wrap">
            <table className="gg-matrix">
              <thead>
                <tr>
                  <td />
                  {matrix.map(([t]) => <th key={t} scope="col">{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {abilities.map((ab, r) => (
                  <tr key={ab}>
                    <th scope="row">{ab}</th>
                    {matrix.map(([t, caps], c) => (
                      <td key={t} className={caps[r] ? "is-yes" : "is-no"} style={{ "--k": r * 3 + c }}>
                        <span aria-hidden="true">{caps[r] ? "●" : "✕"}</span>
                        <span className="gg-sr">{caps[r] ? "Can" : "Cannot"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="gg-more">Stored as hashes, shown once, revocable any time.</p>
        </div>
      </section>

      <section className="gg-section" id="opt-in">
        <div className="gg-wrap">
          <h2>Off unless you turn it on</h2>
          <div className="gg-l-grid">
            {optIn.map(([icon, title, body]) => (
              <div className="gg-l-cell" key={title}>
                <span className="gg-card-icon"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="revoke">
        <div className="gg-wrap gg-split">
          <div>
            <h2>What can still go wrong</h2>
            <ul className="gg-risks">
              {risks.map(([what, why]) => <li key={what}><span aria-hidden="true">{"▲"}</span><p><strong>{what}</strong> {why}</p></li>)}
            </ul>
          </div>
          <div>
            <h2>Take it back</h2>
            <div className="gg-revoke-rows">
              {revoke.map(([what, cmd]) => <div key={cmd}><span>{what}</span><code>{cmd}</code></div>)}
            </div>
          </div>
        </div>
        <div className="gg-wrap">
          <p className="gg-more">
            The full model is in <a href={`${GITHUB_URL}/blob/main/SECURITY.md`} target="_blank" rel="noopener noreferrer">SECURITY.md</a>. Found a problem? <a href={`${GITHUB_URL}/security/advisories/new`} target="_blank" rel="noopener noreferrer">Report it privately</a>.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateSecurity;
