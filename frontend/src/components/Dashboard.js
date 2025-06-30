// frontend/src/components/Dashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');  // get the logged-in user's name

  const handleLogout = () => {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Welcome, {name || "User"}!</h2>
      <p>You are logged in. Choose an option below:</p>
      <ul>
        <li><Link to="/ai">AI-Powered Biodata Generator</Link></li>
        <li><Link to="/payment">Upgrade Plan (Payment)</Link></li>
      </ul>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default Dashboard;
