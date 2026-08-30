import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import LoginPage from '../features/auth/LoginPage';
import LandingPage from '../features/landing/LandingPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Login — if already authenticated, go to app */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/app" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />

      {/* Protected app shell */}
      <Route
        path="/app/*"
        element={isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />}
      />

      {/* Catch-all: redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
