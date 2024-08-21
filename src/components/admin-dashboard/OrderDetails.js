import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './styles/OrderDetails.css'; // Assuming you have a CSS file for styling

const OrderDetails = () => {
  const { orderId } = useParams(); // Access orderId from the URL params
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch order details from the API
  const fetchOrderDetails = async (orderId, userId) => {
    try {
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrderDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(JSON.parse(data.body));
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      setError('Error while fetching order details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get the userId for the order from the local storage
  const getUserIdForOrder = (orderId) => {
    const orderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];
    const orderUserMap = orderUserIdList.find(item => item.orderId === orderId);

    if (orderUserMap) {
      return orderUserMap.userId;
    } else {
      setError('User ID not found for this order.');
      return null;
    }
  };

  useEffect(() => {
    const userId = getUserIdForOrder(orderId);
    if (userId) {
      fetchOrderDetails(orderId, userId);
    }
  }, [orderId]);

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!orderDetails) {
    return <p>No order details available.</p>;
  }

  return (
    <div className="order-details-container">
      <h1 className="order-details-title">Order Details</h1>
      <div className="order-details-content">
        <p><strong>Order ID:</strong> {orderDetails.orderId?.S || 'N/A'}</p>
        <p><strong>User ID:</strong> {orderDetails.userId?.S || 'N/A'}</p>
        <p><strong>Email:</strong> {orderDetails.user_email?.S || 'N/A'}</p>
        <p><strong>Total:</strong> ${orderDetails.total?.S || 'N/A'}</p>
        <p><strong>Payment Status:</strong> {orderDetails.payment_status?.S || 'N/A'}</p>
        <p><strong>Order Date:</strong> {new Date(orderDetails.order_date?.S).toLocaleString() || 'N/A'}</p>
        <p><strong>IP Address:</strong> {orderDetails.ip_address?.S || 'N/A'}</p>
        <p><strong>Order Contents:</strong></p>
        <ul>
          {orderDetails.order_contents?.L.map((item, index) => (
            <li key={index}>
              Product ID: {item.M.product_id?.N || 'N/A'}, Quantity: {item.M.quantity?.N || 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
