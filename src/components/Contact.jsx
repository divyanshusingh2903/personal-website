import React from "react";

const Contact = () => {
  return (
    <section id="contact">
      <div className="contact-inner">
        <span className="hero-label">Contact</span>
        <h2 className="contact-heading">Let's work together.</h2>
        <p className="contact-sub">
          Open to research collaborations, engineering roles, and startup conversations.
        </p>
        <div className="contact-links">
          <a href="mailto:divyanshusingh2903@gmail.com" className="contact-email">
            divyanshusingh2903@gmail.com
          </a>
          <div className="contact-socials">
            <a
              href="https://github.com/divyanshusingh2903"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/divyanshu-singh-75697721b"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
