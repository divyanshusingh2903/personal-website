import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Forge.css";
import "./ForgeDocs.css";
import { Mark, Wordmark } from "./ForgeBrand";

const GITHUB_URL = "https://github.com/divyanshusingh2903/forge";
const RELEASES_URL = `${GITHUB_URL}/releases`;
const OPENCODE_DOCS = "https://opencode.ai/docs";

const nav = [
  { group: null, items: [["intro", "Intro"], ["getting-started", "Getting started"], ["first-session", "Your first session"]] },
  {
    group: "Usage",
    items: [["agents", "Agents"], ["edit-modes", "Edit modes"], ["permissions", "Permissions"], ["plan-review", "Plan review"], ["git", "Git"], ["memory", "Memory"]],
  },
  { group: "Reference", items: [["vs-opencode", "Forge vs OpenCode"], ["troubleshooting", "Troubleshooting"], ["limitations", "Limitations"], ["contributing", "Contributing"]] },
];
const ids = nav.flatMap((g) => g.items.map(([id]) => id));

function External({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function Note({ children }) {
  return (
    <aside className="docs-note">
      <strong>Note</strong>
      <div>{children}</div>
    </aside>
  );
}

function ForgeDocs() {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const prevTitle = document.title;
    const icon = document.querySelector('link[rel="icon"]');
    const prevIcon = icon?.getAttribute("href");
    const prevType = icon?.getAttribute("type");
    document.title = "Forge Docs | Human-in-the-loop coding agent";
    icon?.setAttribute("href", "/forge-favicon.svg");
    icon?.setAttribute("type", "image/svg+xml");
    return () => {
      document.title = prevTitle;
      if (prevIcon) icon.setAttribute("href", prevIcon);
      if (prevType) icon.setAttribute("type", prevType);
    };
  }, []);

  // Highlight the section nearest the top of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <main id="forge" className="docs-page">
      <header className="docs-top">
        <Link className="forge-logo" to="/forge" aria-label="Forge, back to the Forge page"><Mark /><Wordmark /></Link>
        <nav aria-label="Forge navigation">
          <ul>
            <li><Link to="/forge">Home</Link></li>
            <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </nav>
      </header>

      <div className="docs-layout">
        <nav className="docs-sidebar" aria-label="Documentation">
          {nav.map(({ group, items }) => (
            <div className="docs-nav-group" key={group || "top"}>
              {group && <h2>{group}</h2>}
              <ul>
                {items.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} aria-current={active === id ? "true" : undefined} onClick={() => setActive(id)}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <article className="docs-content">
          <section id="intro">
            <h1>Intro</h1>
            <p className="docs-subtitle">Get started with Forge.</p>
            <Note>
              Forge is a fork of OpenCode. These docs cover what Forge does differently. Everything else is documented in <External href={OPENCODE_DOCS}>OpenCode’s docs</External>, though parts that assume the terminal UI or the install script don’t apply here.
            </Note>
            <p>
              <strong>Forge</strong> is an open source AI coding agent that shows its next move before it makes it. It is a desktop app for macOS, Windows and Linux, and a personal project rather than a supported product.
            </p>
            <img className="docs-shot" src="/forge-plan-review.jpg" alt="Forge presenting a finished plan and asking whether to deny, revise, or accept it" loading="lazy" />
            <p className="docs-caption">The plan agent presents its plan for review before any code changes.</p>
          </section>

          <section id="getting-started">
            <h2>Getting started</h2>
            <h3>1. Download</h3>
            <p>Grab an installer from <External href={`${RELEASES_URL}/latest`}>GitHub Releases</External>. The download button on the <Link to="/forge">Forge page</Link> picks the right one for your OS.</p>
            <table>
              <thead><tr><th>OS</th><th>Default build</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>macOS</td><td><code>.dmg</code>, Apple Silicon (arm64)</td><td>A <code>.zip</code> is also published.</td></tr>
                <tr><td>Windows</td><td><code>.exe</code> installer, x64</td><td>Installs per user, one click.</td></tr>
                <tr><td>Linux</td><td><code>.AppImage</code>, x86_64</td><td><code>.deb</code> and <code>.rpm</code> packages are also built.</td></tr>
              </tbody>
            </table>
            <p>Other architectures show up on the Releases page when they are published. Minimum OS versions aren’t documented yet.</p>
            <h3>Which Linux package?</h3>
            <ul className="docs-list">
              <li><strong>AppImage</strong> Works on most distributions. Make it executable and run it, no install needed.</li>
              <li><strong>.deb</strong> For Debian, Ubuntu and derivatives. Install with your package manager.</li>
              <li><strong>.rpm</strong> For Fedora, RHEL, openSUSE and derivatives.</li>
            </ul>
            <h3>2. First launch</h3>
            <p>The installers aren’t code-signed yet, so your OS may block the first launch.</p>
            <ul className="docs-list">
              <li><strong>macOS</strong> Open System Settings → Privacy &amp; Security and click <code>Open Anyway</code>, or run <code>xattr -dr com.apple.quarantine /Applications/Forge.app</code>.</li>
              <li><strong>Windows</strong> When SmartScreen appears, click <code>More info</code> → <code>Run anyway</code>.</li>
              <li><strong>Linux</strong> Make the AppImage executable, then run it.</li>
            </ul>
            <h3>3. Connect a provider</h3>
            <p>Forge needs a model provider before it can do anything. It supports the same providers as OpenCode.</p>
            <ol className="docs-steps">
              <li>Open Settings and go to <code>Providers</code>, or run the <code>Connect provider</code> command.</li>
              <li>Pick a provider from the list, or add a custom one.</li>
              <li>Choose a login method if the provider offers several: <code>API key</code>, <code>Browser</code> or <code>Headless</code>.</li>
              <li>Paste your API key, or follow the link and enter the authorization code you receive.</li>
              <li>Pick one of the provider’s models from the model picker next to the prompt.</li>
            </ol>
            <p>Provider and model options are the same as OpenCode’s, so its <External href={`${OPENCODE_DOCS}/providers/`}>providers</External> and <External href={`${OPENCODE_DOCS}/models/`}>models</External> pages apply. Ignore any steps that mention the terminal UI.</p>
            <h3>Updating</h3>
            <p>Forge can check for updates from its app menu. Because the installers aren’t signed, macOS opens the release page instead of installing in place: download the new <code>.dmg</code> and replace the app. You can always get the latest version from <External href={`${RELEASES_URL}/latest`}>Releases</External>, and the full history is on the same page.</p>
          </section>

          <section id="first-session">
            <h2>Your first session</h2>
            <p>This walks through the loop Forge is built around: ask, review, approve.</p>
            <ol className="docs-steps">
              <li>Open a project folder. Forge starts in <code>Manual</code> mode with the <code>build</code> agent, so nothing changes without your say-so.</li>
              <li>Ask for something small, such as “add a unit test for the date helper”.</li>
              <li>Watch the agent explain its next step. Running tool calls show a live timer.</li>
              <li>When it wants to edit a file or run a command, a permission prompt appears. Press <code>1</code>, <code>2</code> or <code>3</code> to answer, or click.</li>
              <li>For bigger work, switch to <code>Plan</code> mode first. Review the plan in the side panel, then accept, revise or deny it.</li>
              <li>Review the resulting changes in the review panel, then stage and commit from there.</li>
            </ol>
            <Note>
              Once you trust the agent for a task, move to <code>Accept Edits</code> or <code>Auto</code> to ask less often. Your <code>deny</code> rules still apply.
            </Note>
          </section>

          <section id="agents">
            <h2>Agents</h2>
            <p>Forge has two primary agents. Switch between them with <code>Tab</code>, and <code>Shift+Tab</code> to cycle back.</p>
            <ul className="docs-list">
              <li><strong>build</strong> The default agent for development work. It asks before every file edit and bash command, and offers to switch to plan mode when a request needs design work first.</li>
              <li><strong>plan</strong> Researches and designs without touching your code. File edits are denied except for its plan file, and bash still asks first.</li>
            </ul>
            <p>Two subagents handle delegated work. Invoke them with <code>@</code> in a message, or let the primary agents call them.</p>
            <ul className="docs-list">
              <li><strong>general</strong> Researches complex questions and runs multistep tasks, including several units of work in parallel.</li>
              <li><strong>explore</strong> A fast, read-only agent for finding files and answering questions about the codebase.</li>
            </ul>
            <p>You can define your own agents and tune these ones. See OpenCode’s <External href={`${OPENCODE_DOCS}/agents/`}>agents</External> page, keeping in mind that Forge’s built-in <code>build</code> and <code>plan</code> defaults are stricter than upstream’s.</p>
          </section>

          <section id="edit-modes">
            <h2>Edit modes</h2>
            <p>The mode picker next to the prompt sets how much the agent can do without asking.</p>
            <table>
              <thead><tr><th>Mode</th><th>Behavior</th></tr></thead>
              <tbody>
                <tr><td><code>Manual</code></td><td>The default. Every edit and command waits for your approval.</td></tr>
                <tr><td><code>Accept Edits</code></td><td>File edits are approved automatically. Commands and other permission requests still ask.</td></tr>
                <tr><td><code>Auto</code></td><td>Every permission request is approved. Toggle with <code>Cmd/Ctrl+Shift+A</code>.</td></tr>
                <tr><td><code>Plan</code></td><td>Switches to the plan agent. Picking any other mode switches back to build.</td></tr>
              </tbody>
            </table>
            <p>A mode applies to the current session, or to the project when you set it before starting a session. Approving a plan with <code>Accept (Auto)</code> switches the session to <code>Auto</code>. Anything your config sets to <code>deny</code> stays denied in every mode.</p>
          </section>

          <section id="permissions">
            <h2>Permissions</h2>
            <p>Out of the box, agents ask before:</p>
            <ul className="docs-list">
              <li>editing files and running bash commands</li>
              <li>touching directories outside the project</li>
              <li>reading <code>.env</code> files (<code>.env.example</code> is allowed)</li>
            </ul>
            <p>Override any of these with <code>permission</code> in your config. For example, to let the agent read every <code>.env</code> file without asking:</p>
            <pre><code>{`{
  "permission": {
    "read": { "*.env": "allow", "*.env.*": "allow" }
  }
}`}</code></pre>
            <p>Each rule is <code>allow</code>, <code>ask</code> or <code>deny</code>. Forge reads <code>opencode.json</code> or <code>opencode.jsonc</code>, in the project or in your global config folder. See OpenCode’s <External href={`${OPENCODE_DOCS}/permissions/`}>permissions</External> and <External href={`${OPENCODE_DOCS}/config/`}>config</External> pages for the full syntax. Forge’s defaults above are stricter than upstream’s.</p>
          </section>

          <section id="plan-review">
            <h2>Plan review</h2>
            <p>The plan agent writes its plan to a Markdown file and shows it in a side panel. When the plan is ready, you choose what happens next:</p>
            <ul className="docs-list">
              <li><strong>Accept</strong> Hand off to build, approving each edit yourself or letting it run in <code>Auto</code>.</li>
              <li><strong>Revise</strong> Send the plan back with feedback.</li>
              <li><strong>Deny</strong> Stop without changing any code.</li>
            </ul>
            <p>If a request needs design work first, the build agent offers to switch into plan mode instead of diving in.</p>
            <h3>Plan files</h3>
            <p>Plans are ordinary files, so they persist after the session ends. In a Git project they live in <code>.opencode/plans/</code> inside the repo, named with a timestamp and the session slug. Outside Git they go in Forge’s data folder under <code>plans/</code>. Each planning stretch in a session gets its own file, and the plan agent is allowed to edit only these files. You can open and edit them like any Markdown, and Forge excludes them from the review panel’s Git changes. Add <code>.opencode/plans/</code> to <code>.gitignore</code> if you don’t want to commit them.</p>
          </section>

          <section id="git">
            <h2>Git</h2>
            <p>The review panel includes Git controls, so you can stay in the app:</p>
            <ul className="docs-list">
              <li>See live branch and status.</li>
              <li>Stage and commit changes, with a commit message written by your active model.</li>
              <li>Stash, pull and push. After committing on a new branch, Forge offers to push it with its upstream.</li>
            </ul>
          </section>

          <section id="memory">
            <h2>Memory</h2>
            <p>Forge can keep local notes about a project across sessions. It stores a short <code>MEMORY.md</code> index plus optional topic notes, loads the index into new sessions, and proposes updates when it learns something worth keeping. Memory is on by default.</p>
            <h3>Memory vs AGENTS.md</h3>
            <p><code>AGENTS.md</code> is shared with your team and committed to the repo. Memory is personal and local, so it can’t be committed by accident. Use memory for your preferences, corrections, and decisions that aren’t obvious from the code. Facts your whole team needs belong in <code>AGENTS.md</code>.</p>
            <h3>Where it lives</h3>
            <p>Each project gets a folder in the data directory, named after the project path plus a short hash. On Linux that is <code>~/.local/share/opencode/memory/&lt;slug&gt;-&lt;hash&gt;/</code>. Inside are <code>MEMORY.md</code> and topic notes, all plain Markdown you can edit or delete.</p>
            <h3>Which folders share memory</h3>
            <ul className="docs-list">
              <li>Subdirectories of a repo share that repo’s memory.</li>
              <li>Linked worktrees share memory with the main checkout.</li>
              <li>Independent clones of the same repo each get their own memory.</li>
              <li>Outside Git, memory is keyed by the folder you opened.</li>
            </ul>
            <Note>
              Moving or renaming a repo changes its key, so Forge starts with empty memory at the new path. The old folder stays under <code>memory/</code>; copy its contents over to keep it.
            </Note>
            <h3>How it works</h3>
            <p>The agent decides what to save, and every write to the memory folder still asks for approval. It only saves things you said or confirmed, and avoids secrets and temporary task state. The index is loaded at the start of a session and after compaction, up to 100 lines or 12,800 bytes.</p>
            <p>Primary agents can edit memory with approval. The plan agent can too, so corrections made while planning aren’t lost. Subagents can read memory but can’t write it, so parallel work never races on <code>MEMORY.md</code>.</p>
            <p>To turn memory off, set <code>memory</code> to <code>false</code> in your config. Existing notes are kept.</p>
          </section>

          <section id="vs-opencode">
            <h2>Forge vs OpenCode</h2>
            <p>Forge shares OpenCode’s engine, so most of its docs still apply. Where they do, the notes below say what to watch for.</p>
            <table>
              <thead><tr><th>Area</th><th>In Forge</th></tr></thead>
              <tbody>
                <tr><td>Providers and models</td><td>Same as OpenCode: <External href={`${OPENCODE_DOCS}/providers/`}>providers</External>, <External href={`${OPENCODE_DOCS}/models/`}>models</External>.</td></tr>
                <tr><td>Config</td><td>Same files and keys: <External href={`${OPENCODE_DOCS}/config/`}>config</External>. Memory is on by default.</td></tr>
                <tr><td>Permissions</td><td>Same rule syntax: <External href={`${OPENCODE_DOCS}/permissions/`}>permissions</External>. Forge’s defaults ask more, as described above.</td></tr>
                <tr><td>Agents</td><td><External href={`${OPENCODE_DOCS}/agents/`}>agents</External> applies for custom agents. The built-in build and plan agents behave differently.</td></tr>
                <tr><td>MCP servers</td><td>Same as OpenCode: <External href={`${OPENCODE_DOCS}/mcp-servers/`}>MCP servers</External>. Forge adds a dialog for configuring them.</td></tr>
                <tr><td>Skills, rules, plugins</td><td>Same as OpenCode: <External href={`${OPENCODE_DOCS}/skills/`}>skills</External>, <External href={`${OPENCODE_DOCS}/rules/`}>rules</External>, <External href={`${OPENCODE_DOCS}/plugins/`}>plugins</External>.</td></tr>
                <tr><td>Edit modes, plan review, Git, memory</td><td>Forge-specific. Documented on this page.</td></tr>
                <tr><td>Install and interface</td><td>Desktop installers only. OpenCode’s install script, terminal UI and CLI pages don’t apply.</td></tr>
              </tbody>
            </table>
          </section>

          <section id="troubleshooting">
            <h2>Troubleshooting</h2>
            <h3>The app won’t open</h3>
            <p>On macOS and Windows this is usually the unsigned-installer warning. See <a href="#getting-started">first launch</a>. On Linux, check that the AppImage is executable.</p>
            <h3>Forge opens but can’t answer</h3>
            <p>Check that a provider is connected in Settings → Providers and that a model is selected. If the server fails to start, quit Forge fully and reopen it.</p>
            <h3>Where the logs are</h3>
            <p>Forge writes logs to a <code>logs</code> folder inside its user data directory, with a new timestamped folder for each run (<code>main.log</code>, <code>renderer.log</code>). Logs older than seven days are cleaned up automatically. Attach recent ones when you report a bug.</p>
            <h3>Reporting a bug</h3>
            <p>Open an issue using the <External href={`${GITHUB_URL}/issues/new?template=bug-report.yml`}>bug report template</External>, or browse the <External href={`${GITHUB_URL}/issues`}>issue tracker</External>. Keep it short and specific.</p>
          </section>

          <section id="limitations">
            <h2>Limitations</h2>
            <ul className="docs-list">
              <li>Forge is a personal project, not a supported product.</li>
              <li>The installers are unsigned, so expect a first-launch warning.</li>
              <li>There is no terminal UI and no install script. Use the desktop app.</li>
              <li>Memory has no management UI or <code>/memory</code> command, is per project, and doesn’t sync across machines.</li>
              <li>Releases are published manually, so the <External href={RELEASES_URL}>releases page</External> is the changelog.</li>
            </ul>
          </section>

          <section id="contributing">
            <h2>Contributing</h2>
            <p>Forge is a personal project, but contributions are welcome. Start with an issue before opening a pull request. <External href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</External> covers setup per platform, running the desktop app from source, and what pull requests should include. <External href={`${GITHUB_URL}/blob/main/CONTEXT.md`}>CONTEXT.md</External> describes the session runtime’s vocabulary if you’re working on the core.</p>
            <p>Questions or bugs go to the <External href={`${GITHUB_URL}/issues`}>issue tracker</External>.</p>
          </section>
        </article>
      </div>

      <div className="forge-legal">
        <span>©{new Date().getFullYear()} Divyanshu Singh</span>
        <span><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">MIT License</a></span>
      </div>
    </main>
  );
}

export default ForgeDocs;
