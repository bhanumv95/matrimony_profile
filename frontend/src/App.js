// frontend/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AIPage from './components/AIPage';
import PaymentPage from './components/PaymentPage';

function App() {
  // Check authentication status by looking for token in localStorage
  const token = localStorage.getItem('token');
  
  return (
    <Routes>
      {/* Default route: if logged in, go to dashboard, otherwise to login */}
      <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected routes: accessible only when token is present */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/ai" element={token ? <AIPage /> : <Navigate to="/login" replace />} />
      <Route path="/payment" element={token ? <PaymentPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
