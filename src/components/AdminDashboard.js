// src/components/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li>
            <Link to="/admin/products">Manage Products</Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
      <div className="main-content">
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Select an option from the sidebar to manage your store.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
