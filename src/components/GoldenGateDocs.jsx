import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GoldenGateShell, { Code, GITHUB_URL } from "./GoldenGateShell";

// Written from goldengate/docs/GUIDE.md and the README; keep them in step when commands or screens change.

const nav = [
  { group: "Start", items: [["overview", "Overview"], ["install", "Install"], ["server", "Run the server"], ["setup", "First-run setup"]] },
  { group: "Terminal UI", items: [["tui", "Getting around"], ["tui-projects", "Projects"], ["tui-send", "Send"], ["tui-inbox", "Inbox"], ["tui-agents", "Agents"], ["tui-settings", "Server and settings"]] },
  { group: "Web app", items: [["web", "Open the web app"], ["web-screens", "Screens"]] },
  { group: "Assistants", items: [["connect", "Connect an assistant"], ["second-agent", "More assistants"], ["oauth", "OAuth"]] },
  { group: "Deploy", items: [["deploy", "Deploy behind HTTPS"], ["deploy-vm", "Your own VM"], ["deploy-railway", "Railway"], ["deploy-firebase", "Firebase and Google Cloud"], ["deploy-vercel", "Vercel"]] },
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

// The sticky header covers the top of the viewport, so a section sits a little below it.
const OFFSET = 88;

// Jump, don't glide: the page's smooth scrolling would chase a target that moves while layout settles.
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const delta = el.getBoundingClientRect().top - OFFSET + 1;
  if (Math.abs(delta) > 2) window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
}

// Scroll to a section now and again as fonts and layout settle. Returns a cleanup.
function settleOn(id) {
  scrollToId(id);
  const timers = [setTimeout(() => scrollToId(id), 150), setTimeout(() => scrollToId(id), 600)];
  document.fonts?.ready.then(() => scrollToId(id));
  return () => timers.forEach(clearTimeout);
}

