import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './styles/AdminLayout.css';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { fetchAndStoreProductList } from '../../utils/utils';
import { useNavigate } from 'react-router-dom'; // For redirection

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const init = async () => {
      try {
        const hasPermission = await checkAdminPermission();
        if (!hasPermission) {
          navigate('/');
          throw new Error('Access denied: Admin permissions required.');
        }
        await fetchAndStoreProductList();
      } catch (error) {
        console.error('Error during AdminLayout initialization:', error.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  if (loading) {
    return null; 
  }

  return (
    <div className="admin-layout-container">
      <div className="sidebar">
        <h2></h2>
        <h2>Admin Dashboard</h2>
        <ul>
          <li className={isActive('/admin/statistics') ? 'active' : ''}>
            <Link to="/admin/statistics">Statistics</Link> {/* New Statistics link */}
          </li>
          <li className={isActive('/admin/products') ? 'active' : ''}>
            <Link to="/admin/products">Manage Products</Link>
          </li>
          <li className={isActive('/admin/orders') ? 'active' : ''}>
            <Link to="/admin/orders">Orders</Link>
          </li>
          <li className={isActive('/admin/users') ? 'active' : ''}>
            <Link to="/admin/users">Manage Users</Link>
          </li>
          <li className={isActive('/admin/staff') ? 'active' : ''}>
            <Link to="/admin/staff">Manage Staff</Link>
          </li>
          <li className={isActive('/admin/support-tickets') ? 'active' : ''}>
            <Link to="/admin/support-tickets">Support Tickets</Link>
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
