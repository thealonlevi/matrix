import React, { useState, useEffect } from 'react';
import './styles/AdminOrders.css';
import { useNavigate } from 'react-router-dom';
import { checkPermissionAndFetchData, fetchData, getProductTitleById } from './utils/adminUtils'; // Import the utility functions

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const data = await fetchData(
      'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrders',
      {}
    );

    if (data && data.length > 0) {
      const sortedOrders = data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(sortedOrders);
      updateOrderUserIdList(sortedOrders);
    } else {
      setOrders([]);
    }
  };

  const updateOrderUserIdList = (orders) => {
    try {
      const storedOrderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];
      const newOrderUserIdList = orders.map(order => ({
        orderId: order.orderId,
        userId: order.userId,
      }));

      const updatedList = [...storedOrderUserIdList];
      newOrderUserIdList.forEach(newPair => {
        if (!updatedList.find(pair => pair.orderId === newPair.orderId && pair.userId === newPair.userId)) {
          updatedList.push(newPair);
        }
      });

      localStorage.setItem('orderUserIdList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error updating orderUserIdList in localStorage:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await checkPermissionAndFetchData(fetchOrders, 'Matrix_FetchOrders', '9999');
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
              <th>Processor</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderId} onClick={() => handleRowClick(order.orderId)} className="clickable-row">
                <td>{orders.length - index}</td>
                <td>{order.user_email || 'N/A'}</td>
                <td>
                  {order.order_contents ? (
                    order.order_contents.map((item, idx) => (
                      <span key={`${order.orderId}-${idx}`}>
                        {getProductTitleById(item.product_id)}
                      </span>
                    ))
                  ) : (
                    <span>No items</span>
                  )}
                </td>
                <td>
                  {order.order_contents ? (
                    order.order_contents.map((item, idx) => (
                      <span key={`${order.orderId}-quantity-${idx}`}>{item.quantity}</span>
                    ))
                  ) : (
                    <span>0</span>
                  )}
                </td>
                <td>{`$${order.total || '0.00'}`}</td>
                <td className={order.payment_status === 'paid' ? 'paid' : 'unpaid'}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) || 'Unknown'}
                </td>
                <td>{order.payment_method || 'Unknown'}</td>
                <td>{new Date(order.order_date || '').toLocaleString() || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
