import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './styles/AdminLayout.css';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { fetchAndStoreProductList } from '../../utils/utils';
import { useNavigate } from 'react-router-dom'; // For redirection

const AdminLayout = () => {
  const [loading, setLoading] = useState(true); // Add a loading state
  const location = useLocation();
  const navigate = useNavigate(); // For navigation

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if the user has admin permissions
        const hasPermission = await checkAdminPermission();
        if (!hasPermission) {
          navigate('/'); // Redirect to the main page
          throw new Error('Access denied: Admin permissions required.');
        }

        // If the user has permission, initialize the product list
        await fetchAndStoreProductList();
        console.log('Product list fetched and stored successfully.');
      } catch (error) {
        console.error('Error during AdminLayout initialization:', error.message);
      } finally {
        setLoading(false); // Set loading to false once check is done
      }
    };

    init();
  }, [navigate]);

  if (loading) {
    // While loading (checking permissions), render nothing or a loader
    return null; // You could also return a spinner or a loading message if desired
  }

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
          <li className={isActive('/admin/users') ? 'active' : ''}>
            <Link to="/admin/users">Manage Users</Link>
          </li>
          <li className={isActive('/admin/staff') ? 'active' : ''}>
            <Link to="/admin/staff">Manage Staff</Link> {/* New Manage Staff link */}
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
