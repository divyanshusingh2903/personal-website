import { lazy, Suspense } from "react";
import { IconGlyph, LogoPaths } from "./GoldenGateBrand";
import { MARIN, SF } from "./goldengatePlacements";
import { connectors, ingest } from "./goldengateSources";

// The real coastline and roads are a separate chunk, loaded only where the map is shown.
const MapPaths = lazy(() => import("./GoldenGateMapPaths"));

// The brand mark, fitted from shore to shore on the real deck line. It is drawn at its own stroke weight (3.2 in its
// 64x48 box) so the lines scale with it like the logo file; its anchors, plus the round caps, end exactly on the coast.
const CABLE = "M2 34Q14 30 20 6Q32 46 44 6Q50 30 62 34";
const SHORE = { left: 670.4, right: 904.1, deck: 502.8 };
const MARK_SCALE = (SHORE.right - SHORE.left) / 63.2;
const DECK = { cx: (SHORE.left + SHORE.right) / 2, cy: SHORE.deck };

// A logo placed on the map by its centre, at the map's own scale.
const LOGO_SIZE = 54;
function MapLogo({ item, at }) {
  const [x, y] = at;
  return (
    <g className="gg-map-logo" transform={`translate(${x - LOGO_SIZE / 2} ${y - LOGO_SIZE / 2}) scale(${LOGO_SIZE / 24})`}>
      <title>{item.name}</title>
      {item.logo ? <LogoPaths name={item.logo} /> : <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><IconGlyph name={item.icon} /></g>}
    </g>
  );
}

// The Golden Gate strait from OpenStreetMap: your tools on the San Francisco shore, assistants on Marin, the mark on the deck.
export default function MapArt({ className = "gg-map-svg" }) {
  return (
    <svg className={className} viewBox="0 0 1600 712" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A map of the Golden Gate strait: San Francisco on the left, Marin County on the right, joined by the bridge">
      <rect className="gg-map-water" width="1600" height="712" />
      <Suspense fallback={null}><MapPaths /></Suspense>
      <g transform={`translate(${DECK.cx - 32 * MARK_SCALE} ${DECK.cy - 34 * MARK_SCALE}) scale(${MARK_SCALE})`} fill="none" stroke="var(--gg-orange)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4V44M44 4V44" />
        <path d={CABLE} />
      </g>
      <g className="gg-map-logos">
        {ingest.map((p, i) => SF[i] && <MapLogo key={p.name} item={p} at={SF[i]} />)}
        {connectors.map((p, i) => MARIN[i] && <MapLogo key={p.name} item={p} at={MARIN[i]} />)}
      </g>
    </svg>
  );
}
