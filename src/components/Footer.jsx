import React from 'react';
import { usePortfolioContext } from '../context/PortfolioContext';
import '../styles/Footer.css';

const Footer = () => {
  const { siteSettings } = usePortfolioContext();
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-license">
          <span className="copyright">{siteSettings?.footer_text || '© 2025 | Fahril Sidik Alfarizi'}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;