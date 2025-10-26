import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  // Ensure hamburger menu is visible on mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const hamburger = document.querySelector('.hamburger');
      if (hamburger && isMobile) {
        hamburger.style.display = 'flex';
        hamburger.style.visibility = 'visible';
        hamburger.style.opacity = '1';
      }
    };

    // Check on mount
    handleResize();
    
    // Check on resize
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">

      <button
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
        style={{
          display: window.innerWidth <= 768 ? 'flex' : 'none',
          visibility: window.innerWidth <= 768 ? 'visible' : 'hidden',
          opacity: window.innerWidth <= 768 ? '1' : '0'
        }}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="nav-center">
        <div className={`nav-links ${open ? 'open' : ''}`}>
          <a href="#home" onClick={() => setOpen(false)}>Home</a>
          <a href="#experience" onClick={() => setOpen(false)}>Experience</a>
          <a href="#skills" onClick={() => setOpen(false)}>Skills</a>
          <a href="#projects" onClick={() => setOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </div>
      </div>
      <div className="nav-right">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;