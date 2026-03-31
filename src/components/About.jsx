import React from "react";

const About = () => {
  return (
    <section id="about-me">
      <div className="section-container">
        <h2 className="section-header">About</h2>
        <div className="about-body">
          <p className="about-text">
            From the vibrant streets of India to California — I graduated from
            Texas A&amp;M University with a BS in Computer Science and a minor in
            Mathematics. I'm currently pursuing my MS in CS, focusing on
            machine learning-powered computer vision for 3D reconstruction and
            human modeling.
          </p>
          <p className="about-text">
            As a researcher and engineer, I work at the intersection of AI and
            materials science through the DataScribe platform. I'm also building
            two startups: Vihayas, a multi-cloud infrastructure-as-code
            platform, and PharmIndr, a CDMO discovery platform for the
            pharmaceutical industry.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
