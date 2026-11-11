import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Forge.css";
import "./ForgeDocs.css";
import { Mark, Wordmark } from "./ForgeBrand";
import { OPENCODE_VERSION, FORGE_VERSION, FORGE_RELEASE_TAG, FORGE_RELEASE_URL } from "./ForgeRelease";

const GITHUB_URL = "https://github.com/divyanshusingh2903/forge";
const RELEASES_URL = `${GITHUB_URL}/releases`;
const OPENCODE_DOCS = "https://opencode.ai/docs";

const nav = [
  { group: null, items: [["intro", "Intro"], ["whats-new", "What’s new"], ["getting-started", "Getting started"], ["first-session", "Your first session"]] },
  {
    group: "Usage",
    items: [["agents", "Agents"], ["edit-modes", "Edit modes"], ["permissions", "Permissions"], ["plan-review", "Plan review"], ["browser", "Browser"], ["context", "Context and compaction"], ["chapters", "Chapters"], ["workspace-tools", "Terminals and worktrees"], ["mcp", "MCP connections"], ["git", "Git"], ["pull-requests", "Pull requests"], ["memory", "Memory"]],
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
  const { hash } = useLocation();

  // React Router links change the route without the browser's native anchor scroll.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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
              <strong>Forge</strong> is an open source AI coding agent with a review-first workflow and approval prompts for edits and shell commands by default. It is a desktop app for macOS, Windows and Linux, and a personal project rather than a supported product.
            </p>
            <img className="docs-shot" src="/forge-plan-review.jpg" alt="Forge presenting a finished plan and asking whether to deny, revise, or accept it" loading="lazy" />
            <p className="docs-caption">Plan review in an earlier Forge interface; current controls may differ.</p>
          </section>

          <section id="whats-new">
            <h2>What’s new</h2>
            <p>These docs cover <strong>OpenCode {OPENCODE_VERSION} · Forge {FORGE_VERSION}</strong>. The tag <External href={FORGE_RELEASE_URL}>{FORGE_RELEASE_TAG}</External> combines the upstream engine version and Forge’s own version. Downloads follow the latest published release.</p>
            <h3>New in Forge 0.8.0</h3>
            <ul className="docs-list">
              <li><a href="#chapters">Chapters</a>: pin messages as titled chapters and jump between them from a notch rail. Forge also starts one after a compaction or a newly linked issue or pull request.</li>
              <li><a href="#pull-requests">Pull requests</a>: sessions keep track of the pull and merge requests they open, with state, CI and opt-in auto-fix.</li>
              <li><a href="#reference-popovers">Reference popovers</a>: issue and pull request links show sub-issue progress and CI results, and the popover stays open while you use it.</li>
              <li><a href="#permissions">Diffs before approval</a>: proposed file changes show in the chat while an edit is waiting for your approval.</li>
            </ul>
            <h3>Also in this release</h3>
            <p>The V2 foundation brings richer context inspection, persistent session terminals, worktree shortcuts, guided Claude Agent setup and percentage-based compaction buffers. Forge keeps its edit modes, plan review and local memory alongside the built-in browser and desktop Git workflow. These are capabilities available here, not a claim that each was introduced in 2.2.5 or is exclusive to Forge.</p>
            <ul className="docs-list">
              <li><a href="#browser">Browser</a>: shared Chromium tabs, element comments, screenshots and debugging.</li>
              <li><a href="#context">Context and compaction</a>: inspect what fills the window and reserve headroom.</li>
              <li><a href="#workspace-tools">Terminals and worktrees</a>: persistent terminals and faster workspace navigation.</li>
              <li><a href="#mcp">MCP connections</a>: optional integrations, with recovery for stale sign-ins from the session popover.</li>
            </ul>
            <p>See <External href={RELEASES_URL}>Forge Releases</External> for Forge changes and the <External href={`${GITHUB_URL}/blob/main/CHANGELOG.md`}>OpenCode V2 changelog</External> for inherited engine and desktop changes.</p>
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
            <p>This release also publishes macOS x64, Windows arm64 and Linux arm64 builds on Releases. The download button selects an OS default, not your CPU architecture; choose an alternate build there when needed. Minimum OS versions aren’t documented yet.</p>
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
            <p>For <code>Claude Agent</code>, the provider picker guides you through installing Claude Code, signing in with <code>claude auth login</code>, and checking the connection. You supply your own account and authorization; Forge does not include credentials.</p>
            <h3>Updating</h3>
            <p>Forge can check for updates from its app menu. Because the installers aren’t signed, macOS opens the release page instead of installing in place: download the new <code>.dmg</code> and replace the app. You can always get the latest version from <External href={`${RELEASES_URL}/latest`}>Releases</External>, and the full history is on the same page.</p>
          </section>

          <section id="first-session">
            <h2>Your first session</h2>
            <p>This walks through the loop Forge is built around: ask, review, approve.</p>
            <ol className="docs-steps">
              <li>Open a project folder. Unless settings override it, Forge starts in <code>Manual</code> mode with the <code>build</code> agent. Edits and shell commands ask by default; configured permission rules still apply.</li>
              <li>Ask for something small, such as “add a unit test for the date helper”.</li>
              <li>Watch the agent explain its next step. Running tool calls show a live timer.</li>
              <li>When it wants to edit a file or run a command, a permission prompt appears. For edits, the proposed diff shows in the chat first. Press <code>1</code>, <code>2</code> or <code>3</code> to answer, or click.</li>
              <li>For bigger work, switch to <code>Plan</code> mode first. Review the plan in the side panel, then accept, revise or deny it.</li>
              <li>Review the resulting changes in the review panel, then stage and commit from there.</li>
            </ol>
            <Note>
              Once you trust the agent for a task, move to <code>Accept Edits</code> or <code>Auto</code> to ask less often. Your <code>deny</code> rules still apply.
            </Note>
          </section>

          <section id="agents">
            <h2>Agents</h2>
            <p>Forge has two built-in primary agents. Use the mode picker beside the composer, or <code>Cmd/Ctrl+.</code> to cycle forward and <code>Cmd/Ctrl+Shift+.</code> to cycle back. The picker includes Manual, Accept edits, Auto, Plan and custom primary agents.</p>
            <ul className="docs-list">
              <li><strong>build</strong> The default agent for development work. Manual asks before edits and shell commands unless configured rules allow them. It offers plan mode when work needs design first.</li>
              <li><strong>plan</strong> Researches and designs without editing your application files. Edits are restricted to plan files; shell commands follow permission rules.</li>
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
                <tr><td><code>Manual</code></td><td>The default. Edits and shell commands ask unless configured permission rules say otherwise.</td></tr>
                <tr><td><code>Accept edits</code></td><td>Edit requests that would ask are approved automatically. Shell commands and other requests follow their permission rules.</td></tr>
                <tr><td><code>Auto</code></td><td>Requests that would ask are approved automatically; deny rules remain denied. Toggle with <code>Cmd/Ctrl+Shift+A</code>.</td></tr>
                <tr><td><code>Plan</code></td><td>Switches to the plan agent. Picking any other mode switches back to build.</td></tr>
              </tbody>
            </table>
            <p>The picker controls the current session or new-session draft, not the project default. Set <code>Start new sessions in Auto mode</code> in Settings → Preferences, with an override in project settings. Anything your config sets to <code>deny</code> stays denied in every mode.</p>
            <Note><code>Accept (Auto)</code> in plan review selects <strong>Accept edits</strong>, not full Auto. Shell commands and other requests still follow their permission rules.</Note>
          </section>

          <section id="permissions">
            <h2>Permissions</h2>
            <p>Out of the box, agents ask before:</p>
            <ul className="docs-list">
              <li>editing files and running shell commands, unless configured rules override the default</li>
              <li>reading <code>.env</code> and <code>.env.*</code> files (<code>.env.example</code> is allowed)</li>
            </ul>
            <p>While an edit waits for approval, its file card in the chat already shows the proposed diff, so you can read the change before you answer.</p>
            <p>Reading outside the workspace does not universally ask. Add explicit external-directory rules if you need that boundary. V2 uses a <code>permissions</code> array. This example intentionally allows sensitive environment-file reads without asking; only use it if that is what you want:</p>
            <pre><code>{`{
  "permissions": [
    { "action": "read", "resource": "*.env", "effect": "allow" },
    { "action": "read", "resource": "*.env.*", "effect": "allow" }
  ]
}`}</code></pre>
            <p>Each rule names an <code>action</code>, a <code>resource</code> pattern and an <code>effect</code>: <code>allow</code>, <code>ask</code> or <code>deny</code>. Legacy singular <code>permission</code> configuration is migrated. Forge reads <code>opencode.json</code> or <code>opencode.jsonc</code> in the project or global config folder. See OpenCode’s <External href={`${OPENCODE_DOCS}/permissions/`}>permissions</External> and <External href={`${OPENCODE_DOCS}/config/`}>config</External> references, checking examples against the V2 baseline.</p>
          </section>

          <section id="plan-review">
            <h2>Plan review</h2>
            <p>The plan agent writes its plan to a Markdown file and shows it in a side panel. When the plan is ready, you choose what happens next:</p>
            <ul className="docs-list">
              <li><strong>Accept (Manual)</strong> Return to Build with normal approval prompts.</li>
              <li><strong>Accept (Auto)</strong> Return to Build with file edits accepted automatically, not full Auto. Shell commands and other requests follow permission rules.</li>
              <li><strong>Revise</strong> Send the plan back with feedback.</li>
              <li><strong>Deny</strong> Stop without changing any code.</li>
            </ul>
            <p>The Plan tab opens when the agent presents its plan. Use <code>Review plan</code> to reopen it, or quote passages with comments to request targeted revisions. If a request needs design first, Build offers to switch into Plan.</p>
            <h3>Plan files</h3>
            <p>Plans persist as <code>.opencode/plans/&lt;timestamp&gt;-&lt;generated-slug&gt;.md</code> inside the session’s working directory, including outside Git. Each planning cycle gets a new file. Plan is restricted to plan files. You can edit them like any Markdown; Forge filters them out of Review’s Git changes. Add <code>.opencode/plans/</code> to <code>.gitignore</code> if you don’t want to commit them.</p>
          </section>

          <section id="browser">
            <h2>Browser</h2>
            <p>Forge’s built-in Chromium browser shares the same tabs between you and the agent. Run <code>Open browser</code>, or choose <code>Browser</code> in the side-panel launcher. The default shortcut is <code>Ctrl+Cmd+B</code> on macOS or <code>Ctrl+Alt+B</code> on Windows/Linux.</p>
            <ol className="docs-steps">
              <li>Start your app’s development server and open its URL in the browser pane.</li>
              <li>Ask: “Open my local app, check the sign-in form, and report browser errors.” The agent can inspect pages, interact with forms and capture screenshots.</li>
              <li>Use the element picker with <code>Cmd/Ctrl+Shift+C</code> to select an element and attach an optional comment to the composer.</li>
            </ol>
            <p>Inside the pane, <code>Cmd/Ctrl+L</code> focuses the address, <code>Cmd/Ctrl+T</code> opens a tab and <code>F5</code> reloads. Tools also cover console logs, network requests, performance traces, CPU profiles and memory snapshots. Lighthouse checks accessibility, SEO and best practices—not device emulation or a performance benchmark.</p>
            <h3>Permissions and boundaries</h3>
            <ul className="docs-list">
              <li>A compatible Forge desktop browser must be attached to the session. Browser tools are not a standalone headless service.</li>
              <li>Inspection is allowed after attachment. Navigation, clicks, typing, evaluation and other actions ask unless permissions or the selected mode allow them.</li>
              <li>Pages use the connected server’s network: <code>localhost</code> means the server machine, not necessarily your laptop.</li>
              <li>Agent navigation accepts HTTP, HTTPS and <code>about:blank</code>, not credential-bearing URLs or arbitrary <code>file://</code> paths. Ask it to preview local files instead.</li>
              <li>Chromium is sandboxed, with Node integration disabled and context isolation/web security enabled. Camera, microphone, geolocation, notifications and device/screen-capture permission requests are blocked.</li>
              <li>Screenshots require a focused tab and visible desktop window. Uploads and file drops are limited to 5 MiB total per operation.</li>
            </ul>
          </section>

          <section id="context">
            <h2>Context and compaction</h2>
            <p>Click context usage in the session header to open <code>Context</code>. Inspect estimated contributions from messages, system instructions, tools, MCP, skills, references and memory, alongside cost and compaction headroom. Estimates explain usage; they are not exact provider billing totals.</p>
            <p>The panel also exposes system-prompt/raw-message views and session export. Run <code>/compact</code> to summarize the conversation manually. To reserve a share of each model’s context window, configure:</p>
            <pre><code>{`{
  "compaction": { "buffer": "20%" }
}`}</code></pre>
            <p>Numeric token-count buffers still work. When commenting on quoted content, <code>Cmd/Ctrl+Enter</code> sends just the quote and comment, leaving your existing composer draft untouched.</p>
          </section>

          <section id="chapters">
            <h2>Chapters</h2>
            <p>Long sessions often cover several tasks. Chapters are titled markers on the transcript that take you back to each one without scrolling.</p>
            <h3>Pinning a message</h3>
            <p>Every user message, and the final reply of each turn, has a pin button next to copy. Pinning starts a chapter at that message, titled from its first line. Click the pin again to remove the chapter.</p>
            <h3>The notch rail</h3>
            <p>Each chapter appears as a small notch at the top left of the transcript, under the session name. The notch for the part of the session you are reading is bolder. Hover over the rail to list the chapters, then click one to jump to it, even if it is far back in history. Rename or remove a chapter from the same list.</p>
            <img className="docs-shot" src="/forge-chapters.webp" width="1159" height="730" alt="The chapters list open over a session: two pinned messages, two issue and pull request chapters and one after a compaction" loading="lazy" />
            <p className="docs-caption">The chapters list. Icons show what started each one: a pin, a linked issue or pull request, or a compaction.</p>
            <h3>Automatic chapters</h3>
            <p>Forge also starts a chapter by itself, without the agent spending any effort on it:</p>
            <ul className="docs-list">
              <li><strong>After a compaction</strong> Titled from your next message, or <code>After compaction</code> when the agent continues on its own.</li>
              <li><strong>A new issue or pull request</strong> When your message links a GitHub or GitLab issue, pull request or merge request the session has not seen, titled with its number and title. Linking it again starts nothing.</li>
            </ul>
            <p>Automatic chapters start at the agent’s reply, never at your message. Reverting a session removes the chapters past the revert point. Chapters belong to their session: forks and subagent sessions start without any.</p>
          </section>

          <section id="workspace-tools">
            <h2>Terminals and worktrees</h2>
            <p>Desktop terminals belong to the session. Their names and scrollback survive server restarts and stay synchronized across windows, so you can return to the same workspace.</p>
            <p>Use <code>Cmd/Ctrl+Alt+O</code> to choose a worktree. Select <code>Choose base branch</code> in the command palette when creating one. Toggle composer shell mode with <code>Cmd/Ctrl+Shift+X</code>. Shell mode runs commands rather than sending them as model prompts.</p>
          </section>

          <section id="mcp">
            <h2>MCP connections</h2>
            <p>Manage integrations in <code>Settings → MCPs</code>, separately from model providers. Optional built-in connections for GitHub, GitLab, Linear, Notion, Sentry and Jira start disabled. Enable the ones you need and complete their setup; authentication differs by server. GitHub supports token or pre-registered OAuth setup.</p>
            <ol className="docs-steps">
              <li>Open MCPs, enable a connection and supply the required configuration or sign-in.</li>
              <li>Check its status in the session MCP popover.</li>
              <li>If a connection fails or needs sign-in, use the gear beside that server to reconnect or reconfigure it. The failed-server dialog offers <code>Retry</code>.</li>
            </ol>
            <p>Forge 0.7.4 adds this session-popover recovery path for stale sign-ins. Custom servers remain supported through OpenCode V2’s MCP configuration.</p>
          </section>

          <section id="git">
            <h2>Git</h2>
            <p>The review panel includes Git controls, so you can stay in the app:</p>
            <ul className="docs-list">
              <li>See live branch/status and review uncommitted, branch or session changes.</li>
              <li>Stage files or folders and commit with a message generated by your active model.</li>
              <li>Fetch, pull with merge or rebase, push and set upstream on a new branch.</li>
              <li>Manage stashes. Destructive discard and stash-drop actions ask for confirmation.</li>
            </ul>
          </section>

          <section id="pull-requests">
            <h2>Pull requests</h2>
            <p>Forge remembers the GitHub pull requests and GitLab merge requests a session works on, so they don’t get lost once the link scrolls away.</p>
            <h3>What gets tracked</h3>
            <p>A request is tracked when the agent creates it, through a connected GitHub or GitLab integration or with <code>gh pr create</code> or <code>glab mr create</code>, or when you ask the agent to track one. A link that is only mentioned is not tracked. The list survives restarts.</p>
            <h3>The Pull requests tab</h3>
            <p>Once a session tracks something, a header icon opens the <code>Pull requests</code> tab; the icon shows a dot while CI is failing on an open request. Each row expands into the full reference card, with refresh, copy link and stop tracking. Merged and closed requests fold into their own group and are no longer checked.</p>
            <img className="docs-shot docs-shot-narrow" src="/forge-pull-requests.webp" width="745" height="780" alt="The Pull requests tab with a merged pull request expanded to show its branch, size, changed files and that all 27 checks passed" loading="lazy" />
            <p className="docs-caption">The Pull requests tab, with a merged request expanded.</p>
            <p>If a status lookup fails, Forge keeps the last good status and says why: not signed in, rate-limited or a temporary error. It never shows stale results as passing.</p>
            <h3>Auto-fix CI</h3>
            <p>Auto-fix is off by default and set per request. When it is on and CI finishes failing, Forge queues one fix prompt for that commit, at most three attempts, delivered when the agent is idle so it doesn’t interrupt other work. If a fix run is interrupted or fails, auto-fix pauses until you resume it; a green run resets it.</p>
            <Note>Tracking never merges, closes, reruns CI or pushes on its own. Fixes go through the agent with your usual edit modes and permissions.</Note>
            <h3 id="reference-popovers">Reference popovers</h3>
            <p>Hover over an issue or pull request link in the chat to see its card. Issues with sub-issues show how many are complete, not planned or open. Pull requests show their checks on GitHub, or tests and jobs on GitLab, with links to failing ones. The popover stays open while your pointer is over it, so you can click links, select text or refresh it.</p>
            <img className="docs-shot docs-shot-narrow" src="/forge-reference-popover.webp" width="556" height="234" alt="A reference popover for a GitHub issue showing its title, labels and 3 of 4 sub-issues complete" loading="lazy" />
            <p className="docs-caption">An issue popover with sub-issue progress.</p>
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
            <p>Memory guidance asks the agent to save only things you said or confirmed, avoiding secrets and temporary task state. Writes follow ordinary edit permissions: Manual normally asks; Accept edits and Auto can approve automatically. The index is loaded at session start and after compaction, up to 100 lines or 12,800 bytes.</p>
            <p>Build can maintain memory notes. Plan remains restricted to plan files, not memory. Subagents receive read-only memory guidance and cannot edit the notes.</p>
            <p>To turn memory off, set <code>memory</code> to <code>false</code> in your config. Existing notes are kept.</p>
          </section>

          <section id="vs-opencode">
            <h2>Forge vs OpenCode</h2>
            <p>Forge shares OpenCode’s engine, so most of its docs still apply. Where they do, the notes below say what to watch for.</p>
            <table>
              <thead><tr><th>Area</th><th>In Forge</th></tr></thead>
              <tbody>
                <tr><td>Providers and models</td><td>Same as OpenCode: <External href={`${OPENCODE_DOCS}/providers/`}>providers</External>, <External href={`${OPENCODE_DOCS}/models/`}>models</External>.</td></tr>
                <tr><td>Config</td><td>OpenCode V2 config files and schema; check older examples against this baseline. Memory is on by default.</td></tr>
                <tr><td>Permissions</td><td>V2 action/resource/effect rules. Forge asks for shell/edit by default; mode overrides do not bypass denies.</td></tr>
                <tr><td>Agents</td><td><External href={`${OPENCODE_DOCS}/agents/`}>agents</External> applies for custom agents. The built-in build and plan agents behave differently.</td></tr>
                <tr><td>MCP servers</td><td>OpenCode V2 custom servers plus optional built-in connections and <a href="#mcp">setup/recovery UI</a>.</td></tr>
                <tr><td>Skills, rules, plugins</td><td>Same as OpenCode: <External href={`${OPENCODE_DOCS}/skills/`}>skills</External>, <External href={`${OPENCODE_DOCS}/rules/`}>rules</External>, <External href={`${OPENCODE_DOCS}/plugins/`}>plugins</External>.</td></tr>
                <tr><td>Workflow</td><td>Forge modes, plan review and local memory are documented here, alongside browser, Git and inherited desktop capabilities.</td></tr>
                <tr><td>Install and interface</td><td>These docs cover Forge’s desktop installers. Upstream terminal UI and install-script instructions are not desktop setup instructions.</td></tr>
              </tbody>
            </table>
          </section>

          <section id="troubleshooting">
            <h2>Troubleshooting</h2>
            <h3>The app won’t open</h3>
            <p>On macOS and Windows this is usually the unsigned-installer warning. See <a href="#getting-started">first launch</a>. On Linux, check that the AppImage is executable.</p>
            <h3>Forge opens but can’t answer</h3>
            <p>Check that a provider is connected in Settings → Providers and that a model is selected. If the server fails to start, quit Forge fully and reopen it.</p>
            <h3>The browser is disconnected or can’t reach localhost</h3>
            <p>Open the session in the Forge desktop app and attach its browser pane. With a remote server, start the app on that server or use an address reachable from it; localhost is not automatically your laptop. See <a href="#browser">Browser</a>.</p>
            <h3>An MCP connection needs sign-in</h3>
            <p>Open the session MCP popover, select the gear beside the affected server, and reconnect or reconfigure it, then retry. See <a href="#mcp">MCP connections</a>.</p>
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
              <li>These instructions target the desktop app, not upstream’s terminal installation.</li>
              <li>Browser tools require an attached desktop browser. Network access and localhost are relative to the connected server.</li>
              <li>Artifacts and schedules remain opt-in through <code>experimental.artifacts</code> and <code>experimental.schedules</code>; they are not enabled by default.</li>
              <li>Memory has no management UI or <code>/memory</code> command, is per project, and doesn’t sync across machines.</li>
              <li>Only a turn’s final reply has a pin button; earlier agent messages can’t be pinned.</li>
              <li>Pull request tracking and automatic chapters cover github.com and gitlab.com only. GitLab CI results and auto-fix need the <code>glab</code> CLI.</li>
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
