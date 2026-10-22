import { Link } from "react-router-dom";
import { Icon } from "./GoldenGateBrand";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";

// Written from goldengate/SECURITY.md; keep the two in step when the security model changes.

const toc = [
  ["promises", "Promises"],
  ["summarizer", "Model summarizer"],
  ["tokens", "Tokens"],
  ["oauth", "OAuth"],
  ["sources", "Sources"],
  ["injection", "Prompt injection"],
  ["risks", "Risks"],
  ["revoke", "Take it back"],
];

const promises = [
  ["shared", "Default deny", "Nothing moves until you pick it"],
  ["sync", "One door", "Every payload is checked on the way out"],
  ["preview", "Exact previews", "Read it before it goes"],
  ["redact", "Redacted twice", "Before and after summarizing"],
  ["server", "No telemetry", "Only your server, never us"],
];

const modelSteps = [
  { icon: "source", title: "Your messages", where: "Redacted first", body: "Capped, and long sessions cut in the middle." },
  { icon: "assistant", title: "Your model", where: "Off by default", body: "It asks before turning on. A local model stays local.", own: true },
  { icon: "redact", title: "A short summary", where: "Redacted again", body: "Fixed JSON shape, capped, stored as plain text." },
];

const modelNever = ["Tool output", "File contents", "Command arguments", "Projects you did not share"];

const oauthSteps = [
  { icon: "server", title: "A client registers", where: "Anyone can ask", body: "It gets nothing without your consent." },
  { icon: "token", title: "You approve", where: "With your admin secret", body: "The page names the app and where it goes.", own: true },
  { icon: "assistant", title: "It gets a read token", where: "1 hour, then refreshed", body: "A 30-day refresh token rotates. Reuse revokes the lot." },
];

const sourceTiles = [
  ["source", "Coding tools", "Read in place, read-only"],
  ["project", "Chat exports", "Zip checked, never extracted"],
  ["denied", "Chat history", "Shared only by its own rule"],
  ["shared", "Worktrees", "Filed under a selected repository"],
];

const sourceDetails = [
  ["Coding tools", "Claude Code, Codex and OpenCode are read in place, read-only. For OpenCode only four tables of its database are opened, enforced by a test; its credentials and account tables are never touched."],
  ["Chat exports", "claude.ai and ChatGPT zips are untrusted input. An archive is refused if any entry could escape a folder, is a symlink or a duplicate, or looks like a zip bomb. Nothing is extracted to disk, and only the conversation files are read."],
  ["Chat history", "Chats are more personal than code, so chat projects are shared only by an explicit rule, even when the default is to allow."],
  ["Worktrees", "A worktree is filed under its repository only when that repository is selected, so the name of an unselected folder is never sent."],
];

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
  ["admin", [true, false, false, false]],
  ["ingest", [false, true, true, false]],
  ["read", [false, false, false, true]],
];

const tokenFacts = [
  <>The admin secret comes from <code>GOLDENGATE_ADMIN_TOKEN</code>: at least 32 random bytes, compared in constant time, never stored or logged. <code>goldengate init</code> keeps it in memory only.</>,
  <>Minted tokens are 256-bit random values with a prefix (<code>ggb_read_</code>, <code>ggb_ingest_</code>) so secret scanners can spot a leak. Only a SHA-256 hash is stored, and each is shown once.</>,
  "Tokens can expire and be revoked; a revoked token is refused on its next request. Rotation mints a replacement and revokes the old one, optionally after a grace period.",
  "Pairing codes are 60 bits, single use and expire after 10 minutes. Five failed exchanges burn every live code.",
  "Repeated bad tokens lock an address out for a few minutes, with per-address and per-token rate limits on top.",
  <>Golden Gate Bridge refuses to start without credentials, and refuses plain HTTP on a public address unless TLS is configured or <code>--behind-tls-proxy</code> is given. Golden Gate refuses plain <code>http://</code> except on loopback and never follows redirects.</>,
  <><code>/mcp</code> refuses requests from browser origins it does not trust, so a web page cannot reach it through DNS rebinding. Assistants and CLIs send no <code>Origin</code> and are unaffected.</>,
  "The audit log records token id, scope, action, project, time and source address. Never payload content. Retention defaults to 90 days.",
];

