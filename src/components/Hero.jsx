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
      <div className="main-intro-container">
        <div className="main-intro-name">
          <h1 className="introMainText">
            <span>Hi! I am</span>
            <span>Divyanshu</span>
          </h1>
          <h3 className="introSubText-1">Software Engineer & Entrepreneur</h3>
          <h3 className="introSubText-2">
            Welcome to my digital portfolio! I'm Divyanshu Singh, a software
            engineer passionate about Cloud Computing, AI, and building
            innovative solutions. Currently working on multi-cloud
            infrastructure automation and pharmaceutical technology platforms.
          </h3>
        </div>
        <div className="contact-buttons-container">
          <div className="resume-contact-button" onClick={openPDF}>
            <p>Resume</p>
          </div>
          <div className="resume-contact-button" onClick={mailTo}>
            <p>Contact Me</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
