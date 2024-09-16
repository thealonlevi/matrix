// src/components/UserOrders.js
import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../utils/api'; // Import fetchUserOrders from your API utility
import './styles/UserOrders.css'; // Import relevant styles

const UserOrders = ({ userEmail, userId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // State to store the selected order details
  const [error, setError] = useState('');

  // Fetch user order history
  useEffect(() => {
    if (!userEmail || !userId) return; // Ensure email and userId are available

    const fetchUserOrdersData = async () => {
      try {
        // Fetch user order history using Matrix_FetchUserOrders API
        const response = await fetchUserOrders({
          email: userEmail,
          userId: userId,
        });

        // Parse response and extract orders
        if (response.body) {
          const responseBody = JSON.parse(response.body);
          if (responseBody.orders) {
            setOrders(responseBody.orders);
            localStorage.setItem('userOrders', JSON.stringify(responseBody.orders)); // Store orders in local storage
          } else {
            setError('No orders found for this user.');
          }
        } else {
          setError('Failed to fetch user orders.');
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
        setError('An error occurred while fetching user orders.');
      }
    };

    fetchUserOrdersData();
  }, [userEmail, userId]);

  const handleOrderClick = (orderId) => {
    const selected = orders.find((order) => order.orderId === orderId);
    setSelectedOrder(selected); // Set the selected order details
  };

  const renderOrderDetails = (order) => {
    return (
      <div className="order-details">
        <h3>Order Details for {order.orderId}</h3>
        <ul>
          <li><strong>Order ID:</strong> {order.orderId}</li>
          <li><strong>Total Price:</strong> ${order.total_price}</li>
          <li><strong>Final Price:</strong> ${order.final_price}</li>
          <li><strong>Discount Amount:</strong> ${order.discount_amount}</li>
          <li><strong>Payment Method:</strong> {order.payment_method}</li>
          <li><strong>Payment Status:</strong> {order.payment_status}</li>
          <li><strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}</li>
          <li><strong>User ID:</strong> {order.userId}</li>
          <li><strong>User Email:</strong> {order.user_email}</li>
        </ul>
        <h3>Order Contents</h3>
        <ul>
          {order.order_contents.map((item, index) => (
            <li key={index}>
              Product ID: {item.product_id}, Quantity: {item.quantity}
            </li>
          ))}
        </ul>
        {order.fulfillment_history.length > 0 && (
          <>
            <h3>Fulfillment History</h3>
            <ul>
              {order.fulfillment_history.map((history, index) => (
                <li key={index}>
                  <strong>Product ID:</strong> {history.product_id} | 
                  <strong>Stock:</strong> {history.stock} | 
                  <strong>Timestamp:</strong> {new Date(history.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          </>
        )}
        <button onClick={() => setSelectedOrder(null)}>Back to Orders</button>
      </div>
    );
  };

  return (
    <div className="user-orders">
      {error && <p className="error-message">{error}</p>}
      {!selectedOrder ? (
        <>
          <h2>Your Orders</h2>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} onClick={() => handleOrderClick(order.orderId)} className="order-row">
                    <td>{order.orderId}</td>
                    <td>${order.final_price}</td>
                    <td>{order.payment_status}</td>
                    <td>{new Date(order.order_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        renderOrderDetails(selectedOrder) // Render the selected order details
      )}
    </div>
  );
};

export default UserOrders;