const oauth = [
  ["Who can approve", "Only the holder of the admin secret. The consent page names the application and exactly where it will be sent."],
  ["What an assistant gets", "An ordinary read token that lasts an hour, plus a refresh token that rotates and lasts 30 days. It can never write, delete or manage tokens."],
  ["If something is stolen", "Codes are single use. Reusing a code or replaying a used refresh token revokes everything issued from that grant."],
  ["Open registration", <>Anyone who can reach Golden Gate Bridge can register a client, but it gets nothing without your consent. Registration is rate limited and capped, and <code>--oauth-redirect-host</code> narrows where clients may redirect.</>],
  ["The phishing risk", "An attacker can register a client and lure you to its sign-in link. Check the application and redirect host on the consent page, and only approve connections you started yourself."],
];

const serverDoes = [
  "Static tool descriptions",
  "Random markers around stored text",
  "Look-alike markers and control characters stripped",
  "Read-only tools only",
];

const risks = [
  ["A compromised server", "The stored summaries leak. Keep sensitive projects at titles-only."],
  ["The read token", "Sits in your assistant's connector settings."],
  ["Regex redaction", "Can miss a secret. A model summarizer would see it too."],
  ["No OS keyring", "The ingest token is a plain 0600 file, and Golden Gate says so."],
];

const revoke = [
  ["Stop sharing and delete from your server", "goldengate share remove ~/code/myproject --purge-remote"],
  ["Replace the assistant's token", "goldengate token rotate read"],
  ["Cut off an OAuth assistant", "goldengatebridge oauth clients delete <id>"],
  ["Switch the model summarizer off", "goldengate summarizer use heuristic"],
];

function FlowCards({ steps, three = true }) {
  return (
    <ol className={`gg-flow${three ? " gg-flow-3" : ""}`}>
      {steps.map((st, i) => (
        <li key={st.title} className={st.own ? "gg-flow-own" : undefined} style={{ "--i": i }}>
          <div className="gg-flow-head">
            <span className="gg-flow-icon"><Icon name={st.icon} /></span>
            <span className="gg-flow-num">0{i + 1}</span>
          </div>
          <h3>{st.title}</h3>
          <span className="gg-flow-where">{st.where}</span>
          <p>{st.body}</p>
        </li>
      ))}
    </ol>
  );
}

