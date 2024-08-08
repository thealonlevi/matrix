import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminSidebar.css';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2>Admin Dashboard</h2>
      <nav>
        <ul>
          <li>
            <Link to="/admin/products">Products</Link>
          </li>
          {/* Add more links here for other admin functionalities */}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
