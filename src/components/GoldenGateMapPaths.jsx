import MAP from "./goldengateMapData";

// Loaded on demand: this is the heavy part of the Use cases hero.
export default function MapPaths() {
  return (
    <>
      <g className="gg-map-ripples" fill="none" strokeLinejoin="round">
        {[30, 18, 8].map((w, i) => <path key={w} d={MAP.land} strokeWidth={w} opacity={0.05 + i * 0.05} />)}
      </g>
      <path className="gg-map-land" d={MAP.land} fillRule="evenodd" />
      <path className="gg-map-streets" d={MAP.streets} />
      <path className="gg-map-tertiary" d={MAP.tertiary} />
      <path className="gg-map-major" d={MAP.major} />
      <path className="gg-map-coast" d={MAP.land} />
    </>
  );
}

