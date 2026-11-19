import { useState } from "react";
import { Link } from "react-router-dom";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";
import ProductLogo from "./GoldenGateCompareLogo";
import { CHECKED, KINDS, products } from "./goldengateCompare";

// The overview: every product in the space, filterable. Each card opens a one-to-one comparison with Golden Gate.
// The facts live in goldengateCompare.js.

function GoldenGateCompare() {
  const [kind, setKind] = useState("all");
  const shown = kind === "all" ? products : products.filter((p) => p.kind === kind);
  const blurb = KINDS.find((k) => k.id === kind)?.blurb;

  return (
    <GoldenGateShell title="Compare | Golden Gate">
      <section className="gg-page-head">
        <div className="gg-wrap">
          <h1>Golden Gate and the rest</h1>
          <p className="gg-lede">Sixteen ways to give an AI memory of your work. Pick one to see it next to Golden Gate.</p>
        </div>
      </section>

      <section className="gg-section" id="products">
        <div className="gg-wrap">
          <div className="gg-kinds" role="tablist" aria-label="Kind of product">
            {[{ id: "all", label: "All" }, ...KINDS].map((k) => (
              <button
                key={k.id}
                role="tab"
                aria-selected={kind === k.id}
                className="gg-kind"
                onClick={() => setKind(k.id)}
              >
                {k.label}
                <span>{k.id === "all" ? products.length : products.filter((p) => p.kind === k.id).length}</span>
              </button>
            ))}
          </div>
          <p className="gg-more gg-kinds-blurb">{blurb ?? "Everything below stores, searches or serves your AI history in some way."}</p>

          <ul className="gg-pgrid">
            {shown.map((p) => (
              <li key={p.slug} className="gg-pcard">
                <div className="gg-pcard-head">
                  <ProductLogo product={p} />
                  <div>
                    <h2><Link to={`/goldengate/compare/${p.slug}`}>{p.name}</Link></h2>
                    <span className="gg-pcard-by">{p.by}{p.license ? ` · ${p.license}` : ""}</span>
                  </div>
                </div>
                <p className="gg-pcard-line">{p.tagline}</p>
                <ul className="gg-tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="gg-pcard-foot">
                  <Link className="gg-btn gg-btn-small" to={`/goldengate/compare/${p.slug}`}>Compare with Golden Gate</Link>
                  <span className="gg-pcard-links">
                    {p.site && <a href={p.site} target="_blank" rel="noopener noreferrer">Website</a>}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">GitHub</a>}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="gg-more">
            Written from each product's own README, website or GitHub page, read on {CHECKED}. These move quickly. If something is out of date or unfair, <a href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener noreferrer">tell me</a> and I will fix it.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateCompare;
