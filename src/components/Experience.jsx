import React from "react";

const jobs = [
  {
    logo: "/tamu-box-logo.png",
    logoAlt: "Texas A&M",
    logoLink: "https://www.tamu.edu/",
    role: "Student Software Engineer",
    company: "Texas A&M University",
    location: "College Station, TX",
    date: "Feb 2024 – Present",
    bullets: [
      "Led full-stack development of DataScribe.Cloud, a research data platform adopted by teams at multiple universities and national labs. Primary developer from MVP to production.",
      "Built and deployed an LLM-powered research agent with RAG-based materials science Q&A and dynamic ML workflow orchestration, enabling researchers to trigger complex pipelines in natural language.",
      "Architected automated CI/CD pipeline (Docker + Kubernetes) reducing deployment from 2 hours of manual work to a fully automated ~5-minute process.",
    ],
  },
  {
    logo: "/exabeam-logo.png",
    logoAlt: "Exabeam",
    logoLink: "https://www.exabeam.com/",
    role: "Software Engineering Intern",
    company: "Exabeam Inc.",
    location: "Foster City, CA",
    date: "May – Aug 2023",
    bullets: [
      "Built a Spring Boot REST API cost-analysis tool giving developers real-time visibility into the compute cost impact of code changes, used by the data engineering team.",
      "Designed and deployed Prometheus + Grafana observability from scratch for the core threat scoring engine — first real-time visibility into pipeline health, enabling previously impossible incident detection.",
      "Conducted security audits across 15+ repositories, identified and remediated critical/high-severity CVEs.",
    ],
  },
  {
    logo: "/tamu-box-logo.png",
    logoAlt: "Texas A&M",
    logoLink: "https://www.tamu.edu/",
    role: "Teaching Assistant",
    company: "Texas A&M University",
    location: "College Station, TX",
    date: "Spring 2024 – Present",
    bullets: [
      "C++, Quantum Computing, Programming Languages — ~150 students/semester.",
      "Automated assignment grading pipeline with Bash scripts, cutting TA grading time by ~60% per coding assignment cycle.",
    ],
  },
  {
    logo: "/tamu-box-logo.png",
    logoAlt: "Texas A&M",
    logoLink: "https://www.tamu.edu/",
    role: "Researcher",
    company: "Texas A&M University",
    location: "College Station, TX",
    date: "2022 – 2023",
    bullets: [
      "Graph Mining and Cybersecurity research — optimizing graph mining systems and developing novel algorithms for large-scale graph analysis.",
      "Processed 1TB+ of cybersecurity data converting JSON datasets into actionable graphs using Python and C++.",
      "10× speedup in data processing pipelines via parallelization on university HPC clusters.",
    ],
  },
];

const skillGroups = [
  { label: "Languages", value: "JavaScript, TypeScript, Python, GoLang, C/C++, MATLAB, SQL, Haskell" },
  { label: "Frameworks", value: "React.js, Flutter, Spring/Spring Boot, Express.js, Flask, Go-Chi" },
  { label: "Tools", value: "AWS (Cloud Practitioner), Google Cloud Platform, Docker, Kubernetes, GitHub, Linux/Unix" },
  { label: "Databases", value: "PostgreSQL, MongoDB, Redis" },
];

const Experience = () => {
  return (
    <section id="experience">
      <div className="section-container">
        <h2 className="section-header">Experience</h2>
        <div className="exp-layout">

          {/* Timeline */}
          <div className="exp-timeline">
            {jobs.map((job, i) => (
              <div key={i} className="exp-entry">
                <div className="exp-entry-head">
                  <img
                    src={job.logo}
                    alt={job.logoAlt}
                    className="exp-logo"
                    onClick={() => window.open(job.logoLink)}
                  />
                  <div className="exp-entry-meta">
                    <h3 className="exp-role">{job.role}</h3>
                    <span className="exp-company">{job.company} · {job.location}</span>
                  </div>
                  <span className="exp-date">{job.date}</span>
                </div>
                <ul className="exp-bullets">
                  {job.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Sidebar — Education + Skills, no separation */}
          <div className="exp-sidebar">
            <span className="sidebar-label">Education</span>

            <div className="edu-entry">
              <div className="edu-degree">MS Computer Science</div>
              <div className="edu-school">Texas A&M University</div>
              <div className="edu-detail">GPA: 3.85 · Expected May 2026</div>
              <div className="edu-detail" style={{ marginTop: "0.4rem" }}>
                ML-aided Computer Vision for Human 3D Reconstruction in Dynamic Scenes
              </div>
            </div>

            <div className="edu-entry">
              <div className="edu-degree">BS Computer Science</div>
              <div className="edu-school">Texas A&M University · Minor: Mathematics</div>
              <div className="edu-detail">December 2024</div>
              <div className="edu-detail" style={{ marginTop: "0.4rem" }}>
                Machine Learning · AI · OS · Distributed Systems · Deep RL · Quantum Algorithms · Parallel Algorithms
              </div>
            </div>

            <div className="sidebar-divider" />

            <span className="sidebar-label">Skills</span>
            {skillGroups.map((g, i) => (
              <div key={i} className="skills-group">
                <span className="skills-category">{g.label}</span>
                <p className="skills-value">{g.value}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Experience;
