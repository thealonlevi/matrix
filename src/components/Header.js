// src/components/Header.js
import React from 'react';
import '../styles/Header.css';
import homeIcon from '../assets/icons/house.png';
import cartIcon from '../assets/icons/shopping_cart.png';
import registerIcon from '../assets/icons/register.png';
import loginIcon from '../assets/icons/login.png';
import starIcon from '../assets/icons/star.png'; // Importing the star icon

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/assets/images/logo.png" alt="Logo" className="logo" />
      </div>
      <nav className="nav-links">
        <a href="/">
          <img src={homeIcon} alt="Home" className="icon" />
          Shop
        </a>
        <a href="/reviews">
          <img src={starIcon} alt="Reviews" className="icon" /> {/* Star icon for Reviews */}
          Reviews
        </a>
      </nav>
      <div className="user-options">
        <a href="/register">
          <img src={registerIcon} alt="Register" className="icon" />
          Register
        </a>
        <a href="/login">
          <img src={loginIcon} alt="Login" className="icon" />
          Login
        </a>
        <a href="/cart">
          <img src={cartIcon} alt="Cart" className="icon" />
          Cart
        </a>
      </div>
    </header>
  );
};

export default Header;
