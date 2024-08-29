import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import '../../styles/CartPage.css';
import { fetchUserAttributes } from 'aws-amplify/auth'; // Import AWS Amplify Auth functions

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
  const { cartItems, removeFromCart, clearCart, updateCartItem } = useCart();
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

  // Initialize the final total based on the calculated total price
  const [finalTotal, setFinalTotal] = useState(calculateTotalPrice());

  // Recalculate the final total whenever cart items or discount changes
  useEffect(() => {
    const newTotal = (calculateTotalPrice() * (1 - discount / 100)).toFixed(2);
    setFinalTotal(newTotal);
  }, [cartItems, discount]);

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

  const validateStockBeforeCheckout = async () => {
    try {
      console.log('Starting stock validation...');

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
      console.log('Fetched product list response:', response);

      const data = await response.json();
      console.log('Parsed product list data:', data);

      if (data && data.body) {
        const productList = JSON.parse(data.body);
        console.log('Product list parsed from JSON:', productList);

        let stockUpdated = false;

        for (const cartItem of cartItems) {
          console.log('Checking stock for cart item:', cartItem);

          // Find the product in the fetched product list
          const product = productList.find((p) => p.product_id === cartItem.product_id);

          // If the product is not found, log a warning and continue
          if (!product) {
            console.warn(`Product with ID ${cartItem.product_id} not found in the product list.`);
            continue;
          }

          // Determine the available stock
          const availableStock = product.available_stock_count !== undefined ? product.available_stock_count : 0;
          console.log(`Available stock for product ${cartItem.product_title} (ID: ${cartItem.product_id}):`, availableStock);

          if (cartItem.quantity > availableStock) {
            // Notify the user and adjust the cart to the maximum available stock
            console.log(`Insufficient stock for ${cartItem.product_title}. Only ${availableStock} items available, updating cart...`);
            alert(`Insufficient stock for ${cartItem.product_title}. Only ${availableStock} items are available.`);
            updateCartItem(cartItem.product_id, availableStock);
            stockUpdated = true;
          }
        }

        if (stockUpdated) {
          alert('Your cart has been updated to reflect the maximum available stock. Please review and proceed.');
          return false;
        }
      } else {
        console.warn('No product list data body found in the response.');
      }
      return true;
    } catch (error) {
      console.error('Error validating stock:', error);
      alert('Error validating stock. Please try again.');
      return false;
    }
  };

  const handleCheckout = async () => {
    // Check if email is required for guests
    if (isGuest && !userEmail) {
      alert('Please enter your email to proceed with the order.');
      return;
    }

    // Validate stock before proceeding to checkout
    const isStockValid = await validateStockBeforeCheckout();
    if (!isStockValid) {
      return; // Exit if stock is insufficient
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
      console.log('Preparing to send order data:', orderData);

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Order API response:', response);

      const result_unprocessed = await response.json();
      const result = JSON.parse(result_unprocessed.body);
      
      console.log('Parsed response:', result);

      if (result_unprocessed.statusCode === 200) {
        // Handle successful response
        clearCart();
        alert('Order created successfully! Order ID: ' + (result.order_id || 'undefined'));
      } else {
        // Handle error response
        const errorMessage = result.error || 'Failed to create order';
        alert(`Failed to create order! Error: ${errorMessage}`);
      }
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
