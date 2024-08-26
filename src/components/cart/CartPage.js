import React from 'react';
import { useCart } from './CartContext';
import '../../styles/CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product_price * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length > 0 ? (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.product_id} className="cart-item">
              <img src={item.product_img_url} alt={item.product_title} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.product_title}</h3>
                <p>Price per item: ${item.product_price.toFixed(2)}</p>
                <p>Quantity: {item.quantity}x</p>
                <button className="remove-button" onClick={() => removeFromCart(item.product_id)}>Remove</button>
              </div>
            </div>
          ))}
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
