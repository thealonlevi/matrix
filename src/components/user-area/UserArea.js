// src/components/UserArea.js
import React, { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import UserOrders from './UserOrders'; // Import the UserOrders component
import { FaUser, FaEnvelope, FaLock, FaDollarSign, FaCreditCard } from 'react-icons/fa';
import './styles/UserArea.css';

const UserArea = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard'); // State for managing active tab

  // Fetch user attributes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetchUserAttributes();
        const userId = userResponse.sub;
        const { email } = userResponse;

        setUserEmail(email);
        setUserId(userId);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="user-info-section">
            <h2>Your Account</h2>
            <div className="info-list">
              <div className="info-item">
                <FaUser className="info-icon blue-icon" />
                <span className="info-text">ID: {userId}</span>
              </div>
              <div className="info-item">
                <FaEnvelope className="info-icon blue-icon" />
                <span className="info-text">Email: {userEmail}</span>
              </div>
              <div className="info-item">
                <FaLock className="info-icon blue-icon" />
                <span className="info-text">Two Factor: Disabled</span>
                <a href="/user-area/2fa" className="action-link">Activate Now!</a>
              </div>
              <div className="info-item">
                <FaDollarSign className="info-icon blue-icon" />
                <span className="info-text">Balance: $5.00</span>
                <a href="/user-area/topup" className="topup-link">Topup!</a>
              </div>
              <div className="info-item">
                <FaCreditCard className="info-icon blue-icon" />
                <span className="info-text">Credits: $5.00</span>
              </div>
              <div className="info-item">
                <span className="info-text">Joined: 04/04/2024 15:40</span>
              </div>
            </div>
          </div>
        );
      case 'Orders':
        return <UserOrders userEmail={userEmail} userId={userId} />;
      // Add cases for other tabs like Drops, Leaderboard, etc.
      default:
        return null;
    }
  };

  return (
    <div className="user-area-page">
      {/* Top Navigation */}
      <div className="user-area-nav">
        <button onClick={() => setActiveTab('Dashboard')} className={`nav-link ${activeTab === 'Dashboard' ? 'active' : ''}`}>Dashboard</button>
        <button onClick={() => setActiveTab('Orders')} className={`nav-link ${activeTab === 'Orders' ? 'active' : ''}`}>Orders</button>
        <button onClick={() => setActiveTab('Drops')} className={`nav-link ${activeTab === 'Drops' ? 'active' : ''}`}>Drops</button>
        <button onClick={() => setActiveTab('Leaderboard')} className={`nav-link ${activeTab === 'Leaderboard' ? 'active' : ''}`}>Leaderboard</button>
        <button onClick={() => setActiveTab('Referrals')} className={`nav-link ${activeTab === 'Referrals' ? 'active' : ''}`}>Referrals</button>
        <button onClick={() => setActiveTab('Balance')} className={`nav-link ${activeTab === 'Balance' ? 'active' : ''}`}>Balance</button>
        <button onClick={() => setActiveTab('Edit Account')} className={`nav-link ${activeTab === 'Edit Account' ? 'active' : ''}`}>Edit Account</button>
        <button onClick={() => setActiveTab('Change Password')} className={`nav-link ${activeTab === 'Change Password' ? 'active' : ''}`}>Change Password</button>
        <button onClick={() => setActiveTab('2-Factor Auth')} className={`nav-link ${activeTab === '2-Factor Auth' ? 'active' : ''}`}>2-Factor Auth</button>
      </div>

      {/* Render Content Based on Active Tab */}
      {renderContent()}
    </div>
  );
};

export default UserArea;
