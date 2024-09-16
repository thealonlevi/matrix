// src/components/Admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, userInfoUtil } from '../../utils/api'; // Import fetchAllUsers from api.js
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import checkAdminPermission
import './styles/ManageUsers.css'; // Import relevant styles

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check if the user has admin permissions
        const hasPermission = await checkAdminPermission();
        if (!hasPermission) {
          throw new Error('Access denied: Admin permissions required.');
        }
        // Fetch users if the user has admin permissions
        await fetchUsers();
      } catch (error) {
        console.error('Error during ManageUsers initialization:', error.message);
        setError(error.message);
        // Redirect the user to the home page or login page if they don't have permissions
        navigate('/');
      }
    };

    init();
  }, [navigate]);

  // Handle role modification
  const handleRoleChange = async (userId, newRole) => {
    console.log(`Modify role for user ${userId} to ${newRole}`);
    try {
      // Update user role using userInfoUtil
      await userInfoUtil('POST', {
        email: users.find(user => user.userId === userId).email,
        role: newRole,
      });
      
      // Update the users state to reflect the change
      setUsers(users.map(user => (user.userId === userId ? { ...user, role: newRole } : user)));
      console.log(`User role updated successfully for ${userId} to ${newRole}`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      setError('Failed to update user role. Please check the console for details.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    console.log(`Delete user ${userId}`);
    // Here you'd call another API function to delete the user in your backend
  };

  return (
    <div className="manage-users-container">
      <h1 className="manage-users-title">Manage Users</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>User ID</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>{user.email}</td>
                <td>{user.userId}</td>
                <td>
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                    className="role-select-dropdown"
                  >
                    <option value="user">user</option>
                    <option value="support">support</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{user.LastLoginDate ? new Date(user.LastLoginDate).toLocaleString() : 'N/A'}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.userId)} className="delete-user-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
