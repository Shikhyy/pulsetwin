import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import LoginPage from '../features/auth/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
      <Route path="/*" element={isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
