// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
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
        <Link to="/">
          <img src="/assets/images/logo.png" alt="Logo" className="logo" />
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/">
          <img src={homeIcon} alt="Home" className="icon" />
          Shop
        </Link>
        <Link to="/reviews">
          <img src={starIcon} alt="Reviews" className="icon" /> {/* Star icon for Reviews */}
          Reviews
        </Link>
      </nav>
      <div className="user-options">
        <Link to="/register">
          <img src={registerIcon} alt="Register" className="icon" />
          Register
        </Link>
        <Link to="/login">
          <img src={loginIcon} alt="Login" className="icon" />
          Login
        </Link>
        <Link to="/cart">
          <img src={cartIcon} alt="Cart" className="icon" />
          Cart
        </Link>
      </div>
    </header>
  );
};

export default Header;
