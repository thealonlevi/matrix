import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './styles/AdminDashboard.css';
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Adjust the path as needed

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // To get the current URL

  useEffect(() => {
    const verifyAccess = async () => {
      const hasPermission = await checkAdminPermission();

      if (!hasPermission) {
        setError('Page not found.');
        setTimeout(() => {
          navigate('/');  // Redirect to the home page after 2 seconds
        }, 2000);
      } else {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li>
            <Link
              to="/admin/products"
              className={location.pathname === '/admin/products' ? 'active' : ''}
            >
              Manage Products
            </Link>
          </li>
          {/* Add more links as needed, with similar logic for highlighting */}
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
