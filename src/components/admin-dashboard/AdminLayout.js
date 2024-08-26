import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './styles/AdminLayout.css';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { fetchAndStoreProductList } from '../../utils/utils';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if the user has admin permissions
        const hasPermission = await checkAdminPermission();
        if (!hasPermission) {
          throw new Error('Access denied: Admin permissions required.');
        }

        const initializeProductList = async () => {
          try {
            await fetchAndStoreProductList();
            console.log('Product list fetched and stored successfully.');
          } catch (error) {
            console.error('Failed to initialize product list:', error);
          }
        };
    
        initializeProductList();
      } catch (error) {
        console.error('Error during AdminLayout initialization:', error.message);
      }
    };

    init();
  }, []);

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
