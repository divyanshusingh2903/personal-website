import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import "./GoldenGate.css";
import { Mark } from "./GoldenGateBrand";

export const GITHUB_URL = "https://github.com/divyanshusingh2903/goldengate";
const THEME_KEY = "gg-theme";

// Visuals that play once when they scroll into view. Armed from here, after mount, so the
// prerendered page is fully visible without JavaScript and for visitors who reduce motion.
const REVEAL = ".gg-table-wrap, .gg-chat, .gg-cross, .gg-surf";
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
            <Link to="/goldengate/use-cases">Use cases</Link>
            <Link to="/goldengate/mcp">MCP</Link>
            <Link to="/goldengate/security">Security</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
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
