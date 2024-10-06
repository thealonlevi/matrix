// src/components/LoadingScreen.js

import React from 'react';
import '../styles/LoadingScreen.css'

const LoadingScreen = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loading-screen ${size}`}>
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingScreen;
