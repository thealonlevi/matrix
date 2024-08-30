import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import homeIcon from '../assets/icons/house.png';
import cartIcon from '../assets/icons/shopping_cart.png';
import registerIcon from '../assets/icons/register.png';
import loginIcon from '../assets/icons/login.png';
import starIcon from '../assets/icons/star.png';
import logoutIcon from '../assets/icons/signout.png';
import { fetchAndStoreProductList } from '../utils/utils';
import { useNotification } from './admin-dashboard/utils/Notification'; // Use the hook to manage notifications

const Header = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { showNotification } = useNotification(); // Get showNotification function from context

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

    initializeProductList();

    // Function to check and display notifications only once
    const checkForNotifications = () => {
      console.log('Checking for notifications in sessionStorage...');
      const storedNotifications = JSON.parse(sessionStorage.getItem('notifications')) || [];
      console.log('Stored Notifications:', storedNotifications);

      // Display notifications from sessionStorage only once
      storedNotifications.forEach(({ message, type }) => showNotification(message, type));

      // Clear notifications from sessionStorage after displaying them once
      sessionStorage.removeItem('notifications');
    };

    checkForNotifications(); // Initial check

  }, []); // Empty dependency array to run only once

  const toggleMenu = () => {
    console.log('Toggling menu. Current state:', menuOpen);
    setMenuOpen(!menuOpen);
  };

  // Example function using showNotification
  const handleExampleAction = () => {
    console.log('Triggering example action to show notification.');
    showNotification('This is a test notification', 'info'); // Set notification in sessionStorage
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src="/assets/images/logo.png" alt="Logo" className="logo" />
        </Link>
        <span>&nbsp;&nbsp;</span>
        <span className="menu-text" onClick={toggleMenu}>&nbsp;MENU</span>
      </div>
      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={toggleMenu}>
          <img src={homeIcon} alt="Home" className="icon" />
          Shop
        </Link>
        <Link to="/reviews" onClick={toggleMenu}>
          <img src={starIcon} alt="Reviews" className="icon" />
          Reviews
        </Link>
        {user.isGuest ? (
          <>
            <Link to="/register" onClick={toggleMenu}>
              <img src={registerIcon} alt="Register" className="icon" />
              Register
            </Link>
            <Link to="/login" onClick={toggleMenu}>
              <img src={loginIcon} alt="Login" className="icon" />
              Login
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin" onClick={toggleMenu}>
              <img src={homeIcon} alt="Admin" className="icon" />
              Admin
            </Link>
            <button className="logout-button" onClick={() => { 
              console.log('Logging out user.');
              handleLogout(); 
              toggleMenu(); 
              showNotification('Logged out successfully', 'success'); // Show success notification
            }}>
              <img src={logoutIcon} alt="Logout" className="icon" />
              Logout
            </button>
          </>
        )}
        <Link to="/cart" onClick={toggleMenu}>
          <img src={cartIcon} alt="Cart" className="icon" />
          Cart
        </Link>
      </nav>

      {/* Example button to trigger a notification */}
      <button onClick={handleExampleAction}>Trigger Notification</button>
    </header>
  );
};

export default Header;
