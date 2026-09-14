import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initGA, logPageView } from "./utils/analytics";
import LandingPage from './components/LandingPage';
import RequireAuth from './components/admin/RequireAuth';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import './App.css';

const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

function App() {
  useEffect(() => {
    initGA();       // inisialisasi Google Analytics
    logPageView();  // kirim page view saat halaman pertama kali dibuka
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SpeedInsights />
          <Suspense fallback={<div className="admin-loading">Memuat...</div>}>
          <Routes>
            <Route
              path="/"
              element={
                <PortfolioProvider>
                  <LandingPage />
                </PortfolioProvider>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
