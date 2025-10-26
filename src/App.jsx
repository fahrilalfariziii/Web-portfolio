// import React from 'react'
import React, { useEffect } from "react";
import { initGA, logPageView } from "./utils/analytics";
import Navbar from './components/Navbar'
import About from './components/About'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from "./components/Contact";
import Footer from './components/Footer'
import { ThemeProvider } from './context/ThemeContext'
import { SpeedInsights } from "@vercel/speed-insights/react";
import './App.css'

function App() {
  useEffect(() => {
    initGA();       // inisialisasi Google Analytics
    logPageView();  // kirim page view saat halaman pertama kali dibuka
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <SpeedInsights />
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
    </ThemeProvider>
    
  )
}

export default App
