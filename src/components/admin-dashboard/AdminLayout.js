import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './styles/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="admin-layout-container">
      <div className="sidebar">
        <h2></h2>
        <h2>Admin Dashboard</h2>
        <ul>
          <li className={isActive('/admin/products') ? 'active' : ''}>
            <Link to="/admin/products">Manage Products</Link>
          </li>
          <li className={isActive('/admin/orders') ? 'active' : ''}>
            <Link to="/admin/orders">Orders</Link>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
