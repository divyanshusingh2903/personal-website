import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GoldenGateShell, { Code, GITHUB_URL } from "./GoldenGateShell";

// Written from goldengate/docs/GUIDE.md and the README; keep them in step when commands or screens change.

const nav = [
  { group: "Start", items: [["overview", "Overview"], ["install", "Install"], ["server", "Run the server"], ["setup", "First-run setup"]] },
  { group: "Terminal UI", items: [["tui", "Getting around"], ["tui-projects", "Projects"], ["tui-send", "Send"], ["tui-inbox", "Inbox"], ["tui-agents", "Agents"], ["tui-settings", "Server and settings"]] },
  { group: "Web app", items: [["web", "Open the web app"], ["web-screens", "Screens"]] },
  { group: "Assistants", items: [["connect", "Connect an assistant"], ["second-agent", "More assistants"], ["deploy", "Deploy behind HTTPS"], ["oauth", "OAuth"]] },
  { group: "Automation", items: [["rules", "Trust levels and rules"], ["receipts", "Receipts"], ["offers", "Offers"], ["background", "Send in the background"]] },
  { group: "Reference", items: [["chats", "Chat exports"], ["sources", "Sources"], ["cli", "Commands"], ["troubleshooting", "Troubleshooting"], ["uninstall", "Clean up"]] },
];
const ids = nav.flatMap((g) => g.items.map(([id]) => id));

