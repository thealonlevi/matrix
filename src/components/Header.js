// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import homeIcon from '../assets/icons/house.png';
import cartIcon from '../assets/icons/shopping_cart.png';
import registerIcon from '../assets/icons/register.png';
import loginIcon from '../assets/icons/login.png';
import starIcon from '../assets/icons/star.png';
import logoutIcon from '../assets/icons/signout.png';

const Header = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
    </header>
  );
};

export default Header;
