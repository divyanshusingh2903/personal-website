import React from "react";

const Experience = () => {
  return (
    <section id="experience">
      <div className="qualifications-main-container">
        <div className="experience-sub-section">
          <h3 className="sub-section-header">Experience</h3>

          <div className="sub-section-title-container">
            <img
              className="experience-image"
              src="/tamu-box-logo.png"
              alt="Texas A&M"
              onClick={() => window.open("https://www.tamu.edu/")}
            />
            <h2 className="sub-section-title">
              Student Software Intern - Texas A&M University
            </h2>
          </div>
          <p className="sub-section-date">
            Feb. 2024 - Present | College Station, TX
          </p>
          <h1 className="sub-section-content">
            Serve as the primary developer of the DataScribe.Cloud data
            management platform, adopted by researchers across multiple
            universities and national laboratories for materials science
            research and discovery.
          </h1>
          <h1 className="sub-section-content">
            Contributed to the development of agentic AI components to support
            intelligent data workflows and collaborative research tasks,
            implementing machine learning algorithms for automated data
            analysis.
          </h1>
          <h1 className="sub-section-content">
            Designed and deployed AI-driven algorithms for data table schema
            recommendations, duplicate data detection, and automated data
            analysis, improving research efficiency by 40%.
          </h1>
          <h1 className="sub-section-content">
            Developed a scalable microservices architecture and deployed
            containerized infrastructure using Docker and Kubernetes to
            streamline continuous integration and deployment pipelines.
          </h1>
          <h1 className="sub-section-content">
            Authored a research paper on the DataScribe platform, scheduled for
            publication in an academic journal in 2025.
          </h1>

          <div className="sub-section-title-container">
            <img
              className="experience-image"
              src="/exabeam-logo.png"
              alt="Exabeam"
              onClick={() => window.open("https://www.exabeam.com/")}
            />
            <h2 className="sub-section-title">
              Software Engineer Intern - Exabeam Inc.
            </h2>
          </div>
          <p className="sub-section-date">May - Aug. 2023 | Foster City, CA</p>
          <h1 className="sub-section-content">
            Implemented Prometheus and Grafana-based observability solutions,
            enabling real-time tracking of critical systems and reducing
            downtime by 30% through proactive monitoring.
          </h1>
          <h1 className="sub-section-content">
            Developed a RESTful API using Spring Boot for a cost analysis tool,
            allowing developers to assess the impact of code changes on job
            costs, resulting in 25% cost reduction in cloud resources.
          </h1>
          <h1 className="sub-section-content">
            Deployed the cost analysis tool to Google Cloud Functions, ensuring
            scalable execution and efficient resource utilization across
            multiple environments.
          </h1>
          <h1 className="sub-section-content">
            Conducted security audits across GitHub repositories, identifying
            and remediating CVEs to enhance overall system security and maintain
            compliance standards.
          </h1>

          <div className="sub-section-title-container">
            <img
              className="experience-image"
              src="/tamu-box-logo.png"
              alt="Texas A&M"
              onClick={() => window.open("https://www.tamu.edu/")}
            />
            <h2 className="sub-section-title">
              Teaching Assistant - Texas A&M University
            </h2>
          </div>
          <p className="sub-section-date">Spring 2024 | College Station, TX</p>
          <h1 className="sub-section-content">
            Created Bash scripts for automated testing and grading, improving
            efficiency in assignment evaluation by 60% and reducing grading
            turnaround time from 5 days to 2 days.
          </h1>
          <h1 className="sub-section-content">
            Conducted lab sessions and office hours, enhancing student
            understanding of C++ programming concepts including data structures,
            algorithms, and object-oriented programming.
          </h1>
          <h1 className="sub-section-content">
            Collaborated on developing instructional materials, contributing to
            improved course content and delivery for 200+ students per semester.
          </h1>

          <div className="sub-section-title-container">
            <img
              className="experience-image"
              src="/tamu-box-logo.png"
              alt="Texas A&M"
              onClick={() => window.open("https://www.tamu.edu/")}
            />
            <h2 className="sub-section-title">
              Researcher - Texas A&M University
            </h2>
          </div>
          <p className="sub-section-date">2022 - 2023 | College Station, TX</p>
          <h1 className="sub-section-content">
            Conducted research in Graph Mining and Cybersecurity, optimizing
            graph mining systems with focus on runtime support and developing
            novel algorithms for large-scale graph analysis.
          </h1>
          <h1 className="sub-section-content">
            Converted extensive JSON datasets into actionable graphs using
            Python, C++, and graph data structures, processing over 1TB of
            cybersecurity data.
          </h1>
          <h1 className="sub-section-content">
            Leveraged Linux SSH access for efficient processing on university
            HPC clusters, achieving 10× speedup in data processing pipelines
            through parallelization.
          </h1>
        </div>

        <div className="qualifications-sub-section-container">
          <div className="sub-section">
            <h3 className="sub-section-header">Education</h3>
            <h1 className="sub-section-content">
              <b>Texas A&M University,</b> College of Engineering, College
              Station, TX
            </h1>
            <h1 className="sub-section-content">
              <b>Master of Science,</b> Computer Science
            </h1>
            <h1 className="sub-section-content">
              <b>Expected Graduation:</b> May 2026
            </h1>
            <h1 className="sub-section-content">
              <b>Research Focus:</b> Machine Learning-Powered Computer Vision
              for Human Modeling and 3D Reconstruction in Dynamic Scenes with
              Multiple Bodies
            </h1>
            <h1 className="sub-section-content" style={{ marginTop: "20px" }}>
              <b>Bachelor of Science,</b> Computer Science
            </h1>
            <h1 className="sub-section-content">
              <b>Minor:</b> Mathematics
            </h1>
            <h1 className="sub-section-content">
              <b>Graduated:</b> December 2024
            </h1>
            <h1 className="sub-section-content">
              <b>Relevant Courses:</b> Machine Learning, Artificial
              Intelligence, Operating Systems, Distributed Systems, Networks &
              Distributed Processing, Quantum Algorithms, Deep Reinforcement
              Learning, Deep Learning, Parallel Algorithms
            </h1>
          </div>

          <div className="sub-section">
            <h3 className="sub-section-header">Skills</h3>
            <h1 className="sub-section-content">
              <b>Certifications:</b> AWS Cloud Practitioner
            </h1>
            <h1 className="sub-section-content">
              <b>Programming Languages:</b> Java, Python, C/C++, JavaScript,
              TypeScript, SQL, HTML, CSS
            </h1>
            <h1 className="sub-section-content">
              <b>Frameworks:</b> React, Flutter, Spring/Spring Boot, Node.js
            </h1>
            <h1 className="sub-section-content">
              <b>Cloud & Tools:</b> AWS, Google Cloud Platform, Azure, Docker,
              Kubernetes, GitHub, Linux/Unix
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
