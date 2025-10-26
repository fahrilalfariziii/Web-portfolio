import React from "react";
import { useEffect } from "react";
import { trackSectionView } from "../utils/analytics";
import "../styles/Contact.css";

const Contact = () => {
  useEffect(() => {
    trackSectionView("contact");
  }, []);

  return (
    <section id="contact" className="contact">
      <h2>CONTACT</h2>
      {/* <p>Let's Works Together</p> */}
      
      <div className="contact-content">
        <div className="contact-info">
          <div className="info-item">
            <h3>EMAIL</h3>
            <p>
              <a href="mailto:fahrilsidik207@gmail.com" className="contact-link">
                fahrilsidik207@gmail.com
              </a>
            </p>
          </div>
          
          <div className="info-item">
            <h3>LOCATION</h3>
            <p>West Java, Indonesia</p>
          </div>
        </div>

        <form className="contact-form" action="https://formspree.io/f/xeopjjeg" method="POST">
          <div className="form-group">
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Name" 
              required 
              autoComplete="name"
              aria-label="Your name"
            />
          </div>
          
          <div className="form-group">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              required 
              autoComplete="email"
              aria-label="Your email address"
            />
          </div>
          
          <div className="form-group">
            <textarea 
              id="message" 
              name="message" 
              placeholder="Message" 
              rows="6" 
              required
              aria-label="Your message"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-button" aria-label="Send message">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
