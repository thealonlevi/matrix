// src/components/admin-dashboard/ticket-system/TicketOrderDetailsModal.js

import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import {
  FaTimes,
  FaClipboardList,
  FaEnvelope,
  FaTag,
  FaCalendarAlt,
  FaDollarSign,
  FaClock,
  FaBox,
  FaLaptop,
  FaUser,
  FaInfoCircle,
  FaListUl
} from 'react-icons/fa';
import { getProductTitleById } from '../utils/adminUtils';
import { fetchOrderDetails } from '../../../utils/api';
import './TicketOrderDetailsModal.css';

// Set app element for react-modal to prevent the warning
Modal.setAppElement('#root'); // Replace '#root' with the ID of your app's root element


export const TicketOrderDetailsModal = ({
  orderDetailsModalIsOpen,
  closeOrderDetailsModal,
  orderId, // Order ID passed as a prop
}) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productTitles, setProductTitles] = useState({});

  // Cache to store product titles and prevent unnecessary API calls
  const productCache = useMemo(() => ({}), []);

  // Fetch Order Details and product titles when the modal is opened
  useEffect(() => {
    const fetchOrderDetailsHandler = async () => {
      if (orderId) {
        setLoading(true);
        try {
          const data = await fetchOrderDetails(orderId);
          const parsedData = JSON.parse(data.body); // Assuming the response is inside a 'body' field
          setOrderDetails(parsedData);

          // Fetch and set product titles for order contents and fulfillment history
          const titles = await fetchProductTitles(parsedData.order_contents?.L);
          setProductTitles(titles);

          // Fetch product titles for items in the fulfillment history
          if (parsedData.fulfillment_history?.L) {
            const fulfillmentTitles = await fetchProductTitles(
              parsedData.fulfillment_history.L.map((item) => ({ M: { product_id: item.M.product_id } }))
            );
            setProductTitles((prevTitles) => ({ ...prevTitles, ...fulfillmentTitles }));
          }
        } catch (error) {
          setError('Failed to fetch order details.');
          console.error('Error fetching order details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Fetch product titles based on product IDs in the order contents
    const fetchProductTitles = async (orderContents) => {
      const titles = {};
      for (const item of orderContents) {
        const productId = item.M.product_id?.S || item.M.product_id?.N;
        if (productCache[productId]) {
          titles[productId] = productCache[productId];
        } else {
          let productTitle = await getProductTitleById(productId);
          titles[productId] = productTitle || `Product ID: ${productId}`;
          productCache[productId] = titles[productId]; // Store in cache
        }
      }
      return titles;
    };

    fetchOrderDetailsHandler();
  }, [orderId, productCache]);

  return (
    <Modal
      isOpen={orderDetailsModalIsOpen}
      onRequestClose={closeOrderDetailsModal}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Order Details Modal"
    >
      <div className="order-details-modal-header">
        <h2>
          <FaClipboardList /> Order Details
        </h2>
        <FaTimes className="modal-close-icon" onClick={closeOrderDetailsModal} />
      </div>
      {loading ? (
        <p>Loading order details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : orderDetails ? (
        <div className="order-details">
          <p>
            <FaTag /> <strong>Order ID:</strong> {orderDetails.orderId?.S || 'N/A'}
          </p>
          <p>
            <FaEnvelope /> <strong>Email:</strong> {orderDetails.user_email?.S || 'N/A'}
          </p>
          <p>
            <FaDollarSign /> <strong>Total Price:</strong> ${orderDetails.total_price?.S || 'N/A'}
          </p>
          <p>
            <FaDollarSign /> <strong>Discount:</strong> ${orderDetails.discount_amount?.S || 'N/A'}
          </p>
          <p>
            <FaDollarSign /> <strong>Final Price:</strong> ${orderDetails.final_price?.S || 'N/A'}
          </p>
          <p>
            <FaInfoCircle /> <strong>Payment Status:</strong> {orderDetails.payment_status?.S || 'N/A'}
          </p>
          <p>
            <FaCalendarAlt /> <strong>Order Date:</strong> {new Date(orderDetails.order_date?.S).toLocaleString() || 'N/A'}
          </p>
          <p>
            <FaUser /> <strong>IP Address:</strong> {orderDetails.ip_address?.S || 'N/A'}
          </p>
          <p>
            <FaLaptop /> <strong>Device Type:</strong> {orderDetails.device_type?.S || 'N/A'}
          </p>
          <p>
            <FaInfoCircle /> <strong>User Agent:</strong> {orderDetails.user_agent?.S || 'N/A'}
          </p>
          <p>
            <FaListUl /> <strong>Order Contents:</strong>
          </p>
          <ul>
            {orderDetails.order_contents?.L.map((item, index) => {
              const productId = item.M.product_id?.S || item.M.product_id?.N;
              const quantity = item.M.quantity?.N;
              const productTitle = productTitles[productId] || `Product ID: ${productId}`;
              return (
                <li key={index} className="order-item">
                  <FaBox /> {quantity}x {productTitle}
                </li>
              );
            })}
          </ul>

          {/* Fulfillment History */}
          {orderDetails.fulfillment_history?.L && (
            <>
              <p>
                <FaClock /> <strong>Fulfillment History:</strong>
              </p>
              <ul>
                {orderDetails.fulfillment_history.L.map((entry, index) => {
                  const productId = entry.M.product_id?.S || 'N/A';
                  const productTitle = productTitles[productId] || `Product ID: ${productId}`;
                  const stock = entry.M.stock?.S || 'N/A';
                  const timestamp = entry.M.timestamp?.S || 'N/A';
                  return (
                    <li key={index} className="fulfillment-entry">
                      <div className="fulfillment-item">
                        <span className="fulfillment-label">Product:</span>
                        <span className="fulfillment-content">
                          <FaBox /> {productTitle}
                        </span>
                      </div>
                      <div className="fulfillment-item">
                        <span className="fulfillment-label">Stock:</span>
                        <span className="fulfillment-content">{stock}</span>
                      </div>
                      <div className="timestamp">
                        <FaClock /> <span className="fulfillment-label">Timestamp:</span> {new Date(timestamp).toLocaleString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ) : (
        <p>No order details available.</p>
      )}
    </Modal>
  );
};
