import React from "react";

const Projects = () => {
  const projects = [
    {
      title: "Vihayas",
      image: "/vihayas.png",
      description:
        "Multi-cloud Infrastructure-as-Code platform with unified syntax across AWS, GCP, and Azure. Features include infrastructure schema definition, JSON-based IaC code generation, and future plans for monitoring systems and AI-powered infrastructure management with automated issue resolution.",
      link: "https://vihayas.com",
      tags: ["Cloud Computing", "IaC", "AWS", "GCP", "Azure", "AI"],
      status: "In Development",
    },
    {
      title: "PharmIndr",
      image: "/pharmindr.png",
      description:
        '"Yelp meets G2" for pharmaceutical CDMOs - a centralized platform solving the fragmented information problem in pharmaceutical outsourcing. Enables discovery, comparison, and peer reviews of Contract Development and Manufacturing Organizations for pharma/biotech companies.',
      link: "https://pharmindr.com",
      tags: ["SaaS", "Pharmaceutical", "Platform", "B2B"],
      status: "In Development",
    },
    {
      title: "Ipelint MVP 2: AI-Powered Patent Analysis",
      description:
        "Developed AI models for Ipelint, a startup focused on patent prosecution analysis. Implemented keyword/anti-keyword identification, diagram analysis using Computer Vision, fine-tuning techniques, and topic modeling to enhance prior art search capabilities. Collaborated with subject matter experts to gain domain knowledge in intellectual property and patent law.",
      link: "https://ipelint.com",
      tags: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "NLTK",
        "Scikit-learn",
        "AWS Bedrock",
        "Computer Vision",
      ],
      status: "Completed",
    },
    {
      title:
        "Camera View Selection for 3D Reconstruction using Deep Reinforcement Learning",
      description:
        "Developed Deep Reinforcement Learning approach to intelligently select optimal camera views for multi-view 3D reconstruction. Implemented custom Gym-compatible environment integrating with COLMAP for reconstruction quality metrics. Trained DQN agent for sequential view selection, balancing accuracy with computational efficiency.",
      link: "https://github.com/divyanshusingh2903/Image-Selection-for-3D-reconstruction",
      tags: ["Python", "OpenAI Gym", "COLMAP", "Deep RL", "3D Reconstruction"],
      status: "Completed",
    },
    {
      title: "Parallel ICP Algorithm for Point Cloud Registration",
      description:
        "Implemented Iterative Closest Point (ICP) algorithm for 3D point cloud registration with MPI-based parallelization. Applied optimization strategies including dynamic resolution adjustment and KD-tree spatial indexing. Achieved 76× speedup compared to base implementation through parallel processing optimization.",
      link: "https://github.com/divyanshusingh2903/parallel-icp",
      tags: ["C++", "MPI", "OpenMP", "Parallel Computing", "3D Processing"],
      status: "Completed",
    },
    {
      title: "Football Stats App",
      description:
        "Cloud-native app delivering live scores and historical data for leagues, teams, and players. Built with SpringBoot and PostgreSQL backend, Flutter frontend, deployed on AWS (EC2, S3, RDS, Route 53, VPC).",
      image: "/score-z-com.png",
      tags: ["SpringBoot", "Flutter", "AWS", "PostgreSQL"],
      status: "Defunct",
    },
    {
      title: "Scientific Calculator",
      description:
        "Comprehensive mathematical calculator built with Flutter featuring Euler's number, trigonometric functions, factorials, powers, and roots. Over 15,000 downloads on Google Play Store.",
      image: "/unnamed.png",
      tags: ["Flutter", "Mobile", "Mathematics"],
      status: "Defunct",
    },
  ];

  const openLink = (link) => {
    if (link) window.open(link);
  };

  return (
    <section id="projects">
      <div className="projects-container">
        <h2 className="section-header">Projects</h2>
        {projects.map((project, index) => (
          <div key={index} className="project">
            <div className="project-header-container">
              <h3 className="project-header">{project.title}</h3>
              {project.status && (
                <span className="project-status">{project.status}</span>
              )}
            </div>
            {project.image && (
              <img
                className="project-image"
                src={project.image}
                alt={project.title}
                onClick={() => openLink(project.link)}
              />
            )}
            <h2 className="project-description">{project.description}</h2>
            <div className="project-tags">
              {project.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            {project.link && (
              <div className="project-link-container">
                <button
                  className="project-link-button"
                  onClick={() => openLink(project.link)}
                >
                  <p>View Project →</p>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
