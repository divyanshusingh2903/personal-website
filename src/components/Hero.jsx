import React from "react";

const Hero = () => {
  const openPDF = () => {
    window.open("/Singh_Divyanshu_Resume.pdf");
  };

  const mailTo = () => {
    window.location.href = "mailto:divyanshusingh2903@gmail.com";
  };

  return (
    <section id="hero">
      <div className="hero-inner">
        <span className="hero-label">Software Engineer & Entrepreneur</span>
        <h1 className="hero-name">Divyanshu<br />Singh</h1>
        <p className="hero-desc">
          Building at the intersection of Cloud, AI, and materials science.
          MS Computer Science at Texas A&amp;M. Founder of Vihayas &amp; PharmIndr.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={openPDF}>Resume</button>
          <button className="btn-outline" onClick={mailTo}>Contact</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