function Table({ head, rows }) {
  return (
    <div className="gg-d-table">
      <table>
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Check({ items }) {
  return (
    <div className="gg-d-check">
      <strong>Check</strong>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function Note({ children }) {
  return <aside className="gg-d-note">{children}</aside>;
}

function Sec({ id, title, children }) {
  return (
    <section id={id} className="gg-d-sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const k = (s) => <kbd>{s}</kbd>;
const c = (s) => <code>{s}</code>;

function GoldenGateDocs() {
  const [active, setActive] = useState(ids[0]);
  const { hash } = useLocation();

  // Router links change the route without the browser's own anchor scroll.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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
    <GoldenGateShell title="Docs | Golden Gate">
      <div className="gg-wrap gg-d">
        <aside className="gg-d-side">
          <nav aria-label="Docs">
            {nav.map((g) => (
              <div key={g.group} className="gg-d-group">
                <span>{g.group}</span>
                <ul>
                  {g.items.map(([id, label]) => (
                    <li key={id}><a href={`#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="gg-d-body">
          <header className="gg-d-head">
            <h1>Docs</h1>
            <p className="gg-l-lede">Everything from install to your assistant's first answer. Follow it top to bottom the first time; each part ends with what to check.</p>
          </header>

          <Sec id="overview" title="Overview">
            <p>Two programs. <strong>Golden Gate</strong> (<code>goldengate</code>) runs on your laptop: it reads your coding tools' history, lets you choose what is shared, redacts, summarizes and sends. <strong>Golden Gate Bridge</strong> (<code>goldengatebridge</code>) is your server: it stores the summaries and serves them, read-only, to the assistants you connect.</p>
            <pre className="gg-d-diagram">{"coding tools ──► goldengate ──(redacted summaries)──► goldengatebridge ──(MCP, read-only)──► assistant\n (read-only)     TUI · web app · commands             your server                          Claude, ChatGPT, …"}</pre>
            <p>Nothing leaves your computer until you send it, and every screen says what would leave.</p>
            <Table
              head={["Token", "Who holds it", "What it can do"]}
              rows={[
                [<strong>Admin secret</strong>, "You", "Create and revoke tokens, change which assistant sees which project"],
                [<strong>Upload token</strong>, "Your laptop, in the OS keyring", "Send summaries, delete a project from the server"],
                [<strong>Assistant token</strong>, "An assistant", "Read what you shared, nothing else"],
              ]}
            />
          </Sec>

          <Sec id="install" title="Install">
            <p>There are no packaged releases yet. Build both programs with Go 1.26 or later:</p>
            <Code>{"go install github.com/divyanshusingh2903/goldengate/cmd/...@latest"}</Code>
            <p>They land in <code>$(go env GOPATH)/bin</code>. Put that folder on your <code>PATH</code> and check both run:</p>
            <Code>{'export PATH="$HOME/go/bin:$PATH"\ngoldengate version && goldengatebridge version'}</Code>
            <p>See what Golden Gate can read. Nothing goes over the network:</p>
            <Code>{"goldengate doctor"}</Code>
            <Note>Settings live in <code>~/.config/goldengate/config.toml</code> and what has been sent in <code>~/.local/state/goldengate/state.db</code>. Your coding tools are only ever read, never changed.</Note>
          </Sec>

          <Sec id="server" title="Run the server">
            <p>To try it on one computer, run the server on <code>127.0.0.1</code>, where plain HTTP is fine. For a server your assistants can reach, see <a href="#deploy">Deploy behind HTTPS</a>.</p>
            <p>Create the admin secret once and keep it private:</p>
            <Code>{'mkdir -p ~/gg-test && cd ~/gg-test\nopenssl rand -base64 32 > admin-secret.txt && chmod 600 admin-secret.txt\nGOLDENGATE_ADMIN_TOKEN="$(cat admin-secret.txt)" goldengatebridge serve --addr 127.0.0.1:8080 --db ~/gg-test/bridge.db'}</Code>
            <p>It prints <code>listening on 127.0.0.1:8080</code>. Leave it running; stop it with <kbd>Ctrl-C</kbd>. Golden Gate uses the admin secret once to make the two narrower tokens and never writes it to disk.</p>
            <Check items={[<><code>curl -s -o /dev/null -w "%{"{http_code}"}\n" http://127.0.0.1:8080/healthz</code> prints <code>200</code>.</>]} />
          </Sec>

          <Sec id="setup" title="First-run setup">
            <p>Run <code>goldengate</code> in a second terminal. Setup takes six steps:</p>
            <Table
              head={["Step", "What you see", "What to do"]}
              rows={[
                ["1 · Welcome", "The tools found on this computer, with session counts", k("enter")],
                ["2 · Server", "Admin secret, pairing code, or stay local", <>Keep <strong>Connect with the admin token</strong>. Enter the server URL and paste the admin secret; the field hides it.</>],
                ["2 · Connected", <>The assistant token, shown <strong>once</strong>, and the connector URL</>, "Save the token in a password manager. You need it to connect an assistant."],
                ["3 · Share level", <><strong>summary</strong> (title, goal, files, commands, outcome, work items) or <strong>titles-only</strong></>, "Keep summary."],
                ["4 · Choose projects", <>Every project folder, all {c("[ ] not shared")}</>, <>{k("↑")} {k("↓")} to move, {k("space")} to share, {k("p")} to see exactly what would be sent.</>],
                ["5 · Review", "A dry run: sessions, projects and redactions the first send would have", "Nothing has been sent yet."],
                ["6 · First send", "The first send", "Confirm, or finish later."],
              ]}
            />
            <p>{k("esc")} at any step skips setup. You can run it again from the Server screen. On a server where you have a shell you can pair instead of using the admin secret: run <code>goldengatebridge pair</code> there and <code>goldengate init --server URL --pair-code CODE</code> here.</p>
          </Sec>

          <Sec id="tui" title="Getting around">
            <Table
              head={["Key", "Where it goes"]}
              rows={[
                [<>{k("1")} … {k("5")} or {k("tab")}</>, "Projects, Send, Server, Settings, Agents"],
                [k("s"), "Send, review first"],
                [k("i"), "Inbox: single sessions"],
                [k("?"), "Every key on the current screen"],
                [k("r"), "Refresh"],
                [<>{k("q")} or {k("ctrl+c")}</>, "Quit"],
              ]}
            />
            <p>The mouse works too: click rows, tabs, buttons and the keys in the bottom bar; double-click a project to preview it.</p>
          </Sec>

          <Sec id="tui-projects" title="Projects">
            <p>The list on the left, a card about the highlighted project on the right. Sharing changes your selection only; nothing is sent from this screen.</p>
            <Table
              head={["Mark", "Meaning"]}
              rows={[
                [c("[x]"), "Shared"],
                [c("[ ]"), "Not shared: nothing leaves"],
                [c("[~]"), "Shared, but only some of its tools"],
                [c("[-]"), "Blocked: never sent, even when a parent folder is shared"],
                [c("▲ 3 to send"), "3 sessions new or changed since the last send"],
                [c("✓ sent 2h"), "Up to date on the server"],
              ]}
            />
            <p>Source tags: <code>CC</code> Claude Code, <code>CX</code> Codex, <code>OC</code> OpenCode, <code>CU</code> Cursor, <code>AI</code> claude.ai, <code>GPT</code> ChatGPT.</p>
            <Table
              head={["Key", "Action"]}
              rows={[
                [k("space"), "Share or un-share the marked rows, or this one"],
                [<>{k("v")} {k("a")} {k("A")}</>, "Range select, mark all, clear marks"],
                [k("d"), "Block"],
                [k("e"), "Choose which tools of this project are sent"],
                [k("n"), "Put in a named project; type a new name to create one"],
                [k("N"), "Rename a project; an existing name merges them"],
                [k("u"), "Undo the last change"],
                [k("f"), "View: All, Shared, To send, Not shared"],
                [k("t"), <>Folder tree: {k("space")} on a folder shares everything below it</>],
                [<>{k("/")} {k("o")}</>, "Search, sort"],
                [<>{k("p")} or {k("enter")}</>, "Preview: the exact payload, redactions marked"],
                [k("P"), "Paranoid preview: raw payloads, every string"],
              ]}
            />
            <Check items={[
              "The card for an unshared project says nothing from it leaves your machine.",
              <>{k("p")} on a shared project shows summaries, and any secret appears as <code>[REDACTED:…]</code>.</>,
              <>{k("n")} with a new name groups two folders, and {k("u")} undoes it.</>,
            ]} />
          </Sec>

          <Sec id="tui-send" title="Send">
            <p>Two steps. <strong>Review</strong> starts at once: every session is read and redacted exactly as it would be sent, and the screen says nothing has left yet. It lists each project with its session count and redactions. <strong>Send</strong> ({k("enter")}) sends exactly what was reviewed. {k("r")} reviews again, {k("esc")} leaves without sending.</p>
            <Check items={[
              "The count on the Send button matches the review.",
              <>After sending, the projects show <code>✓ sent</code>.</>,
              "Sending again right away sends nothing.",
            ]} />
          </Sec>

          <Sec id="tui-inbox" title="Inbox">
            <p>New sessions of a shared project wait here for your approval. A background send never sends them on its own. Sections: waiting, excluded, sent or queued, retracted.</p>
            <Table
              head={["Key", "Action"]}
              rows={[
                [k("a"), "Approve: goes out with the next send"],
                [k("x"), "Exclude: stays on this computer for good"],
                [k("e"), "Edit the summary in your editor; your version is what is sent"],
                [k("u"), "Undo a decision"],
                [k("R"), "Retract: delete a sent session from the server"],
                [k("o"), <>Answer an <a href="#offers">offer</a></>],
                [k("c"), <>Open <a href="#receipts">receipts</a></>],
              ]}
            />
            <Check items={[
              <>A new session in a shared project appears as waiting after {k("r")}.</>,
              <>{k("e")}, change the title, save: the row says edited, and the preview shows your title.</>,
              <>{k("R")} on a sent session asks first, then lists it under Retracted.</>,
            ]} />
          </Sec>

          <Sec id="tui-agents" title="Agents">
            <p>Asks for the admin secret once per run and keeps it in memory only. A grid of projects by assistants. The assistant made during setup is called <strong>Default</strong> and sees every project you share.</p>
            <Table
              head={["Mark", "Meaning"]}
              rows={[
                [c("[x]"), "This assistant sees this project"],
                [c("[*]"), "Sees it through Every project"],
                [<>{c("+")} {c("-")}</>, "A change you made that is not applied yet"],
              ]}
            />
            <p>{k("space")} ticks or unticks, {k("enter")} shows your changes and applies them only when you confirm, {k("v")} shows exactly what the highlighted assistant can read now, {k("d")} lists its tokens ({k("R")} revokes one), {k("u")} clears pending changes.</p>
          </Sec>

          <Sec id="tui-settings" title="Server and settings">
            <p><strong>Server</strong> ({k("3")}) shows whether the server is reachable, whether the upload token is accepted, and every project the server holds. {k("D")} deletes the highlighted project from the server; it asks first and your files are not touched.</p>
            <p><strong>Settings</strong> ({k("4")}) are saved as you change them: theme, share level, look-back window, tools on or off, extra redaction patterns, commit checks with local git, and the summarizer. Local rules write summaries by default; a model is used only if you turn it on, and it asks first.</p>
          </Sec>

          <Sec id="web" title="Open the web app">
            <p>The same product in a browser, on the same settings and state as the TUI.</p>
            <Code>{"goldengate ui"}</Code>
            <p>It opens <code>http://127.0.0.1:&lt;port&gt;/launch#…</code>. The link works once and expires after two minutes; press {k("enter")} in that terminal for a new one. Reloading the page ends its session on purpose. Add <code>--no-open</code> to only print the link, or <code>--port 8090</code> for a fixed port.</p>
          </Sec>

          <Sec id="web-screens" title="Screens">
            <Table
              head={["Screen", "What you do there"]}
              rows={[
                [<strong>Setup</strong>, "Tools found; connect with the admin secret or a pairing code. The assistant token is shown once, with a copy button."],
                [<strong>Projects</strong>, <>{c("●")} shared, {c("○")} not shared, {c("◐")} partly, {c("✕")} blocked. Views, search, show as folders. The card says in words what happens to each project: share, block, preview, tools, named project, undo.</>],
                [<strong>Preview</strong>, "The exact payload per session, redactions highlighted, and what changed since the last send."],
                [<strong>Send</strong>, "Step 1 Review, nothing leaves. Step 2 Send, with progress per project. A failure offers retry; what arrived is not sent again."],
                [<strong>Inbox</strong>, "Offers first, then sessions waiting by project with Approve all. Per session: approve, exclude, edit summary, undo, retract."],
                [<strong>Receipts</strong>, "Each automatic send, the rule that sent each session, retract per session."],
                [<strong>Server</strong>, "Reachability, the upload token, what the server holds, delete a project there."],
                [<strong>Agents</strong>, "A grid of projects by assistants. Ticks are staged in a review card and apply only when you confirm. Tokens with revoke, and View as."],
                [<strong>Settings</strong>, "Share level, look-back, tools, redaction patterns, git checks, summarizer with a write-only API key and a test call."],
              ]}
            />
            <Check items={[
              <>Sharing a project in the browser shows <code>[x]</code> in the TUI after {k("r")}.</>,
              "Agents refuses a wrong admin secret; nothing changes until you apply.",
              "Reloading the page asks for a fresh link.",
            ]} />
          </Sec>

          <Sec id="connect" title="Connect an assistant">
            <p>Use the assistant token from setup. Lost it? Make a new one with <code>goldengate token rotate assistant</code>.</p>
            <h3>Claude Code</h3>
            <Code>{'claude mcp add --transport http goldengate http://127.0.0.1:8080/mcp \\\n  --header "Authorization: Bearer $(cat ~/gg-test/assistant-token.txt)"'}</Code>
            <p>Then ask, for example: “What have I been working on this week?”, “Which pull requests did I open in the last few days?”, or “Search my work for OAuth.”</p>
            <h3>Other assistants</h3>
            <p>Any assistant that calls an MCP server over HTTP with a header: URL <code>…/mcp</code>, header <code>Authorization: Bearer &lt;assistant token&gt;</code>. Hosted assistants cannot reach <code>127.0.0.1</code>; they need a <a href="#deploy">deployed server</a>.</p>
            <h3>Check without an assistant</h3>
            <Code>{'T="$(cat ~/gg-test/assistant-token.txt)"\ncurl -s http://127.0.0.1:8080/mcp -H "Authorization: Bearer $T" \\\n  -H \'Content-Type: application/json\' -H \'Accept: application/json, text/event-stream\' \\\n  -d \'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}\''}</Code>
            <p>Every tool is read-only. See them all on <Link to="/goldengate/mcp">MCP tools</Link>.</p>
            <Check items={[
              "The assistant lists only projects you shared.",
              "Untick a project for Default in Agents: the assistant stops seeing it on its next request.",
              "Retract a session: the assistant no longer finds it. Revoke the token: it gets unauthorized.",
            ]} />
          </Sec>

          <Sec id="second-agent" title="More assistants">
            <p>Each assistant is an agent with its own projects. A new project is visible to no agent until you grant it.</p>
            <Code>{'export GOLDENGATE_ADMIN_TOKEN="$(cat ~/gg-test/admin-secret.txt)"\ngoldengate agents add "Second"\ngoldengate agents grant Second "Test project"\ngoldengate agents token Second          # shown once\nunset GOLDENGATE_ADMIN_TOKEN'}</Code>
          </Sec>

          <Sec id="deploy" title="Deploy behind HTTPS">
            <p>For hosted assistants, run the server where they can reach it, behind TLS. Golden Gate Bridge refuses plain HTTP on a public address unless TLS is configured or <code>--behind-tls-proxy</code> is given.</p>
            <Code>{'export GOLDENGATE_ADMIN_TOKEN="$(openssl rand -base64 32)"\ngoldengatebridge serve --addr :8080 --behind-tls-proxy --db /data/bridge.db'}</Code>
            <p>Then connect your laptop. The upload token goes to your OS keyring; the assistant token is printed once:</p>
            <Code>{"goldengate init --server https://bridge.example.com"}</Code>
          </Sec>

          <Sec id="oauth" title="OAuth">
            <p>For assistants that can't send a header. Start the server with OAuth and add <code>https://bridge.example.com/mcp</code> as the connector URL. A consent page opens; approve it with your admin secret.</p>
            <Code>{"goldengatebridge serve --oauth --public-url https://bridge.example.com"}</Code>
            <Table
              head={["Task", "Command"]}
              rows={[
                ["Client asks for an ID and secret", c("goldengatebridge oauth clients create --redirect-uri <address>")],
                ["Cut off a connected assistant", c("goldengatebridge oauth clients delete <id>")],
              ]}
            />
            <Note>Only approve connections you started yourself, and check the application and redirect host on the consent page. <Link to="/goldengate/security">Security</Link> has the details.</Note>
          </Sec>

          <Sec id="rules" title="Trust levels and rules">
            <Table
              head={["Level", "What happens to new sessions"]}
              rows={[
                [<strong>ask</strong>, "Default. They wait in the inbox."],
                [<strong>suggest</strong>, "Your rules mark them in the inbox; one command approves the marked ones."],
                [<strong>auto</strong>, "Sessions your rules approve go out with the next send. With no approve rule, every session of the project."],
              ]}
            />
            <Code>{'goldengate projects trust "Test project" auto\ngoldengate rules add "Test project" --source claude-code      # approve Claude Code sessions\ngoldengate rules add "Test project" --exclude --source codex  # keep Codex sessions local\ngoldengate rules list'}</Code>
            <p>A rule only acts inside a project you already shared, and a block always wins.</p>
          </Sec>

          <Sec id="receipts" title="Receipts">
            <p>Everything sent without asking gets a receipt that names the rule that sent it.</p>
            <Code>{"goldengate receipts\ngoldengate receipts show                 # the latest; --agents adds who can read each project\ngoldengate receipts retract <receipt-id> --all"}</Code>
          </Sec>

          <Sec id="offers" title="Offers">
            <p><strong>Rule offers.</strong> After you send 5 or more sessions from one folder by hand within 30 days, the inbox offers the rule that would have done it: <code>goldengate rules accept &lt;id&gt;</code> or <code>dismiss</code>.</p>
            <p><strong>Project suggestions.</strong> A folder that looks like part of a project, such as a worktree of a shared repository, is suggested: <code>goldengate projects suggest</code>, <code>accept</code>, <code>dismiss</code>. Suggestions never apply on their own.</p>
          </Sec>

          <Sec id="background" title="Send in the background">
            <Code>{"goldengate install-schedule --print      # look first\ngoldengate install-schedule              # every 30 minutes\ngoldengate install-hook claude-code      # also when a Claude Code session ends"}</Code>
            <p>Both run <code>goldengate sync --auto</code>, which sends only what you or your rules approved, never what is still waiting. Remove them with <code>uninstall-schedule</code> and <code>uninstall-hook claude-code</code>.</p>
          </Sec>

          <Sec id="chats" title="Chat exports">
            <p>Export your data from claude.ai or ChatGPT (Settings → Export data), then:</p>
            <Code>{'goldengate import-claude-ai ~/Downloads/claude-export.zip\ngoldengate import-chatgpt ~/Downloads/chatgpt-export.zip\ngoldengate chats                                   # conversations in no project\ngoldengate chats share <conversation-id> --project "Test project"'}</Code>
            <p>Only the conversations you name are shared. A newer export adds only new and continued conversations (<code>goldengate imports list</code>).</p>
          </Sec>

          <Sec id="sources" title="Sources">
            <Table
              head={["Source", "How it is read"]}
              rows={[
                ["Claude Code", <><code>~/.claude/projects/**.jsonl</code> (honours <code>CLAUDE_CONFIG_DIR</code>)</>],
                ["Codex CLI and desktop", <><code>~/.codex/sessions/**/rollout-*.jsonl</code> (honours <code>CODEX_HOME</code>)</>],
                ["OpenCode", "Its SQLite database, read-only"],
                ["Cursor", "Its state database, read-only. Commits and PRs show as mentioned only."],
                ["claude.ai", c("goldengate import-claude-ai export.zip")],
                ["ChatGPT", c("goldengate import-chatgpt export.zip")],
              ]}
            />
            <p>The same folder in several tools is one project. Worktrees are filed under their repository when it is shared.</p>
          </Sec>

          <Sec id="cli" title="Commands">
            <Table
              head={["Task", "Command"]}
              rows={[
                ["Open the TUI", c("goldengate")],
                ["Open the web app", c("goldengate ui")],
                ["Health check", c("goldengate doctor")],
                ["Share a folder", c("goldengate share add ~/code/app")],
                ["Named projects", c("goldengate projects create|add|list|rename|merge|remove|delete")],
                ["Look before sending", c("goldengate sync --dry-run --approve")],
                ["Approve and send what is waiting", c("goldengate sync --approve")],
                ["Send what is approved", c("goldengate sync")],
                ["Inbox", c("goldengate inbox · inbox approve --all · inbox exclude <id>")],
                ["Single sessions", c("goldengate sessions list|include|exclude|retract|edit <id>")],
                ["Stop sharing and delete from the server", c("goldengate share remove ~/code/app --delete-from-server")],
                ["New assistant token", c("goldengate token rotate assistant")],
                ["Assistants and grants", c("goldengate agents list|add|grant|revoke|token|limit|remove")],
                ["Summarizer", c("goldengate summarizer use heuristic|anthropic|openai|gemini|ollama|custom")],
              ]}
            />
            <p><code>goldengate &lt;command&gt; --help</code> explains any of them.</p>
          </Sec>

          <Sec id="troubleshooting" title="Troubleshooting">
            <Table
              head={["Symptom", "What to do"]}
              rows={[
                [c("goldengate: command not found"), c('export PATH="$HOME/go/bin:$PATH"')],
                ["Setup says the server is unreachable", <>Is <code>goldengatebridge serve</code> still running, on the URL you entered?</>],
                ["The server refused the admin token", "Paste the exact secret the server was started with."],
                ["The browser asks for a fresh link", <>Press {k("enter")} in the <code>goldengate ui</code> terminal. Links work once, for two minutes.</>],
                [<><code>▲ to send</code> but Send has nothing</>, <>Its sessions wait in the inbox. Approve them with {k("i")}, or send with approval.</>],
                ["The assistant sees nothing", "Did you send? Does its agent see the project? Is the token current?"],
                ["A port is taken", <><code>--addr 127.0.0.1:8081</code> for the server, <code>--port 8091</code> for the web app.</>],
              ]}
            />
          </Sec>

          <Sec id="uninstall" title="Clean up">
            <ol className="gg-d-steps">
              <li>Stop <code>goldengate ui</code> and the server with <kbd>Ctrl-C</kbd>.</li>
              <li>Remove what you installed: <code>goldengate uninstall-schedule</code>, <code>goldengate uninstall-hook claude-code</code>, <code>claude mcp remove goldengate</code>.</li>
              <li>Remove the upload token from the OS keyring. On Linux: <code>secret-tool clear service goldengate username ingest-token@127.0.0.1:8080</code>.</li>
              <li>Delete the test server's data: <code>rm -r ~/gg-test</code>.</li>
            </ol>
            <p>Your coding tools' history was only read and is unchanged. Found a problem? <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer">Open an issue</a>, or report security issues privately.</p>
          </Sec>
        </article>
      </div>
    </GoldenGateShell>
  );
}

export default GoldenGateDocs;
