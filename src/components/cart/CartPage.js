import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import '../../styles/CartPage.css';
import { 
  currentAuthenticatedUser, 
  fetchProductInfo, 
  fetchClientIp, 
  applyCoupon, 
  validateStockBeforeCheckout, 
  createOrder, 
  getGroupDetailsForProduct 
} from '../../utils/cartUtils';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, updateCartItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [clientIp, setClientIp] = useState('');
  const [productInfo, setProductInfo] = useState([]);

  useEffect(() => {
    fetchProductInfo().then(setProductInfo);
  }, []);

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.product_price * item.quantity, 0).toFixed(2);
  };

  const [finalTotal, setFinalTotal] = useState(calculateTotalPrice());

  useEffect(() => {
    const newTotal = (calculateTotalPrice() * (1 - discount / 100)).toFixed(2);
    setFinalTotal(newTotal);
  }, [cartItems, discount]);

  useEffect(() => {
    currentAuthenticatedUser().then(({ email, isGuest }) => {
      if (email) {
        setUserEmail(email);
        setIsGuest(false);
      }
    });

    fetchClientIp().then(setClientIp);
  }, []);

  const handleApplyCoupon = async () => {
    const discountValue = await applyCoupon(couponCode);
    setDiscount(discountValue);
    if (discountValue > 0) {
      alert(`Coupon applied! You saved ${discountValue}% on your order.`);
    }
  };

  const handleCheckout = async () => {
    if (isGuest && !userEmail) {
      alert('Please enter your email to proceed with the order.');
      return;
    }

    const isStockValid = await validateStockBeforeCheckout(cartItems, updateCartItem);
    if (!isStockValid) return;

    const orderData = {
      user_email: userEmail,
      order_contents: cartItems.map(item => ({
        product_id: item.group_id ? `${item.group_id}/${item.product_id}` : String(item.product_id),
        quantity: item.quantity,
      })),
      payment_method: 'Balance',
      coupon_code: couponCode.trim(),
      ip_address: clientIp || 'Unknown',
      user_agent: navigator.userAgent,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'computer',
    };

    await createOrder(orderData, clearCart);
  };

  const handleQuantityChange = (product_id, newQuantity) => {
    if (newQuantity >= 0) {
      updateCartItem(product_id, newQuantity);
    }
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length > 0 ? (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map((item) => {
              const { title: groupTitle, imageUrl: groupImageUrl } = getGroupDetailsForProduct(item.product_id, productInfo);
              return (
                <div key={item.product_id} className="cart-item">
                  <img src={groupTitle ? groupImageUrl : item.product_img_url} alt={item.product_title} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.product_title}{groupTitle ? ` - ${groupTitle}` : ''}</h3>
                    <p>Price per item: ${item.product_price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-button" 
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="quantity-input" 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value, 10) || 0)} 
                        min="0"
                      />
                      <button 
                        className="quantity-button" 
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button className="remove-button" onClick={() => removeFromCart(item.product_id)}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-total">
              <p>Original Price: ${calculateTotalPrice()}</p>
              <p>Total after Discount: ${finalTotal}</p>
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
              <button className="checkout-button" onClick={handleCheckout}>Proceed to Checkout</button>
            </div>
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
