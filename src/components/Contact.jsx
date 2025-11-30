import React from 'react'

const Contact = () => {
  return (
    <section id="contact">
      <div className="contact-container">
        <h3 className="section-header">Get In Touch</h3>
        <div className="contact-content">
          <p className="contact-description">
            I'm always open to discussing new opportunities, collaborations, or just having a chat
            about technology and startups. Feel free to reach out!
          </p>
          <div className="contact-buttons">
            <a
              href="mailto:divyanshusingh2903@gmail.com"
              className="contact-button"
            >
              <span>Email Me</span>
            </a>
            <a
              href="https://github.com/divyanshusingh2903"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-button"
            >
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/divyanshu-singh-75697721b"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-button"
            >
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
