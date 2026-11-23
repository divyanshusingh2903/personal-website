import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Client-side navigation keeps the old scroll position, so each new page starts at its top.
// Links with a hash are left to the page, and back/forward is left to the browser's own restoration.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (hash || navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}

export default ScrollToTop;
