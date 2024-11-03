import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHistory } from 'react-icons/fa';
import './styles/UserOrderDetails.css';

const UserOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const order = storedOrders.find((order) => order.orderId === orderId);
    setOrderDetails(order);
  }, [orderId]);

  if (!orderDetails) {
    return <p>Loading order details...</p>;
  }

  return (
    <div className="order-details-container">
      <div className="order-header">
        <h2>Order Details</h2>
        <p>Order ID: {orderDetails.orderId}</p>
      </div>

      <div className="order-summary">
        <h3>Summary</h3>
        <ul>
          <li><span>Total Price:</span> ${orderDetails.total_price}</li>
          <li><span>Final Price:</span> ${orderDetails.final_price}</li>
          <li><span>Discount:</span> ${orderDetails.discount_amount}</li>
          <li><span>Payment Method:</span> {orderDetails.payment_method}</li>
          <li><span>Status:</span> {orderDetails.payment_status}</li>
          <li><span>Date:</span> {new Date(orderDetails.order_date).toLocaleString()}</li>
        </ul>
      </div>

      <div className="order-contents">
        <h3>Order Contents</h3>
        <ul>
          {orderDetails.order_contents.map((item, index) => (
            <li key={index}>
              <span>Product ID: {item.product_id}</span>, Quantity: {item.quantity}
            </li>
          ))}
        </ul>
      </div>

      {orderDetails.fulfillment_history.length > 0 && (
        <div className="fulfillment-history">
          <h3>Fulfillment History</h3>
          <ul>
            {orderDetails.fulfillment_history.map((history, index) => (
              <li key={index}>
                <span>Stock:</span> {history.stock} | 
                <span>Timestamp:</span> {new Date(history.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="buttons-container">
        <button
          className="fulfillment-history-button"
          onClick={() => console.log("View Fulfillment History")}
        >
          <FaHistory /> View Fulfillment History
        </button>
        <button
          className="back-button"
          onClick={() => navigate('/orders')}
        >
          <FaArrowLeft /> Back to Orders
        </button>
      </div>
    </div>
  );
};

export default UserOrderDetails;