function GoldenGateSecurity() {
  return (
    <GoldenGateShell title="Security | Golden Gate">
      <section className="gg-page-head">
        <div className="gg-wrap">
          <h1>Security</h1>
          <p className="gg-lede">
            Nothing is shared until you pick it. Here is what that means. Golden Gate is pre-release, and the hardening checklist is finished before any public release.
          </p>
          <nav className="gg-toc" aria-label="On this page">
            {toc.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
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
              <ul>{neverSent.map((t, i) => <li key={t} style={{ "--k": i }}>{t}</li>)}</ul>
            </div>
          </div>
          <div className="gg-tiles">
            {promises.map(([icon, title, body]) => (
              <div className="gg-card gg-card-lift" key={title}>
                <span className="gg-card-icon"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="summarizer">
        <div className="gg-wrap">
          <h2>The model summarizer is opt-in</h2>
          <p className="gg-prose">By default, fixed rules on your machine write every summary.</p>
          <FlowCards steps={modelSteps} />
          <ul className="gg-chips gg-chips-no" aria-label="Never sent to the model">
            <li className="gg-chips-label" aria-hidden="true">Never sent to the model</li>
            {modelNever.map((t) => <li key={t}><span aria-hidden="true">{"✕"}</span><code>{t}</code></li>)}
          </ul>
          <details className="gg-details">
            <summary>More about the model summarizer</summary>
            <ul className="gg-points">
              <li><strong>What it receives.</strong> Your messages and the assistant's replies, after the same redaction as everything else, each capped, with long sessions cut in the middle. Only sessions of shared projects.</li>
              <li><strong>Previews stay offline.</strong> A preview never calls the model. It shows a model summary only if one was already made during a sync.</li>
              <li><strong>What comes back.</strong> An answer constrained to a JSON schema, redacted again and capped. It reaches your server only through the same validated path as every payload.</li>
              <li><strong>Keep it local.</strong> With an OpenAI-compatible endpoint on your machine, such as Ollama or LM Studio, nothing leaves it. Otherwise the provider sees the redacted text under its own terms.</li>
              <li><strong>Keys.</strong> Typed hidden and kept in the OS keyring, or read from the provider's environment variable. Never written to the config.</li>
            </ul>
          </details>
        </div>
      </section>

      <section className="gg-section" id="tokens">
        <div className="gg-wrap gg-narrow">
          <h2>Three tokens, three jobs</h2>
          <p className="gg-prose">No token can do another's job. Your assistant's can only read.</p>
          <div className="gg-table-wrap">
            <table className="gg-matrix">
              <thead>
                <tr>
                  <td />
                  {matrix.map(([t]) => <th key={t} scope="col"><code>{t}</code></th>)}
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
          <details className="gg-details">
            <summary>How tokens are protected</summary>
            <ul className="gg-points">
              {tokenFacts.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </details>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="oauth">
        <div className="gg-wrap">
          <h2>OAuth, only if you turn it on</h2>
          <p className="gg-prose">
            For assistants that cannot send a header. Without <code>--oauth</code> none of these endpoints exist.
          </p>
          <FlowCards steps={oauthSteps} />
          <details className="gg-details">
            <summary>How OAuth stays safe</summary>
            <dl className="gg-defs">
              {oauth.map(([term, body]) => <div key={term}><dt>{term}</dt><dd>{body}</dd></div>)}
            </dl>
          </details>
        </div>
      </section>

      <section className="gg-section" id="sources">
        <div className="gg-wrap">
          <h2>Where the data comes from</h2>
          <div className="gg-tiles gg-tiles-4">
            {sourceTiles.map(([icon, title, body]) => (
              <div className="gg-card gg-card-lift" key={title}>
                <span className="gg-card-icon"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <details className="gg-details">
            <summary>How sources are read and checked</summary>
            <dl className="gg-defs">
              {sourceDetails.map(([term, body]) => <div key={term}><dt>{term}</dt><dd>{body}</dd></div>)}
            </dl>
          </details>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="injection">
        <div className="gg-wrap">
          <h2>Prompt injection</h2>
          <p className="gg-prose">
            Session text can contain instructions aimed at an AI. Golden Gate Bridge marks all of it as data.
          </p>
          <div className="gg-split">
            <div className="gg-cross gg-cross-yes">
              <h3><Icon name="shared" /> What it does</h3>
              <ul>{serverDoes.map((t, i) => <li key={t} style={{ "--k": i }}>{t}</li>)}</ul>
            </div>
            <div className="gg-cross gg-cross-no gg-cross-plain">
              <h3><Icon name="denied" /> What it cannot do</h3>
              <ul>
                <li style={{ "--k": 0 }}>Stop a model obeying text it was shown</li>
                <li style={{ "--k": 1 }}>Make a shell or email tool safe</li>
              </ul>
              <p>Approve each action by hand, and keep sensitive projects at <code>titles-only</code>.</p>
            </div>
          </div>
          <p className="gg-more"><Link to="/goldengate/mcp">See how every answer is wrapped</Link></p>
        </div>
      </section>

      <section className="gg-section" id="risks">
        <div className="gg-wrap">
          <h2>What can still go wrong</h2>
          <div className="gg-tiles gg-tiles-4">
            {risks.map(([title, body]) => (
              <div className="gg-card gg-card-lift" key={title}>
                <span className="gg-card-icon gg-card-icon-warn" aria-hidden="true">{"▲"}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="revoke">
        <div className="gg-wrap gg-narrow">
          <h2>Take it back</h2>
          <div className="gg-revoke-rows">
            {revoke.map(([what, cmd]) => <div key={cmd}><span>{what}</span><code>{cmd}</code></div>)}
          </div>
          <p className="gg-more">
            Found a problem? Use <a href={`${GITHUB_URL}/security/advisories/new`} target="_blank" rel="noopener noreferrer">private vulnerability reporting</a>, not a public issue. The full text is <a href={`${GITHUB_URL}/blob/main/SECURITY.md`} target="_blank" rel="noopener noreferrer">SECURITY.md</a>.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateSecurity;
