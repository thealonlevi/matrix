import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './styles/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout-container">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        
        <ul>
          <li className={location.pathname === '/admin/products' ? 'active' : ''}>
            <Link to="/admin/products">Manage Products</Link>
          </li>
          <li className={location.pathname === '/admin/createproduct' ? 'active' : ''}>
            <Link to="/admin/createproduct">Create Product</Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
