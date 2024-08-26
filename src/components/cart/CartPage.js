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

  const handleCheckout = async () => {
    // Prepare order data
    const orderData = {
      user_id: 'nignog123', // Replace with actual user ID or use 'GUEST'
      user_email: 'nig@example.com', // Replace with actual user email
      order_contents: cartItems.map(item => {
        const productId = item.group_id 
          ? `${item.group_id}/${item.product_id}` // For group products
          : String(item.product_id); // For standalone products
  
        return {
          product_id: productId,
          quantity: item.quantity
        };
      }),
      payment_method: 'Balance', // Replace with the selected payment method
      coupon_code: 'crypto', // Replace with the actual coupon code, if any
      ip_address: '192.168.1.1', // Replace with actual IP address or fetch dynamically
      user_agent: navigator.userAgent,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'computer',
    };
  
    try {
      // Send request to the API
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const result = await response.json();
      console.log('Order created successfully:', result);
  
      // Clear the cart after successful checkout
      clearCart();
  
      // Redirect to a success page or display a success message
      alert('Order created successfully! Order ID: ' + result.order_id);
      
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
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
            <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
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
