import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './styles/UserOrderDetails.css'; // Import relevant styles

const UserOrderDetails = () => {
  const { orderId } = useParams(); // Get the order ID from the URL
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Retrieve orders from local storage
    const storedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    // Find the order with the matching orderId
    const order = storedOrders.find((order) => order.orderId === orderId);
    setOrderDetails(order); // Set the order details
  }, [orderId]);

  if (!orderDetails) {
    return <p>Loading order details...</p>;
  }

  return (
    <div className="user-order-details-container">
      <h2>Order Details for {orderDetails.orderId}</h2>
      <ul>
        <li><strong>Order ID:</strong> {orderDetails.orderId}</li>
        <li><strong>Total Price:</strong> ${orderDetails.total_price}</li>
        <li><strong>Final Price:</strong> ${orderDetails.final_price}</li>
        <li><strong>Discount Amount:</strong> ${orderDetails.discount_amount}</li>
        <li><strong>Payment Method:</strong> {orderDetails.payment_method}</li>
        <li><strong>Payment Status:</strong> {orderDetails.payment_status}</li>
        <li><strong>Order Date:</strong> {new Date(orderDetails.order_date).toLocaleString()}</li>
        <li><strong>User ID:</strong> {orderDetails.userId}</li>
        <li><strong>User Email:</strong> {orderDetails.user_email}</li>
      </ul>

      <h3>Order Contents</h3>
      <ul>
        {orderDetails.order_contents.map((item, index) => (
          <li key={index}>
            Product ID: {item.product_id}, Quantity: {item.quantity}
          </li>
        ))}
      </ul>

      {orderDetails.fulfillment_history.length > 0 && (
        <>
          <h3>Fulfillment History</h3>
          <ul>
            {orderDetails.fulfillment_history.map((history, index) => (
              <li key={index}>
                <strong>Stock:</strong> {history.stock} | 
                <strong>Timestamp:</strong> {new Date(history.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </>
      )}

      
    </div>
  );
};

export default UserOrderDetails;
