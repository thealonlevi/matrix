import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import '../../styles/CartPage.css';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth'; // Import AWS Amplify Auth functions

// Fetch the authenticated user's email or determine if they are a guest
async function currentAuthenticatedUser() {
  try {
    const user = await fetchUserAttributes();
    const { email } = user;
    console.log(`The email: ${email}`);
    return { email, isGuest: false };
  } catch (err) {
    console.log(err);
    return { email: null, isGuest: true };
  }
}

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userEmail, setUserEmail] = useState(''); // State to manage user's email
  const [isGuest, setIsGuest] = useState(true); // State to check if the user is a guest
  const [clientIp, setClientIp] = useState(''); // State to manage the client's IP address

  // Calculate the total price
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product_price * item.quantity;
    }, 0).toFixed(2);
  };

  const [finalTotal, setFinalTotal] = useState(calculateTotalPrice()); // Initialize after defining calculateTotalPrice

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { email, isGuest } = await currentAuthenticatedUser();
      if (email) {
        setUserEmail(email);
        setIsGuest(false);
      }
    };

    fetchUserEmail();
    // Fetch the client's IP address
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setClientIp(data.ip);
        console.log('Client IP fetched:', data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
  }, []);

  const handleApplyCoupon = async () => {
    try {
      console.log('Sending coupon code:', couponCode);

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CouponChecker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coupon_code: couponCode.trim() }),
      });

      const result = await response.json();
      console.log('Raw response:', response);
      console.log('Response data:', result); // Log the result to see what the server returns

      if (response.ok && result.body) {
        const responseBody = JSON.parse(result.body); // Parse the JSON string to get the actual data
        const discountValue = parseFloat(responseBody.discount);
        
        if (!isNaN(discountValue)) {
          setDiscount(discountValue);
          const newTotal = (calculateTotalPrice() * (1 - discountValue / 100)).toFixed(2);
          setFinalTotal(newTotal);
          alert(`Coupon applied! You saved ${discountValue}% on your order.`);
        } else {
          alert('Invalid discount value received. Please try again.');
        }
      } else {
        setDiscount(0);
        alert('Invalid coupon code. Please try again.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Failed to apply coupon. Please try again.');
    }
  };

  const handleCheckout = async () => {
    // Check if email is required for guests
    if (isGuest && !userEmail) {
      alert('Please enter your email to proceed with the order.');
      return;
    }

    const orderData = {
      user_email: userEmail, // Use fetched or entered email
      order_contents: cartItems.map(item => {
        const productId = item.group_id
          ? `${item.group_id}/${item.product_id}` // For group products
          : String(item.product_id); // For standalone products

        return {
          product_id: productId,
          quantity: item.quantity,
        };
      }),
      payment_method: 'Balance', // Replace with the selected payment method
      coupon_code: couponCode.trim(), // Use the applied coupon code
      ip_address: clientIp || 'Unknown', // Replace with actual IP address or fetch dynamically
      user_agent: navigator.userAgent,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'computer',
    };

    try {
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

      clearCart();
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
            <h3>Final Price after discount: ${finalTotal}</h3>
          </div>
          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button className="apply-coupon-button" onClick={handleApplyCoupon}>
              Apply Coupon
            </button>
          </div>
          {isGuest && (
            <div className="email-section">
              <input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
          )}
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
