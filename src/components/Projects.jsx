import React from "react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Harbinger — Predictive Multi-Level Message Queue",
    description:
      "Research messaging system combining online ML-based processing-time prediction with Multi-Level Feedback Queue scheduling to reduce end-to-end message latency. Phase 1 includes a C++20 gRPC broker with priority queues, aging-based starvation prevention, retries, and a dead-letter queue.",
    link: "https://github.com/divyanshusingh2903/predictive-multi-level-message-queue",
    tags: ["C++20", "gRPC", "Protocol Buffers", "Machine Learning", "Distributed Systems"],
    status: "In Development",
  },
  {
    title: "Forge",
    image: "/forge-mark.svg",
    description:
      "Personal, human-in-the-loop fork of OpenCode — steered closer to how Claude Code feels: more transparent about what the agent is about to do before it does it, and less inclined to act autonomously. Real GitHub fork sharing upstream history.",
    link: "/forge",
    tags: ["TypeScript", "Bun", "AI Agents", "SolidJS", "Electron"],
    status: "In Development",
  },
  {
    title: "Vihayas",
    image: "/vihayas.png",
    description:
      "New IaC platform unifying AWS, GCP, and Azure under a single JSON-like configuration syntax. Features an AI-powered Kubernetes management module with smart HPA/VPA scaling and a cross-platform catalog service that generates full infrastructure solutions from natural language requirements.",
    link: "https://vihayas.com",
    tags: ["Cloud", "IaC", "AWS", "GCP", "Azure", "Kubernetes", "AI"],
    status: "In Development",
  },
  {
    title: "PharmFindr",
    image: "/pharmfindr.png",
    description:
      '"Yelp meets G2" for pharmaceutical CDMOs — a centralized platform solving the fragmented information problem in pharmaceutical outsourcing. Enables discovery, comparison, and peer reviews of Contract Development and Manufacturing Organizations for pharma/biotech companies.',
    link: "https://pharmfindr.com",
    tags: ["Go", "PostgreSQL", "MongoDB", "Redis", "SaaS", "B2B"],
    status: "In Development",
  },
  {
    title: "Ipelint MVP 2 — AI Patent Analysis",
    description:
      "Fine-tuned NLP models for patent prosecution analysis: keyword/anti-keyword identification, topic modeling, and prior art search — collaborated directly with IP attorneys to validate outputs. Built a Computer Vision model for patent diagram analysis integrated into the core patent search pipeline.",
    link: "https://ipelint.com",
    tags: ["Python", "TensorFlow", "PyTorch", "NLTK", "Scikit-learn", "AWS Bedrock"],
    status: "Completed",
  },
  {
    title: "Camera View Selection for 3D Reconstruction",
    description:
      "Deep Reinforcement Learning approach for optimal camera view selection in multi-view 3D reconstruction. Custom Gym environment integrating COLMAP. DQN agent balancing accuracy with computational efficiency.",
    link: "https://github.com/divyanshusingh2903/Image-Selection-for-3D-reconstruction",
    tags: ["Python", "OpenAI Gym", "COLMAP", "Deep RL"],
    status: "Completed",
  },
  {
    title: "Parallel ICP — Point Cloud Registration",
    description:
      "ICP algorithm for 3D point cloud registration with MPI-based parallelization. KD-tree spatial indexing and dynamic resolution adjustment. Achieved 76× speedup over base implementation.",
    link: "https://github.com/divyanshusingh2903/parallel-icp",
    tags: ["C++", "MPI", "OpenMP", "Parallel Computing"],
    status: "Completed",
  },
  {
    title: "Football Stats App",
    image: "/score-z-com.png",
    description:
      "Cloud-native app for live scores and historical data. SpringBoot + PostgreSQL backend, Flutter frontend, deployed on AWS (EC2, S3, RDS, Route 53, VPC).",
    tags: ["SpringBoot", "Flutter", "AWS", "PostgreSQL"],
    status: "Defunct",
  },
  {
    title: "Scientific Calculator",
    image: "/unnamed.png",
    description:
      "Comprehensive calculator in Flutter with Euler's number, trig functions, factorials, powers, and roots. 15,000+ downloads on Google Play Store.",
    tags: ["Flutter", "Mobile"],
    status: "Defunct",
  },
];

const Projects = () => {
  return (
    <section id="projects">
      <div className="section-container">
        <h2 className="section-header">Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-card-top">
                {project.image && (
                  <div className="project-image-wrap">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="project-image"
                      onClick={() => project.link && window.open(project.link)}
                      style={{ cursor: project.link ? "pointer" : "default" }}
                    />
                  </div>
                )}
                <h3 className="project-title">{project.title}</h3>
                <span
                  className={`status-badge status-${project.status.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="project-desc">{project.description}</p>
              <div className="tag-row">
                {project.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              {project.link &&
                (project.link.startsWith("/") ? (
                  <Link className="project-link" to={project.link}>
                    View project ↗
                  </Link>
                ) : (
                  <a
                    className="project-link"
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View project ↗
                  </a>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
