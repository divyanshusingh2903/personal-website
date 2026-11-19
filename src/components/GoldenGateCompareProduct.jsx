import { Link, useParams } from "react-router-dom";
import GoldenGateShell, { GITHUB_URL } from "./GoldenGateShell";
import { Mark } from "./GoldenGateBrand";
import ProductLogo from "./GoldenGateCompareLogo";
import { AXES, CHECKED, GOLDEN_GATE, bySlug, products } from "./goldengateCompare";

// One product next to Golden Gate. Rows come from the product's own entry; Golden Gate's answers are shared.

function GoldenGateCompareProduct() {
  const { slug } = useParams();
  const p = bySlug(slug);

  if (!p) {
    return (
      <GoldenGateShell title="Compare | Golden Gate">
        <section className="gg-page-head">
          <div className="gg-wrap">
            <h1>Not on the list</h1>
            <p className="gg-lede"><Link to="/goldengate/compare">See every product</Link>.</p>
          </div>
        </section>
      </GoldenGateShell>
    );
  }

  const rows = Object.keys(AXES).filter((k) => p.rows[k]);
  const others = products.filter((o) => o.slug !== p.slug);

  return (
    <GoldenGateShell title={`Golden Gate vs ${p.name} | Golden Gate`}>
      <section className="gg-page-head">
        <div className="gg-wrap">
          <p className="gg-crumb"><Link to="/goldengate/compare">All products</Link></p>
          <div className="gg-vs">
            <span className="gg-pl gg-pl-lg"><Mark /></span>
            <span className="gg-vs-x" aria-hidden="true">vs</span>
            <ProductLogo product={p} size="lg" />
          </div>
          <h1>Golden Gate vs {p.name}</h1>
          <p className="gg-lede">{p.tagline}</p>
          <p className="gg-vs-links">
            {p.site && <a href={p.site} target="_blank" rel="noopener noreferrer">{p.name} website</a>}
            {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {p.license && <span>{p.license}</span>}
          </p>
        </div>
      </section>

      <section className="gg-section" id="side-by-side">
        <div className="gg-wrap gg-narrow">
          <h2>Side by side</h2>
          <div className="gg-table-wrap">
            <table className="gg-versus">
              <thead>
                <tr>
                  <td />
                  <th scope="col">{p.name}</th>
                  <th scope="col">Golden Gate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((k) => (
                  <tr key={k}>
                    <th scope="row">{AXES[k]}</th>
                    <td data-label={p.name}>{p.rows[k]}</td>
                    <td data-label="Golden Gate">{GOLDEN_GATE[k]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="gg-section gg-section-sunk" id="pick">
        <div className="gg-wrap gg-split">
          <div className="gg-pick">
            <h2>Pick {p.name} if</h2>
            <ul className="gg-risks">
              {p.pickThem.map((t) => <li key={t}><span aria-hidden="true">{"▸"}</span><p>{t}</p></li>)}
            </ul>
          </div>
          <div className="gg-pick">
            <h2>Pick Golden Gate if</h2>
            <ul className="gg-risks">
              {p.pickGG.map((t) => <li key={t}><span aria-hidden="true">{"▸"}</span><p>{t}</p></li>)}
            </ul>
            <p className="gg-more"><Link to="/goldengate/docs">Start with the docs</Link> · <Link to="/goldengate/security">Security model</Link> · <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a></p>
          </div>
        </div>
      </section>

      <section className="gg-section" id="others">
        <div className="gg-wrap">
          <h2>Compare another</h2>
          <ul className="gg-other">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to={`/goldengate/compare/${o.slug}`}><ProductLogo product={o} size="sm" /><span>{o.name}</span></Link>
              </li>
            ))}
          </ul>
          <p className="gg-more">
            Written from {p.name}'s own README, website or GitHub page, read on {CHECKED}. Golden Gate is a beta from one author. If anything here is out of date or unfair, <a href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener noreferrer">tell me</a> and I will fix it.
          </p>
        </div>
      </section>
    </GoldenGateShell>
  );
}

export default GoldenGateCompareProduct;
