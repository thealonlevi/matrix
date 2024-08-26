import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './styles/OrderDetails.css';
import { checkPermissionAndFetchData, fetchData, getUserIdForOrder, getProductTitleById } from './utils/adminUtils';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productTitles, setProductTitles] = useState({});

  const fetchOrderDetails = async () => {
    const userId = getUserIdForOrder(orderId);
    if (!userId) {
      throw new Error('User ID not found for this order.');
    }

    const data = await fetchData(
      'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrderDetails',
      { orderId, userId }
    );

    if (data) {
      const parsedData = JSON.parse(data);
      setOrderDetails(parsedData);
      
      const titles = await fetchProductTitles(parsedData.order_contents?.L);
      setProductTitles(titles);
    }
  };

  const fetchProductTitles = async (orderContents) => {
    const titles = {};
    for (const item of orderContents) {
      const productId = item.M.product_id?.S || item.M.product_id?.N;
      const productTitle = await getProductTitleById(productId);
      titles[productId] = productTitle;
    }
    return titles;
  };

  useEffect(() => {
    const init = async () => {
      try {
        await checkPermissionAndFetchData(fetchOrderDetails, 'Matrix_FetchOrderDetails', '99990');
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
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

  const total = parseFloat(orderDetails.total_price?.S || '0');
  const final = parseFloat(orderDetails.final_price?.S || '0');
  const discount = total - final;

  return (
    <div className="order-details-container">
      <h1 className="order-details-title">Order Details</h1>
      <div className="order-details-content">
        <p><strong>Order ID:</strong> {orderDetails.orderId?.S || 'N/A'}</p>
        <p><strong>User ID:</strong> {orderDetails.userId?.S || 'N/A'}</p>
        <p><strong>Email:</strong> {orderDetails.user_email?.S || 'N/A'}</p>
        <p><strong>Total Price:</strong> ${orderDetails.total_price?.S || 'N/A'}</p>
        <p><strong>Discount:</strong> {discount > 0 ? `- $${discount.toFixed(2)}` : 'No discount applied'}</p>
        <p><strong>Final Price:</strong> ${orderDetails.final_price?.S || 'N/A'}</p>
        <p><strong>Payment Status:</strong> {orderDetails.payment_status?.S || 'N/A'}</p>
        <p><strong>Order Date:</strong> {new Date(orderDetails.order_date?.S).toLocaleString() || 'N/A'}</p>
        <p><strong>IP Address:</strong> {orderDetails.ip_address?.S || 'N/A'}</p>
        <p><strong>Device Type:</strong> {orderDetails.device_type?.S || 'N/A'}</p>
        <p><strong>User Agent:</strong> {orderDetails.user_agent?.S || 'N/A'}</p>
        <p><strong>Order Contents:</strong></p>
        <ul>
          {orderDetails.order_contents?.L.map((item, index) => {
            const productId = item.M.product_id?.S || item.M.product_id?.N;
            const quantity = item.M.quantity?.N;
            const productTitle = productTitles[productId] || `Product ID: ${productId}`;
            return (
              <li key={index}>
                {quantity}x {productTitle}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
