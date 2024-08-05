import React from 'react';
import '../styles/Banner.css';

const Banner = () => {
  return (
    <div className="banner">
      <div className="announcement-bar">
        <p>
          <span className="animated-highlight">It's time to escape the matrix, together.</span> 
          Use <span className="highlight">CRYPTO10</span> for 10% OFF using any crypto! CashApp is enabled. 
          <a href="https://matrix.tf/tos">matrix.tf/tos</a>
        </p>
      </div>
      <img src="/assets/images/hero.gif" alt="Banner" className="banner-image animated-image" />
    </div>
  );
};

export default Banner;
