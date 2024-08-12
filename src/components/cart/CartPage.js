import React from 'react';
import { useCart } from './CartContext';
import '../../styles/CartPage.css';  // Import the CSS file

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  // Calculate total price
  const calculateTotalPrice = () => {
    const offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];
    return cartItems.reduce((total, item) => {
      const productDetails = offlineProductList.find(product => product.product_id === item.product_id);
      return total + (productDetails ? productDetails.product_price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  // Fetch product details from localStorage
  const getProductDetails = (productId) => {
    const offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];
    return offlineProductList.find(product => product.product_id === productId);
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length > 0 ? (
        <div className="cart-items">
          {cartItems.map((item) => {
            const productDetails = getProductDetails(item.product_id);
            return (
              <div key={item.product_id} className="cart-item">
                <img src={productDetails?.product_img_url} alt={productDetails?.product_title || 'Unknown'} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{productDetails?.product_title || 'Unknown'}</h3>
                  <p>Price per item: ${productDetails?.product_price.toFixed(2) || 'N/A'}</p>
                  <p>Quantity: {item.quantity}x</p>
                  <button className="remove-button" onClick={() => removeFromCart(item.product_id)}>Remove</button>
                </div>
              </div>
            );
          })}
          <div className="cart-total">
            <h3>Total Price: ${calculateTotalPrice()}</h3>
          </div>
          <div className="cart-actions">
            <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>
            <button className="checkout-button">Checkout</button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <a className="continue-shopping" href="/">Continue Shopping</a>
        </div>
      )}
    </div>
  );
};

export default CartPage;
