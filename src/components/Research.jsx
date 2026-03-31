import React from "react";

const Research = () => {
  const publications = [
    {
      title:
        "DataScribe: An AI-Native, Policy-Aligned Web Platform for Multi-Objective Materials Design and Discovery",
      authors:
        "Department of Materials Science and Engineering, Texas A&M University",
      status: "In Preparation - Expected Publication: 2025",
      link: "https://datascribe.cloud",
      abstract:
        "Materials innovation remains constrained by fragmented data, weak experiment–computation coupling, and slow iteration cycles that often exceed a decade from concept to deployment. We introduce DataScribe, an AI-native, ontology-aligned web platform that unifies heterogeneous experimental and computational data into a machine-actionable knowledge graph and couples it with real-time multi-objective Bayesian optimization (MOBO) and active learning.",
      keywords: [
        "Materials informatics",
        "FAIR data",
        "Ontology",
        "Knowledge graph",
        "Active learning",
        "Multi-objective Bayesian optimization",
        "High-entropy alloys",
        "Energy materials",
        "Digital twins",
        "Uncertainty quantification",
        "Supply-chain resilience",
      ],
      highlights: [
        "Unifies experimental and computational data into machine-actionable knowledge graph",
        "Integrates FAIR metadata capture and schema/units harmonization",
        "Implements uncertainty-aware surrogate modeling and human-in-the-loop governance",
        "Demonstrates 20× speedup in materials discovery iteration cycles",
        "Case studies in energy materials and high-entropy alloys",
      ],
    },
    {
      title:
        "TRAM-MP: Multi-Person Trajectory and Motion Reconstruction from Videos in the Wild",
      authors: "Divyanshu Singh (Thesis Research)",
      status: "In Preparation - Expected Publication: 2025",
      link: "https://github.com/divyanshusingh2903/multi-tram",
      abstract:
        "We present TRAM-MP, a feed-forward method for reconstructing global trajectories and body motions of multiple people from monocular videos with moving cameras. Building on TRAM's scene-centric philosophy, we extend it to multi-person scenarios through three key contributions.",
      keywords: [
        "Computer Vision",
        "3D Reconstruction",
        "Human Motion Capture",
        "Deep Learning",
        "Multi-Person Tracking",
        "SLAM",
      ],
      highlights: [
        "20-30× speedup in camera estimation using feed-forward transformer",
        "60% error reduction in root trajectory estimation (RTE: 1.4% vs 10.2%)",
        "State-of-the-art accuracy on multi-person benchmarks",
        "Feed-forward processing: ~12 seconds for 100 frames with 10 people",
        "Generalizes to diverse human activities beyond MoCap-trained scenarios",
        "Novel depth consistency constraints for metric-scale accuracy",
      ],
    },
  ];

  const researchInterests = [
    "Machine Learning-Powered Computer Vision",
    "3D Reconstruction and Human Modeling",
    "Multi-Person Tracking in Dynamic Scenes",
    "Materials Informatics and AI-Driven Discovery",
    "Bayesian Optimization and Active Learning",
    "Knowledge Graphs and Ontology Engineering",
  ];

  return (
    <section id="research">
      <div className="research-container">
        <h2 className="section-header">Research</h2>

        <div className="research-interests-section">
          <h3 className="subsection-title">Research Interests</h3>
          <div className="interests-grid">
            {researchInterests.map((interest, index) => (
              <div key={index} className="interest-tag">
                {interest}
              </div>
            ))}
          </div>
        </div>

        <div className="publications-section">
          <h3 className="subsection-title">Publications</h3>
          <p className="publications-note">
            The following publications are currently in preparation and expected
            to be published in 2025.
          </p>

          {publications.map((pub, index) => (
            <div key={index} className="publication">
              <div className="publication-header">
                <h3 className="publication-title">{pub.title}</h3>
                <span className="publication-status">{pub.status}</span>
              </div>

              <p className="publication-authors">{pub.authors}</p>

              <div className="publication-abstract">
                <h4>Abstract</h4>
                <p>{pub.abstract}</p>
              </div>

              <div className="publication-highlights">
                <h4>Key Contributions</h4>
                <ul>
                  {pub.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="publication-keywords">
                <h4>Keywords</h4>
                <div className="keyword-list">
                  {pub.keywords.map((keyword, i) => (
                    <span key={i} className="keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {pub.link && (
                <div className="publication-link-container">
                  <button
                    className="publication-link-button"
                    onClick={() => window.open(pub.link)}
                  >
                    <span>
                      {pub.link.includes("github")
                        ? "View Repository →"
                        : "View Platform →"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="research-experience-note">
          <h3 className="subsection-title">Current Research</h3>
          <p className="research-note-text">
            As a Master's student in Computer Science at Texas A&M University,
            my research focuses on machine learning-powered computer vision for
            human modeling and 3D reconstruction in dynamic scenes with multiple
            bodies. I am also contributing to materials informatics research
            through my work on the DataScribe platform, bridging AI/ML
            techniques with materials science applications.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Research;
