import React from 'react';
import Navbar from './Navbar';
import About from './About';
import Experience from './Experience';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="app">
      <Navbar />
      <main>
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
