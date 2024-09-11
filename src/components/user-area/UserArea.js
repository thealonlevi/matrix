// src/components/UserArea.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth'; // Correct import for fetching user attributes
import './styles/UserArea.css'; // Import relevant styles

const UserArea = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user attributes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user attributes from AWS Amplify
        const userResponse = await fetchUserAttributes();
        const userId = userResponse.sub; // Extract user ID
        const { email } = userResponse; // Extract email

        setUserEmail(email);
        setUserId(userId);
        console.log(email, userId);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleOrdersClick = () => {
    navigate('/user-area/orders');
  };

  return (
    <div className="user-area-container">
      <div className="user-area-content">
        <h2>Welcome, {userEmail}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="user-area-section">
          <p>Manage your account and orders from this dashboard.</p>
          <div className="user-area-buttons">
            <button onClick={handleOrdersClick} className="user-area-button">
              View Your Orders
            </button>
            {/* Add other buttons or sections here as needed */}
            <button className="user-area-button">Account Settings</button>
            <button className="user-area-button">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserArea;
