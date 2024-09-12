// src/components/Admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, userInfoUtil } from '../../utils/api'; // Import fetchAllUsers and userInfoUtil from api.js
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
    fetchUsers();
  }, []);

  // Handle role modification
  const handleModifyRole = async (userEmail, newRole) => {
    try {
      const response = await userInfoUtil('PUT', {
        email: userEmail,
        role: newRole,
      });
      console.log(`User role modified: ${response}`);
      fetchUsers(); // Refresh the list after modification
    } catch (error) {
      console.error('Error modifying user role:', error);
      setError('Failed to modify user role. Please check the console for details.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userEmail) => {
    try {
      const response = await userInfoUtil('DELETE', {
        email: userEmail,
      });
      console.log(`User deleted: ${response}`);
      fetchUsers(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please check the console for details.');
    }
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
                <td>{user.role || 'N/A'}</td>
                <td>{user.LastLoginDate ? new Date(user.LastLoginDate).toLocaleString() : 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleModifyRole(user.email, 'admin')}
                    className="modify-role-button"
                  >
                    Promote to Admin
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.email)}
                    className="delete-user-button"
                  >
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
