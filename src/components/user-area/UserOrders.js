import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../utils/api';
import './styles/UserOrders.css'; // Ensure you style accordingly
import FulfillmentHistoryModal from './user-orders-depth/FulfillmentHistoryModal'; // Corrected Modal Import Path

const UserOrders = ({ userEmail, userId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

  // Fetch user order history
  useEffect(() => {
    if (!userEmail || !userId) return;

    const fetchUserOrdersData = async () => {
      try {
        const response = await fetchUserOrders({
          email: userEmail,
          userId: userId,
        });

        if (response.body) {
          const responseBody = JSON.parse(response.body);
          if (responseBody.orders) {
            setOrders(responseBody.orders);
            localStorage.setItem('userOrders', JSON.stringify(responseBody.orders));
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

  // When a user clicks on an order, it opens up the details
  const handleOrderClick = (orderId) => {
    const selected = orders.find((order) => order.orderId === orderId);
    setSelectedOrder(selected);
  };

  // Open the Fulfillment History modal
  const openFulfillmentModal = () => {
    setIsModalOpen(true);
  };

  // Back to Orders - close the details view
  const closeDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="user-orders">
      {error && <p className="error-message">{error}</p>}
      
      <h2>Your Orders</h2>
      
      {/* Table layout for the orders */}
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
      ) : (
        <div className="order-details-section">
          <div className="order-info-column">
            <h3>Order Details for {selectedOrder.orderId}</h3>
            <ul>
              <li><strong>Order ID:</strong> {selectedOrder.orderId}</li>
              <li><strong>Total Price:</strong> ${selectedOrder.total_price}</li>
              <li><strong>Final Price:</strong> ${selectedOrder.final_price}</li>
              <li><strong>Discount Amount:</strong> ${selectedOrder.discount_amount}</li>
              <li><strong>Payment Method:</strong> {selectedOrder.payment_method}</li>
              <li><strong>Payment Status:</strong> {selectedOrder.payment_status}</li>
              <li><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</li>
              <li><strong>User ID:</strong> {selectedOrder.userId}</li>
              <li><strong>User Email:</strong> {selectedOrder.user_email}</li>
            </ul>
          </div>

          <div className="order-additional-column">
            <button onClick={openFulfillmentModal} className="view-fulfillment-btn">View Fulfillment History</button>
          </div>

          <button onClick={closeDetails} className="back-to-orders">Back to Orders</button>

          {/* Fulfillment History Modal */}
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
