import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import "./GoldenGate.css";
import { Mark } from "./GoldenGateBrand";

export const GITHUB_URL = "https://github.com/divyanshusingh2903/goldengate";
const THEME_KEY = "gg-theme";

// The only visuals that play on scroll, each once: the redaction sweep and the security strike-through.
// Armed from here, after mount, so the prerendered page is fully visible without JavaScript and
// for visitors who reduce motion.
const REVEAL = ".gg-rd, .gg-cross";
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The page follows the OS theme until the visitor picks one; saved per browser.
// The server snapshot is null so prerendered HTML always matches the first client render.
const themeListeners = new Set();

function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null; // Storage can be blocked; the OS theme still applies.
  }
}

function subscribeTheme(listener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => null);

  const toggle = () => {
    const current = theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    try {
      localStorage.setItem(THEME_KEY, current === "dark" ? "light" : "dark");
    } catch {
      return; // Without storage there is nothing to remember the choice in.
    }
    themeListeners.forEach((l) => l());
  };

  return [theme, toggle];
}

// A screenshot from the real TUI in both of its themes; CSS shows the one matching the page.
export function Shot({ name, ext = "webp", alt, width = 1760, height = 1282, eager = false }) {
  const props = { width, height, loading: eager ? "eager" : "lazy", decoding: "async" };
  return (
    <span className="gg-shot">
      <img className="gg-only-light" src={`/goldengate/${name}-light.${ext}`} alt={alt} {...props} />
      <img className="gg-only-dark" src={`/goldengate/${name}-dark.${ext}`} alt="" aria-hidden="true" {...props} />
    </span>
  );
}

// One request per page load for the repository's star count, shared by every GitHub button; kept for the tab's session.
const STARS_KEY = "gg-stars";
let starsRequest = null;
function loadStars() {
  try {
    const cached = sessionStorage.getItem(STARS_KEY);
    if (cached !== null) return Promise.resolve(Number(cached));
  } catch {
    // Storage can be blocked; fall through to the request.
  }
  starsRequest ??= fetch("https://api.github.com/repos/divyanshusingh2903/goldengate")
    .then((res) => (res.ok ? res.json() : null))
    .then((repo) => {
      const n = typeof repo?.stargazers_count === "number" ? repo.stargazers_count : null;
      try {
        if (n !== null) sessionStorage.setItem(STARS_KEY, String(n));
      } catch {
        // Not cached; the next page asks again.
      }
      return n;
    })
    .catch(() => null);
  return starsRequest;
}

// The GitHub mark with the live star count. The count appears after load, so the prerendered page matches the first render.
export function GitHubButton({ className = "" }) {
  const [stars, setStars] = useState(null);
  useEffect(() => {
    let live = true;
    loadStars().then((n) => live && setStars(n));
    return () => { live = false; };
  }, []);
  return (
    <a className={`gg-gh ${className}`.trim()} href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={stars === null ? "Golden Gate on GitHub" : `Golden Gate on GitHub, ${stars} stars`}>
      <svg className="gg-gh-mark" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
      <span className="gg-gh-label">GitHub</span>
      <span className="gg-gh-stars" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.751.751 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>
        {stars === null ? "Star" : new Intl.NumberFormat("en", { notation: "compact" }).format(stars)}
      </span>
    </a>
  );
}

export function Code({ children }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="gg-code">
      <pre>{children}</pre>
      <button className="gg-copy" onClick={copy} aria-label="Copy command">{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

function GoldenGateShell({ title, children }) {
  const [theme, toggleTheme] = useTheme();
  const rootRef = useRef(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...root.querySelectorAll(REVEAL)];
    items.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.matches(REVEAL));
      el.style.setProperty("--i", Math.min(siblings.indexOf(el), 5));
      el.classList.add("gg-reveal");
    });
    root.dataset.motion = "on";
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      delete root.dataset.motion;
      items.forEach((el) => el.classList.remove("gg-reveal", "is-in"));
    };
  }, [title]);

  useEffect(() => {
    const prevTitle = document.title;
    const icon = document.querySelector('link[rel="icon"]');
    const prevIcon = icon?.getAttribute("href");
    const prevType = icon?.getAttribute("type");
    document.title = title;
    icon?.setAttribute("href", "/goldengate-mark.svg");
    icon?.setAttribute("type", "image/svg+xml");
    return () => {
      document.title = prevTitle;
      if (prevIcon) icon.setAttribute("href", prevIcon);
      if (prevType) icon.setAttribute("type", prevType);
    };
  }, [title]);

  return (
    <main id="goldengate" ref={rootRef} data-theme={theme ?? undefined}>
      <header className="gg-top">
        <div className="gg-wrap gg-top-inner">
          <Link className="gg-logo" to="/goldengate" aria-label="Golden Gate home">
            <Mark />
            <span>Golden Gate</span>
          </Link>
          <nav aria-label="Golden Gate">
            <Link to="/goldengate/docs">Docs</Link>
            <Link to="/goldengate/use-cases">Use cases</Link>
            <Link to="/goldengate/mcp">MCP</Link>
            <Link to="/goldengate/security">Security</Link>
            <GitHubButton className="gg-gh-nav" />
            <button className="gg-theme" onClick={toggleTheme} aria-label="Switch between light and dark">
              <span className="gg-theme-light">Dark</span>
              <span className="gg-theme-dark">Light</span>
            </button>
          </nav>
        </div>
      </header>

      {children}

      <footer className="gg-footer">
        <div className="gg-wrap gg-footer-inner">
          <span className="gg-footer-mark"><Mark /> Golden Gate</span>
          <nav aria-label="Footer">
            <Link to="/goldengate/docs">Docs</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/goldengate/use-cases">Use cases</Link>
            <Link to="/goldengate/mcp">MCP</Link>
            <Link to="/goldengate/security">Security</Link>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">Apache-2.0</a>
            <Link to="/projects">More projects</Link>
          </nav>
          <span className="gg-footer-legal">©{new Date().getFullYear()} Divyanshu Singh. Not affiliated with the bridge, or with any assistant vendor.</span>
        </div>
      </footer>
    </main>
  );
}

export default GoldenGateShell;
