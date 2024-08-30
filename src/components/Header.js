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
import Notification, { showNotification } from './admin-dashboard/utils/Notification'; // Import showNotification

const Header = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);  // State for notifications

  useEffect(() => {
    const initializeProductList = async () => {
      try {
        await fetchAndStoreProductList();
        console.log('Product list fetched and stored successfully.');
      } catch (error) {
        console.error('Failed to initialize product list:', error);
      }
    };

    initializeProductList();

    // Check for notifications periodically
    const checkForNotifications = () => {
      const storedNotification = JSON.parse(sessionStorage.getItem('notification'));
      if (storedNotification) {
        const { message, type, timestamp } = storedNotification;

        // Check if notification is expired (30 seconds)
        if (Date.now() - timestamp > 30000) { // 30 seconds
          sessionStorage.removeItem('notification');
          setNotification(null);
        } else {
          setNotification({ message, type });
        }
      }
    };

    checkForNotifications(); // Initial check
    const intervalId = setInterval(checkForNotifications, 1000); // Check every second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Example function using showNotification
  const handleExampleAction = () => {
    showNotification('This is a test notification', 'info'); // Set notification
    setNotification({ message: 'This is a test notification', type: 'info' }); // Immediately update state
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
            <button className="logout-button" onClick={() => { handleLogout(); toggleMenu(); }}>
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
      
      {/* Notification Display */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </header>
  );
};

export default Header;
