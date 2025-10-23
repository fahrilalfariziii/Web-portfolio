import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        <div className="footer-socials-centered">
          <a href="https://www.instagram.com/fhrilalfrz?igsh=MXlyazc2dTMxc2pmaQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/src/assets/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://github.com/fahrilalfariziii" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <img src="/src/assets/github.svg" alt="GitHub" />
          </a>
          <a href="https://www.linkedin.com/in/fahril-sidik-alfarizi/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <img src="/src/assets/linkedin.svg" alt="LinkedIn" />
          </a>
        </div>
        <div className="footer-license">
          <span className="copyright">© 2025 | Fahril Sidik Alfarizi</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;