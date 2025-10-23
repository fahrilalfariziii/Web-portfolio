import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { loadGA } from './utils/ga'

// Load Google Analytics only when VITE_GA_ID is provided
const gaId = import.meta.env.VITE_GA_ID;
if (gaId) {
  loadGA(gaId);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