function GoldenGateDocs() {
  const [active, setActive] = useState(ids[0]);
  const { hash } = useLocation();

  const navigate = useNavigate();

  // The page scrolls by itself here, so the browser's own smooth anchor scrolling must not compete.
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => { root.style.scrollBehavior = before; };
  }, []);

  // Deep links and back/forward.
  useEffect(() => (hash ? settleOn(decodeURIComponent(hash.slice(1))) : undefined), [hash]);

  // Every in-page link jumps the same way, including a repeat click on the current section.
  const onLinkClick = (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    if (location.hash !== `#${id}`) navigate({ hash: id });
    settleOn(id);
  };

  // Highlight the last section whose top has passed under the header, or the last one at the page end.
  useEffect(() => {
    const update = () => {
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= OFFSET + 8) current = id;
      }
      setActive(atEnd ? ids[ids.length - 1] : current);
    };
    const onScroll = update; // about 25 rect reads per event; cheap, and needs no animation frame
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <GoldenGateShell title="Docs | Golden Gate">
      <div className="gg-wrap gg-d" onClick={onLinkClick}>
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
            <p>The current version is <strong>1.0.1</strong>. The laptop app (<code>goldengate</code>) is one Go program; build it with Go 1.26 or later. This also installs <code>goldengatebridge</code>, the server, which you can run from source or, more easily, as a published image (see <a href="#deploy">Deploy</a>).</p>
            <Code>{"go install github.com/divyanshusingh2903/goldengate/cmd/...@v1.0.1"}</Code>
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
            <p>{k("space")} ticks or unticks, {k("enter")} shows your changes and applies them only when you confirm, {k("v")} shows exactly what the highlighted assistant can read now, {k("d")} lists its tokens ({k("R")} revokes one, {k("N")} makes a new one), {k("u")} clears pending changes.</p>
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
                [<strong>Overview</strong>, "Where things stand: what waits, what was sent, and a timeline of automatic sends."],
                [<strong>Setup</strong>, "Leads with the connected server (status, upload token, connector address); the form to connect or reconnect opens on request. Connect with the admin secret or a pairing code. The assistant token is shown once, with a copy button."],
                [<strong>Projects</strong>, <>{c("●")} shared, {c("○")} not shared, {c("◐")} partly, {c("✕")} blocked. Views, search, show as folders. The card says in words what happens to each project: share, block, preview, tools, named project, undo.</>],
                [<strong>Preview</strong>, "The exact payload per session, redactions highlighted, and what changed since the last send."],
                [<strong>Send</strong>, "Step 1 Review, nothing leaves. Step 2 Send, with progress per project. A failure offers retry; what arrived is not sent again."],
                [<strong>Inbox</strong>, "Offers first, then sessions waiting by project with Approve all. Per session: approve, exclude, edit summary, undo, retract."],
                [<strong>Receipts</strong>, "Each automatic send, the rule that sent each session, retract per session."],
                [<strong>Server</strong>, "Reachability, the upload token, what the server holds, delete a project there."],
                [<strong>Agents</strong>, "A grid of projects by assistants. Ticks are staged in a review card and apply only when you confirm. A card per assistant with its tokens: revoke, make a new token (shown once), and View as."],
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
            <p>Hosted assistants can't reach your laptop, so the server needs a public HTTPS address. Golden Gate Bridge is one Go program and one SQLite file. It refuses plain HTTP on a public address unless TLS is configured or <code>--behind-tls-proxy</code> is given.</p>
            <p>So a host has to give it three things: <strong>HTTPS</strong>, a <strong>disk that survives restarts</strong>, and <strong>one always-on process</strong> (no scale-to-zero, one replica).</p>
            <Table
              head={["Host", "Fits?", "Why"]}
              rows={[
                [<a href="#deploy-vm">Your own VM</a>, "Yes", "A disk, systemd, and Caddy for HTTPS. The most direct route."],
                [<a href="#deploy-railway">Railway</a>, "Yes", "A container with a volume and a generated HTTPS domain."],
                [<a href="#deploy-firebase">Firebase</a>, "Not by itself", "Firebase hosts sites and functions, not a server with a disk. Use a Google Cloud VM."],
                [<a href="#deploy-vercel">Vercel</a>, "To try it only", "It runs the image, but as a function: no disk that survives and it scales to zero. You would lose your data."],
              ]}
            />
            <p>Whichever host you pick, the finish is the same. Open <code>https://bridge.example.com/healthz</code> (it prints <code>200</code>), then connect your laptop. The upload token goes to your OS keyring and the assistant token is printed once:</p>
            <Code>{"goldengate init --server https://bridge.example.com"}</Code>
            <Note>Images are versioned (<code>1.0.1</code>, <code>1.0</code>, <code>1</code>, <code>latest</code>), for amd64 and arm64. Keep one copy of the server, with one database. Don't run two instances against the same data.</Note>
          </Sec>

          <Sec id="deploy-vm" title="Your own VM">
            <p>Any Linux VM works (Hetzner, DigitalOcean, EC2, a Compute Engine instance). These steps assume Ubuntu, a DNS <code>A</code> record for <code>bridge.example.com</code> pointing at the VM, and ports 80 and 443 open.</p>
            <p><strong>1. Build for Linux on your laptop and copy it over.</strong> The server has no C dependencies.</p>
            <Code>{'GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go install github.com/divyanshusingh2903/goldengate/cmd/goldengatebridge@v1.0.1\nscp "$(go env GOPATH)/bin/linux_amd64/goldengatebridge" you@bridge.example.com:'}</Code>
            <p>If your laptop is already Linux on amd64, the file is in <code>$(go env GOPATH)/bin</code> without the <code>linux_amd64</code> folder. Use <code>GOARCH=arm64</code> for an Arm VM.</p>
            <p><strong>2. On the VM, add a user, a data folder and the admin secret.</strong></p>
            <Code>{'sudo install -m 755 goldengatebridge /usr/local/bin/\nsudo useradd --system --create-home --home-dir /var/lib/goldengate --shell /usr/sbin/nologin goldengate\nsudo install -d -m 700 /etc/goldengate\necho "GOLDENGATE_ADMIN_TOKEN=$(openssl rand -base64 32)" | sudo tee /etc/goldengate/bridge.env >/dev/null\nsudo chmod 600 /etc/goldengate/bridge.env'}</Code>
            <p><strong>3. Run it as a service.</strong> Save this as <code>/etc/systemd/system/goldengatebridge.service</code>:</p>
            <Code>{'[Unit]\nDescription=Golden Gate Bridge\nAfter=network-online.target\n\n[Service]\nUser=goldengate\nEnvironmentFile=/etc/goldengate/bridge.env\nExecStart=/usr/local/bin/goldengatebridge serve --addr 127.0.0.1:8080 --behind-tls-proxy --db /var/lib/goldengate/bridge.db\nRestart=on-failure\nNoNewPrivileges=true\nProtectSystem=strict\nReadWritePaths=/var/lib/goldengate\nProtectHome=true\nPrivateTmp=true\n\n[Install]\nWantedBy=multi-user.target'}</Code>
            <Code>{"sudo systemctl daemon-reload && sudo systemctl enable --now goldengatebridge"}</Code>
            <p><strong>4. Put Caddy in front for HTTPS.</strong> It gets and renews the certificate by itself.</p>
            <Code>{'sudo apt install -y caddy\nsudo tee /etc/caddy/Caddyfile >/dev/null <<\'EOF\'\nbridge.example.com {\n\treverse_proxy 127.0.0.1:8080\n}\nEOF\nsudo systemctl reload caddy'}</Code>
            <p><strong>5. Connect your laptop without copying the admin secret.</strong> Make a single-use pairing code on the VM, then use it on your laptop:</p>
            <Code>{'sudo -u goldengate goldengatebridge --db /var/lib/goldengate/bridge.db pair\n# on your laptop:\ngoldengate init --server https://bridge.example.com --pair-code <code>'}</Code>
            <Check items={[<><code>curl -s -o /dev/null -w "%{"{http_code}"}\n" https://bridge.example.com/healthz</code> prints <code>200</code>.</>, <>After a reboot, <code>systemctl status goldengatebridge</code> says active.</>, <>Back up <code>/var/lib/goldengate/bridge.db</code>. It is the only state.</>]} />
          </Sec>

          <Sec id="deploy-railway" title="Railway">
            <p>Railway runs the published image, keeps the database on a volume, and gives you an HTTPS address. There is nothing to build and no Dockerfile to write. A new Railway account includes trial credit, which is enough to try this.</p>
            <Code>{"ghcr.io/divyanshusingh2903/goldengatebridge:1.0.1"}</Code>
            <p>Use a version tag like <code>:1.0.1</code> to keep the server from changing under you, <code>:1.0</code> or <code>:1</code> for patch or minor updates, or <code>:latest</code> for the newest release.</p>
            <ol className="gg-d-steps">
              <li>Go to <a href="https://railway.com/new" target="_blank" rel="noopener noreferrer">railway.com/new</a> and choose <strong>Docker Image</strong>. Paste the image above and press <kbd>Enter</kbd>. Railway creates the project and starts pulling the image. The first start fails until step 2 is done, because the server refuses to run without an admin secret.</li>
              <li>Open the service, then <strong>Variables → New Variable</strong>. Name it <code>GOLDENGATE_ADMIN_TOKEN</code> and give it this value, which makes Railway generate a long random secret for you, then click <strong>Add</strong>:
                <Code>{"${{secret(48)}}"}</Code>
              </li>
              <li>Close the service panel to see the project canvas. Right-click the service, choose <strong>Attach volume</strong>, type <code>/data</code> as the mount path and press <kbd>Enter</kbd>. Without the volume, the database is lost on every deploy.</li>
              <li>Click <strong>Deploy</strong> in the bar at the bottom (it says "Apply 4 changes") to apply the variable and the volume.</li>
              <li>Open the service's <strong>Settings → Networking</strong> and click <strong>Generate Domain</strong>. Railway finds port 8080 by itself and gives you an address like <code>https://your-service-production.up.railway.app</code>. Leave the service at one replica.</li>
              <li>Open <code>https://your-service-production.up.railway.app/healthz</code>. It shows <code>{"{"}"status":"ok"{"}"}</code>.</li>
              <li>Read your admin secret: <strong>Variables</strong>, then the eye icon next to <code>GOLDENGATE_ADMIN_TOKEN</code>. On your laptop, connect and paste it when asked:
                <Code>{"goldengate init --server https://your-service-production.up.railway.app"}</Code>
              </li>
            </ol>
            <Check items={[<>Share a project and send it, and an assistant connected with the assistant token lists it. A wrong token gets <code>401</code>.</>, <>Open the service's <strong>Deployments</strong>, choose <strong>⋮ → Redeploy</strong>, and when it is active again the project and your tokens are still there. That shows the volume works.</>]} />
            <Note>Railway shows the admin secret to anyone who can open the project, so share the project only with people you would trust with it. After <code>goldengate init</code> you don't need the secret again except to change which assistant sees what.</Note>
            <p>The same image runs anywhere that runs containers: <code>docker run -d -p 8080:8080 -v gg-data:/data -e GOLDENGATE_ADMIN_TOKEN=… ghcr.io/divyanshusingh2903/goldengatebridge:1.0.1</code> behind your own HTTPS. The Dockerfile is <a href={`${GITHUB_URL}/blob/main/deploy/Dockerfile`} target="_blank" rel="noopener noreferrer">deploy/Dockerfile</a> if you want to build it yourself.</p>
          </Sec>

          <Sec id="deploy-firebase" title="Firebase and Google Cloud">
            <p>Firebase Hosting serves static files, and Cloud Functions are short-lived, so neither can hold a SQLite file. Two Google Cloud routes do work:</p>
            <ul className="gg-d-steps">
              <li><strong>A Compute Engine VM (recommended).</strong> Create a small Ubuntu VM, give it a static external IP, open ports 80 and 443, and follow <a href="#deploy-vm">Your own VM</a>. A Firebase project can use the same Google Cloud project.</li>
              <li><strong>Cloud Run with a Filestore (NFS) volume.</strong> Deploy the image (Cloud Run reads public registries through an Artifact Registry remote repository) with <code>gcloud run deploy</code> at one instance minimum and one maximum, and mount a Filestore share at <code>/data</code>. Filestore has a monthly cost even when idle, and a share is writable by root only by default, which the image's root user satisfies.</li>
            </ul>
            <Note>Don't mount a Cloud Storage bucket at <code>/data</code>. It doesn't lock files, and SQLite needs locks.</Note>
            <p>You can put Firebase Hosting in front with a rewrite to the Cloud Run service, but it adds nothing here: Cloud Run already gives you an HTTPS address, and a custom domain maps straight to it.</p>
          </Sec>

          <Sec id="deploy-vercel" title="Vercel">
            <p>Vercel can run a Docker image (the container runtime is in beta). It serves it from a function: the container starts on a request, runs on port 80 unless you set <code>PORT</code>, and is stopped after about five minutes without traffic. There is no disk that survives, so the server's database is lost whenever the container is replaced, and two containers at once would each keep their own database. In a test the data was gone after about ten idle minutes: the laptop's stored upload token was refused (<code>goldengate doctor</code> says so) and everything had to be sent again.</p>
            <Note><strong>Use this to try Golden Gate, not to keep your data.</strong> Use version 1.0.1 or later: 1.0.0 answered assistants with a 403 on Vercel. For a server you rely on, use a <a href="#deploy-vm">VM</a> or <a href="#deploy-railway">Railway</a>. After a restart on Vercel you would run <code>goldengate init</code> again and send everything again.</Note>
            <ol className="gg-d-steps">
              <li>Make an empty folder and add a file named <code>Dockerfile</code>. It starts from the published image and keeps the database in <code>/tmp</code>, the only writable place:
                <Code>{'FROM ghcr.io/divyanshusingh2903/goldengatebridge:1.0.1\nCMD ["serve", "--behind-tls-proxy", "--db", "/tmp/bridge.db"]'}</Code>
              </li>
              <li>Install the Vercel CLI, sign in, and link the folder to a new project (accept the defaults):
                <Code>{"npm i -g vercel\nvercel login\nvercel link"}</Code>
              </li>
              <li>Add the admin secret, and tell Vercel which port the server listens on (it routes to port 80 otherwise). Paste the output of <code>openssl rand -base64 32</code> when asked, and keep a copy:
                <Code>{"vercel env add GOLDENGATE_ADMIN_TOKEN production\nvercel env add PORT production    # enter 8080"}</Code>
              </li>
              <li>Make sure Vercel treats the project as a container. With only a <code>Dockerfile</code> in the folder it picks that by itself. If it detects another framework, force it:
                <Code>{"vercel project update --framework container --yes"}</Code>
              </li>
              <li>Deploy to production:
                <Code>{"vercel deploy --prod"}</Code>
                You can also push the folder to a Git repository connected to the project; it deploys the same way. The first build pulls the image, so it takes a minute.
              </li>
              <li>Open <code>https://your-project.vercel.app/healthz</code>, which shows <code>{"{"}"status":"ok"{"}"}</code>. It prints <code>200</code> (the first request after idle is slow while the container starts). If you see a Vercel sign-in page instead, Deployment Protection is on for that URL; turn it off for production in the project settings, because an assistant can't sign in to it.</li>
              <li>Connect your laptop, pasting the admin secret when asked:
                <Code>{"goldengate init --server https://your-project.vercel.app"}</Code>
              </li>
            </ol>
            <Check items={[<><code>/healthz</code> prints <code>200</code> on the production URL.</>, <>An assistant connected with the token lists the projects you shared. If it later sees nothing, the container was replaced: run <code>goldengate init</code> and send again.</>]} />
            <p>Vercel limits to know: a request can run up to 5 minutes on the free plan (longer on paid plans), request bodies are capped at 4.5 MB, and a container gets 2 GB of memory by default.</p>
            <p>If your domain lives on Vercel, you can still point a subdomain at a better host. Under <strong>Domains → DNS Records</strong>, add an <code>A</code> record to your VM's address, or a <code>CNAME</code> from <code>bridge</code> to your Railway domain.</p>
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
                ["Assistants and grants", c("goldengate agents list|add|rename|grant|revoke|token|limit|remove")],
                ["Summarizer", c("goldengate summarizer use heuristic|anthropic|openai|gemini|opencode|custom")],
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
