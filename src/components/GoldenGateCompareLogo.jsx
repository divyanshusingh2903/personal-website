import { Logo } from "./GoldenGateBrand";

// A product's mark: its organisation's avatar from public/goldengate/compare, the assistants' marks, or a monogram tile
// for a project that ships no logo of its own (never a person's photo).
export default function ProductLogo({ product, size = "md" }) {
  const { logo, name } = product;
  return (
    <span className={`gg-pl gg-pl-${size}`}>
      {logo.img && <img src={`/goldengate/compare/${logo.img}.png`} alt="" width="48" height="48" loading="lazy" />}
      {logo.mono && <span className="gg-pl-mono" aria-hidden="true">{logo.mono}</span>}
      {logo.brands && (
        <span className="gg-pl-brands" aria-hidden="true">
          {logo.brands.map((b) => <Logo key={b} name={b} />)}
        </span>
      )}
      <span className="gg-sr">{name}</span>
    </span>
  );
}
