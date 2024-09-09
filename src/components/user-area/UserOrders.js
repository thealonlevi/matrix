// src/components/UserOrders.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../../utils/api'; // Import fetchUserOrders from your API utility
import './styles/UserOrders.css'; // Import relevant styles

const UserOrders = ({ userEmail, userId }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    // Navigate to order details page
    navigate(`/user-area/orders/${orderId}`);
  };

  return (
    <div className="user-orders-container">
      {error && <p className="error-message">{error}</p>}
      <h3>Your Orders</h3>
      <table className="user-orders-table">
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
            <tr key={index} onClick={() => handleOrderClick(order.orderId)}>
              <td>{order.orderId}</td>
              <td>${order.final_price}</td>
              <td>{order.payment_status}</td>
              <td>{new Date(order.order_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrders;
