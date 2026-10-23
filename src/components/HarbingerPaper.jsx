import Shell, { Top } from "../harbinger/Shell";
import { SectionNav } from "../harbinger/Ui";
import paperBody from "../harbinger/paperBody.html?raw";
import "../harbinger/harbinger.css";

const NAV = [
  { id: "sec:intro", label: "Introduction" },
  { id: "sec:related", label: "Related work" },
  { id: "sec:design", label: "Design" },
  { id: "sec:method", label: "Evaluation method" },
  { id: "sec:results", label: "Results" },
  { id: "sec:limits", label: "Limitations" },
  { id: "conclusion", label: "Conclusion" },
  { id: "app:criteria", label: "Appendix" },
  { id: "references", label: "References" },
];

export default function HarbingerPaper() {
  return (
    <Shell title="Harbinger paper | Size-based scheduling for message queues">
      <section className="hb-hero hb-hero-short">
        <Top />
        <div className="hb-hero-head">
          <p className="hb-eyebrow">Paper</p>
          <h1>Size-based scheduling for message queues, from per-key duration statistics.</h1>
          <p className="hb-lede">Divyanshu Singh. The full write-up, with the design, the pre-registered evaluation and the limits.</p>
        </div>
      </section>

      <SectionNav items={NAV} />

      <div className="hb-page">
        <article className="pp-paper" dangerouslySetInnerHTML={{ __html: paperBody }} />
      </div>
    </Shell>
  );
}
