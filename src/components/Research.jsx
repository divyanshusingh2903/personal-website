import React from "react";

const publications = [
  {
    title: "DataScribe: An AI-Native, Policy-Aligned Web Platform for Multi-Objective Materials Design and Discovery",
    authors: "Department of Materials Science and Engineering, Texas A&M University",
    venue: "Digital Discovery, 2026",
    link: "https://datascribe.cloud",
    abstract:
      "AI-native cloud platform unifying experimental data through knowledge graphs, FAIR-compliant metadata, and multi-objective Bayesian optimization for closed-loop materials discovery workflows.",
    highlights: [
      "Unifies experimental and computational data into a machine-actionable knowledge graph",
      "FAIR metadata capture and schema/units harmonization",
      "Uncertainty-aware surrogate modeling with human-in-the-loop governance",
      "Closed-loop multi-objective Bayesian optimization for materials discovery",
    ],
    keywords: [
      "Materials informatics", "FAIR data", "Ontology", "Knowledge graph",
      "Active learning", "Bayesian optimization", "High-entropy alloys",
    ],
  },
  {
    title: "TRAM-MP: Multi-Person Trajectory and Motion Reconstruction from Videos in the Wild",
    authors: "Divyanshu Singh (Thesis Research)",
    venue: "ArXiv Preprint, 2025",
    link: "https://github.com/divyanshusingh2903/multi-tram",
    abstract:
      "Feed-forward method for reconstructing global trajectories and body motions of multiple people from monocular videos. Achieves comparable error reduction in trajectory estimation compared to leading models with speedup via transformer-based depth estimation.",
    highlights: [
      "Speedup in camera estimation via feed-forward transformer",
      "Error reduction in root trajectory estimation vs. leading models",
      "State-of-the-art accuracy on multi-person benchmarks",
      "Generalizes to diverse human activities beyond MoCap-trained scenarios",
    ],
    keywords: [
      "Computer Vision", "3D Reconstruction", "Human Motion Capture",
      "Deep Learning", "Multi-Person Tracking", "SLAM",
    ],
  },
  {
    title: "Efficient Parallelization of Point Cloud Registration: Spatial Indexing and Multi-Resolution",
    authors: "Divyanshu Singh",
    venue: "ArXiv Preprint, 2025",
    link: "https://github.com/divyanshusingh2903/parallel-icp",
    abstract:
      "Demonstrates significant speedup in classical ICP algorithms through CPU parallelization, multi-resolution refinement, and spatial indexing without specialized hardware.",
    highlights: [
      "MPI-based parallelization with KD-tree spatial indexing",
      "Dynamic multi-resolution adjustment for registration accuracy",
      "Significant speedup over base ICP implementation",
      "No specialized hardware required",
    ],
    keywords: [
      "Point Cloud", "ICP", "Parallel Computing", "MPI", "Spatial Indexing", "3D Processing",
    ],
  },
];

const interests = [
  "ML-Powered Computer Vision",
  "3D Reconstruction & Human Modeling",
  "Multi-Person Tracking",
  "Materials Informatics",
  "Bayesian Optimization",
  "Knowledge Graphs",
];

const Research = () => {
  return (
    <section id="research">
      <div className="section-container">
        <h2 className="section-header">Research</h2>

        <div className="research-interests">
          <h3 className="subsection-label">Interests</h3>
          <div className="interests-list">
            {interests.map((item, i) => (
              <span key={i} className="interest-chip">{item}</span>
            ))}
          </div>
        </div>

        <div className="publications-list">
          <h3 className="subsection-label">Publications</h3>
          {publications.map((pub, i) => (
            <div key={i} className="pub-card">
              <div className="pub-card-top">
                <h3 className="pub-title">{pub.title}</h3>
                <span className="pub-badge">{pub.venue}</span>
              </div>
              <p className="pub-authors">{pub.authors}</p>
              <p className="pub-abstract">{pub.abstract}</p>
              <div className="pub-highlights">
                {pub.highlights.map((h, j) => (
                  <div key={j} className="pub-highlight-row">— {h}</div>
                ))}
              </div>
              <div className="tag-row" style={{ marginTop: "1.2rem" }}>
                {pub.keywords.map((kw, j) => (
                  <span key={j} className="tag">{kw}</span>
                ))}
              </div>
              <a
                className="project-link"
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pub.link.includes("github") ? "View repository ↗" : "View platform ↗"}
              </a>
            </div>
          ))}
        </div>

        <div className="research-note">
          <h3 className="subsection-label">Current Work</h3>
          <p className="about-text">
            As an MS student at Texas A&amp;M, my research focuses on ML-powered
            computer vision for human modeling and 3D reconstruction in dynamic
            multi-person scenes. I also contribute to materials informatics
            research through the DataScribe platform, bridging AI/ML with
            materials science.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Research;
