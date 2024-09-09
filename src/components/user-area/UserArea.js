// src/components/UserArea.js
import React, { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth'; // Correct import for fetching user attributes
import UserOrders from './UserOrders'; // Import the new UserOrders component
import './styles/UserArea.css'; // Import relevant styles

const UserArea = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="user-area-container">
      <h2>Welcome, {userEmail}</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Render the UserOrders component */}
      <UserOrders userEmail={userEmail} userId={userId} />
    </div>
  );
};

export default UserArea;
