// src/components/userSystem/CartWidget.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext'; // Import useCart to access cart items
import './styles/CartWidget.css'; // Import the CSS file for styles and animations
import { FaShoppingCart } from 'react-icons/fa'; // Use FontAwesome for a cart icon

const CartWidget = () => {
  const { cartItems } = useCart(); // Get cartItems from CartContext
  const [showWidget, setShowWidget] = useState(false); // State to control widget visibility
  const navigate = useNavigate(); // React Router's navigate hook

  // Effect to control widget visibility based on cart items
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setShowWidget(true); // Show widget when there are items in the cart
    } else {
      setShowWidget(false); // Hide widget when cart is empty
    }
  }, [cartItems]);

  // Function to handle click and navigate to the cart page
  const handleClick = () => {
    navigate('/cart');
  };

  return (
    showWidget && ( // Conditionally render the widget only if there are items in the cart
      <div className="cart-widget-container" onClick={handleClick}>
        {/* Cart icon to visually indicate items in the cart */}
        <div className="cart-widget-badge">
          <FaShoppingCart size={18} /> {/* Cart icon for visual appeal */}
          <span>{cartItems.length}</span> {/* Show the number of items in the cart */}
        </div>
        <div className="cart-widget-message">
          <span className="cart-message-text">You have {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart!</span>
          <span className="cart-widget-click">Click to view</span>
        </div>
      </div>
    )
  );
};

export default CartWidget;
