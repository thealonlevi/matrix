import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchAllUsers, userInfoUtil, addCredit, removeCredit, logRequest } from '../../utils/api';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { useNotification } from './utils/Notification';
import './styles/ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  // State to hold the search term
  const [filteredUsers, setFilteredUsers] = useState([]);  // Filtered users based on search
  const [selectedAction, setSelectedAction] = useState({});
  const [creditAmount, setCreditAmount] = useState({});
  const [staffEmail, setStaffEmail] = useState('');
  const [staffUserId, setStaffUserId] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchStaffAttributes = async () => {
      try {
        const userResponse = await fetchUserAttributes();
        const { email, sub: userId } = userResponse;
        setStaffEmail(email);
        setStaffUserId(userId);
      } catch (error) {
        console.error('Error fetching staff attributes:', error);
        setError('Failed to fetch staff details. Please try again.');
      }
    };
    fetchStaffAttributes();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await fetchAllUsers();
      const usersWithCredit = fetchedUsers.map(user => ({
        ...user,
        credits: user.credits || 0,
      }));
      setUsers(usersWithCredit);
      setFilteredUsers(usersWithCredit);  // Initialize filtered users
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
        const hasPermission = await checkAdminPermission();
        if (!hasPermission) {
          throw new Error('Access denied: Admin permissions required.');
        }
        await fetchUsers();
      } catch (error) {
        console.error('Error during ManageUsers initialization:', error.message);
        setError(error.message);
        navigate('/');
      }
    };
    init();
  }, [navigate]);

  // Handle role modification
  const handleRoleChange = async (userId, newRole) => {
    try {
      await userInfoUtil('POST', {
        email: users.find(user => user.userId === userId).email,
        role: newRole,
      });
      setUsers(users.map(user => (user.userId === userId ? { ...user, role: newRole } : user)));
    } catch (error) {
      console.error('Failed to update user role:', error);
      setError('Failed to update user role. Please check the console for details.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    console.log(`Delete user ${userId}`);
  };

  // Handle credit addition
  const handleAddCredit = async (userId) => {
    try {
      const amount = creditAmount[userId] || 0;
      const logSuccess = await logRequest('Matrix_AddCredit', staffUserId);
      if (!logSuccess) {
        throw new Error('Failed to log the add credit request.');
      }
      await addCredit(staffEmail, staffUserId, users.find(user => user.userId === userId).email, amount);
      showNotification(`$${amount} credit added to ${users.find(user => user.userId === userId).email}`, 'success');
      handleActionSelect(userId, '');
      setUsers(users.map(user => (
        user.userId === userId 
          ? { 
              ...user, 
              credits: String((parseFloat(user.credits) || 0) + parseFloat(amount))  
            } 
          : user
      )));      
    } catch (error) {
      console.error('Failed to add credit:', error);
      setError('Failed to add credit. Please check the console for details.');
      showNotification('Failed to add credit. Please check the console for details.', 'error');
    }
  };

  // Handle credit removal
  const handleRemoveCredit = async (userId) => {
    try {
      const amount = creditAmount[userId] || 0;
      const logSuccess = await logRequest('Matrix_RemoveCredit', userId);
      if (!logSuccess) {
        throw new Error('Failed to log the remove credit request.');
      }
      await removeCredit(staffEmail, staffUserId, users.find(user => user.userId === userId).email, amount);
      showNotification(`$${amount} credit removed from ${users.find(user => user.userId === userId).email}`, 'success');
      handleActionSelect(userId, '');
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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter users based on search term (by email or user ID)
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(value) || 
      user.userId.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="manage-users-container">
      <h1 className="manage-users-title">Manage Users</h1>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by email or user ID"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />

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
            {filteredUsers.map((user, index) => (
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
