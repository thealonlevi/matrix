// src/components/Admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, userInfoUtil, addCredit, removeCredit } from '../../utils/api'; // Import necessary API functions
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import checkAdminPermission
import { useNotification } from './utils/Notification'; // Import notification hook
import './styles/ManageUsers.css'; // Import relevant styles

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAction, setSelectedAction] = useState({});
  const [creditAmount, setCreditAmount] = useState({});
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // Notification hook

  // Fetch users
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await fetchAllUsers();
      // Ensure credit is set to 0 if not present
      const usersWithCredit = fetchedUsers.map(user => ({
        ...user,
        credits: user.credits || 0, // Use the 'credits' field
      }));
      setUsers(usersWithCredit);
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

  // Handle credit addition
  const handleAddCredit = async (userId) => {
    console.log(`Add credit to user ${userId}`);
    const staffEmail = 'levialon@proton.me';  // Replace with actual staff email
    const staffUserId = 'a2057434-8011-70e2-d347-ab045ef7e9d6';  // Replace with actual staff user ID
    try {
      const amount = creditAmount[userId] || 0; // Get the amount from state
      await addCredit(staffEmail, staffUserId, users.find(user => user.userId === userId).email, amount);
      console.log(`Successfully added ${amount} credit to user ${userId}`);
      showNotification(`$${amount} credit added to ${users.find(user => user.userId === userId).email}`, 'success');
      handleActionSelect(userId, ''); // Reset action to 'Select Action'
      // Update user credit
      setUsers(users.map(user => (user.userId === userId ? { ...user, credits: user.credits + amount } : user)));
    } catch (error) {
      console.error('Failed to add credit:', error);
      setError('Failed to add credit. Please check the console for details.');
      showNotification('Failed to add credit. Please check the console for details.', 'error');
    }
  };

  // Handle credit removal
  const handleRemoveCredit = async (userId) => {
    console.log(`Remove credit from user ${userId}`);
    const staffEmail = 'levialon@proton.me';  // Replace with actual staff email
    const staffUserId = 'a2057434-8011-70e2-d347-ab045ef7e9d6';  // Replace with actual staff user ID
    try {
      const amount = creditAmount[userId] || 0; // Get the amount from state
      await removeCredit(staffEmail, staffUserId, users.find(user => user.userId === userId).email, amount);
      console.log(`Successfully removed ${amount} credit from user ${userId}`);
      showNotification(`$${amount} credit removed from ${users.find(user => user.userId === userId).email}`, 'success');
      handleActionSelect(userId, ''); // Reset action to 'Select Action'
      // Update user credit
      setUsers(users.map(user => (user.userId === userId ? { ...user, credits: Math.max(0, user.credits - amount) } : user)));
    } catch (error) {
      console.error('Failed to remove credit:', error);
      setError('Failed to remove credit. Please check the console for details.');
      showNotification('Failed to remove credit. Please check the console for details.', 'error');
    }
  };

  // Handle action selection
  const handleActionSelect = (userId, action) => {
    setSelectedAction({ ...selectedAction, [userId]: action });
  };

  // Handle credit amount change
  const handleCreditAmountChange = (userId, amount) => {
    setCreditAmount({ ...creditAmount, [userId]: amount });
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
              <th>Credits</th>
              <th>Last Login</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>{user.email}</td>
                <td>{user.credits}</td>
                <td>{user.LastLoginDate ? new Date(user.LastLoginDate).toLocaleString() : 'N/A'}</td>
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
                <td>
                  <select
                    value={selectedAction[user.userId] || ''}
                    onChange={(e) => handleActionSelect(user.userId, e.target.value)}
                    className="actions-dropdown"
                  >
                    <option value="">Select Action</option>
                    <option value="delete">Delete User</option>
                    <option value="addCredit">Add Credit</option>
                    <option value="removeCredit">Remove Credit</option>
                  </select>
                  {selectedAction[user.userId] === 'addCredit' && (
                    <div>
                      <input
                        type="number"
                        placeholder="Credit Amount"
                        value={creditAmount[user.userId] || ''}
                        onChange={(e) => handleCreditAmountChange(user.userId, e.target.value)}
                        className="credit-input"
                      />
                      <button onClick={() => handleAddCredit(user.userId)} className="add-credit-button">
                        Add Credit
                      </button>
                    </div>
                  )}
                  {selectedAction[user.userId] === 'removeCredit' && (
                    <div>
                      <input
                        type="number"
                        placeholder="Credit Amount"
                        value={creditAmount[user.userId] || ''}
                        onChange={(e) => handleCreditAmountChange(user.userId, e.target.value)}
                        className="credit-input"
                      />
                      <button onClick={() => handleRemoveCredit(user.userId)} className="remove-credit-button">
                        Remove Credit
                      </button>
                    </div>
                  )}
                  {selectedAction[user.userId] === 'delete' && (
                    <button onClick={() => handleDeleteUser(user.userId)} className="delete-user-button">
                      Confirm Delete
                    </button>
                  )}
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
