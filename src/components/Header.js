import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaShoppingCart,
  FaStar,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
  FaBars, // Menu icon for mobile view
  FaUser, // Icon for Account
  FaEnvelopeOpenText, // Icon for Create Ticket
} from 'react-icons/fa'; // Import icons from react-icons
import '../styles/Header.css';
import { fetchAndStoreProductList } from '../utils/utils';
import { useNotification } from './admin-dashboard/utils/Notification'; // Use the hook to manage notifications
import { fetchUserAttributes } from 'aws-amplify/auth';
import { updateUserTimestamp } from '../utils/api';

const Header = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    console.log('Header component mounted.');

    const initializeProductList = async () => {
      console.log('Initializing product list...');
      try {
        await fetchAndStoreProductList();
        console.log('Product list fetched and stored successfully.');
      } catch (error) {
        console.error('Failed to initialize product list:', error);
        showNotification('Failed to initialize product list', 'error'); // Show error notification
      }
    };

    const updateTimestamp = async () => {
      try {
        const { email } = await fetchUserAttributes();
        await updateUserTimestamp(email, false); // Update only the LastActiveTimestamp
      } catch (error) {
        console.error('Failed to update user timestamp:', error);
      }
    };

    initializeProductList();
    updateTimestamp();

    const checkForNotifications = () => {
      console.log('Checking for notifications in sessionStorage...');
      const storedNotifications = JSON.parse(sessionStorage.getItem('notifications')) || [];
      console.log('Stored Notifications:', storedNotifications);

      storedNotifications.forEach(({ message, type }) => showNotification(message, type));
      sessionStorage.removeItem('notifications');
    };

    checkForNotifications(); // Initial check
  }, [showNotification]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header-container">
      <div className="header-logo-container">
        <Link to="/" className="header-logo-link">
          <img src="/assets/images/logo.png" alt="Logo" className="header-logo" />
        </Link>
        <div className="header-left-nav-links header-desktop-only">
          <Link to="/" className="header-nav-link">
            <FaHome className="header-icon" />
            Shop
          </Link>
          <Link to="/reviews" className="header-nav-link">
            <FaStar className="header-icon" />
            Reviews
          </Link>
        </div>
      </div>

      <nav className={`header-right-nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="header-nav-link header-mobile-only" onClick={toggleMenu}>
          <FaHome className="header-icon" />
          Shop
        </Link>
        <Link to="/reviews" className="header-nav-link header-mobile-only" onClick={toggleMenu}>
          <FaStar className="header-icon" />
          Reviews
        </Link>
        <Link to="/Create_Ticket" className="header-nav-link" onClick={toggleMenu}>
          <FaEnvelopeOpenText className="header-icon" />
          Create Ticket
        </Link>
        {user.isGuest ? (
          <>
            <Link to="/register" className="header-nav-link" onClick={toggleMenu}>
              <FaUserPlus className="header-icon" />
              Register
            </Link>
            <Link to="/login" className="header-nav-link" onClick={toggleMenu}>
              <FaSignInAlt className="header-icon" />
              Login
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin" className="header-nav-link" onClick={toggleMenu}>
              <FaUserShield className="header-icon" />
              Admin
            </Link>
            <Link to="/user-area" className="header-nav-link" onClick={toggleMenu}>
              <FaUser className="header-icon" />
              Account
            </Link>
            <button
              className="header-nav-link header-logout-button"
              onClick={() => {
                handleLogout();
                toggleMenu();
                showNotification('Logged out successfully', 'success');
              }}
            >
              <FaSignOutAlt className="header-icon" />
              Logout
            </button>
          </>
        )}
        <Link to="/cart" className="header-nav-link" onClick={toggleMenu}>
          <FaShoppingCart className="header-icon" />
          Cart
        </Link>
      </nav>

      <button className="header-menu-icon" onClick={toggleMenu}>
        <FaBars />
      </button>
    </header>
  );
};

export default Header;
