import React from 'react'
import Navbar from './components/Navbar'
import About from './components/About'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Footer from './components/Footer'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Navbar />
        <main>
          <About />
          <Experience />
          <Skills />
          <Projects />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
