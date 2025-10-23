import React, { useState } from 'react';
import '../styles/Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">

      <button
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
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