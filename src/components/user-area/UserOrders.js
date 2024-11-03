import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../utils/api';
import { FiEye, FiMoreHorizontal, FiCreditCard, FiArrowLeft, FiClock, FiDollarSign, FiMail, FiShoppingCart, FiUser } from 'react-icons/fi';
import FulfillmentHistoryModal from './user-orders-depth/FulfillmentHistoryModal';
import './styles/UserOrders.css';

const UserOrders = ({ userEmail, userId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userEmail || !userId) return;

    const fetchOrders = async () => {
      try {
        const response = await fetchUserOrders({ email: userEmail, userId });
        const ordersData = response.body ? JSON.parse(response.body).orders : null;
        ordersData ? setOrders(ordersData) : setError('No orders found for this user.');
        localStorage.setItem('userOrders', JSON.stringify(ordersData));
      } catch (error) {
        console.error('Error fetching user orders:', error);
        setError('An error occurred while fetching user orders.');
      }
    };

    fetchOrders();
  }, [userEmail, userId]);

  const handleOrderClick = (orderId) => {
    const selected = orders.find((order) => order.orderId === orderId);
    setSelectedOrder(selected);
  };

  const openFulfillmentModal = () => {
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="user-orders">
      {error && <p className="error-message">{error}</p>}
      <h2>Your Orders</h2>
      <div className="divider"></div>

      {!selectedOrder ? (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} onClick={() => handleOrderClick(order.orderId)} className="order-row">
                  <td><FiShoppingCart /> {order.orderId}</td>
                  <td><FiDollarSign /> ${order.final_price}</td>
                  <td>{order.payment_status}</td>
                  <td><FiClock /> {new Date(order.order_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="order-details-section">
          <h3>Order Details</h3>
          
          <div className="detail-box">
            <h4>Pricing</h4>
            <div className="detail-item"><FiDollarSign /> <strong>Total Price:</strong> ${selectedOrder.total_price}</div>
            <div className="detail-item"><FiDollarSign /> <strong>Discount Amount:</strong> ${selectedOrder.discount_amount}</div>
            <div className="detail-item"><FiDollarSign /> <strong>Final Price:</strong> ${selectedOrder.final_price}</div>
          </div>

          <div className="detail-box">
            <h4>Order Info</h4>
            <div className="detail-item"><FiShoppingCart /> <strong>Order ID:</strong> {selectedOrder.orderId}</div>
            <div className="detail-item"><FiCreditCard /><strong>Payment Method:</strong> {selectedOrder.payment_method}</div>
            <div className="detail-item"><FiMoreHorizontal/><strong>Payment Status:</strong> {selectedOrder.payment_status}</div>
            <div className="detail-item"><FiClock /> <strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</div>
          </div>

          <div className="detail-box">
            <h4>User Info</h4>
            <div className="detail-item"><FiUser /> <strong>User ID:</strong> {selectedOrder.userId}</div>
            <div className="detail-item"><FiMail /> <strong>User Email:</strong> {selectedOrder.user_email}</div>
          </div>

          <div className="button-group">
            <button onClick={openFulfillmentModal} className="view-fulfillment-btn"><FiEye/> View Stock</button>
            <button onClick={closeDetails} className="back-to-orders"><FiArrowLeft /> Back to Orders</button>
          </div>

          {isModalOpen && (
            <FulfillmentHistoryModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              fulfillmentHistory={selectedOrder.fulfillment_history} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
