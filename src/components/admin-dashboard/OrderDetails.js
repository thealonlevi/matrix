import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './styles/OrderDetails.css';
import { checkPermissionAndFetchData, fetchData, getUserIdForOrder, getProductTitleById, getGroupTitleById } from './utils/adminUtils';
import { useNotification } from './utils/Notification';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productTitles, setProductTitles] = useState({});
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [fulfillmentLoading, setFulfillmentLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]); // State for expanded fulfillment entries

  // Notification hook
  const { showNotification } = useNotification();

  // Use ref to track marking paid state
  const isMarkingPaidRef = useRef(false);

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

      // Fetch titles for the fulfillment history
      if (parsedData.fulfillment_history?.L) {
        const fulfillmentTitles = await fetchProductTitles(parsedData.fulfillment_history?.L.map(item => ({
          M: { product_id: item.M.product_id }
        })));
        setProductTitles(prevTitles => ({ ...prevTitles, ...fulfillmentTitles }));
      }
    }
  };

  const fetchProductTitles = async (orderContents) => {
    const titles = {};
    for (const item of orderContents) {
      const productId = item.M.product_id?.S || item.M.product_id?.N;
      let productTitle = await getProductTitleById(productId);

      // Check if the product is under a group
      if (productId.includes('/')) {
        const [groupId, productIdOnly] = productId.split('/');
        const groupTitle = await getGroupTitleById(groupId);
        if (groupTitle && !productTitle.includes(groupTitle)) {
          // Concatenate group title and product title only if productTitle doesn't already contain groupTitle
          productTitle = `${groupTitle} - ${productTitle}`;
        }
      }

      titles[productId] = productTitle;
    }
    return titles;
  };

  const markAsPaid = async () => {
    // Prevent further actions if already marking as paid
    if (isMarkingPaidRef.current) return;
  
    // Update the ref to prevent further clicks
    isMarkingPaidRef.current = true;
    setIsMarkingPaid(true);
  
    try {
      // Prepare the request payload in the required format
      const requestBody = {
        body: JSON.stringify({
          order_id: orderDetails.orderId?.S,
          requested_status: 'paid',
        }),
      };
  
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyOrderStatusSQS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Convert the request payload to JSON string
      });
  
      if (response.ok) {
        // Update the order status in the UI
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          payment_status: { S: 'paid' },
        }));
        showNotification('Order status updated to Paid successfully.', 'success'); // Show success notification
      } else {
        const errorResponse = await response.json();
        showNotification(`Failed to update order status: ${errorResponse.error}`, 'error'); // Show error notification
      }
    } catch (err) {
      showNotification(`Error updating order status: ${err.message}`, 'error'); // Show error notification
    } finally {
      // Reset ref and state after the request is complete
      isMarkingPaidRef.current = false;
      setIsMarkingPaid(false);
    }
  };

  const handleFulfillment = async (productId) => {
    const quantity = prompt(`Enter the quantity to fulfill for product ID: ${productId}`);
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      showNotification('Please enter a valid quantity.', 'error');
      return;
    }

    setFulfillmentLoading(true);
    try {
      const requestBody = {
        order_id: orderId,
        product_id: productId,
        quantity: parseInt(quantity, 10)
      };

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FulfillOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        showNotification('Product fulfilled successfully.', 'success');
        // Refetch order details to update the UI
        await fetchOrderDetails();
      } else {
        const errorResponse = await response.json();
        showNotification(`Failed to fulfill product: ${errorResponse.error}`, 'error');
      }
    } catch (err) {
      showNotification(`Error fulfilling product: ${err.message}`, 'error');
    } finally {
      setFulfillmentLoading(false);
    }
  };

  // Function to toggle expand/collapse for stock entries
  const toggleExpand = (index) => {
    setExpandedItems((prevState) =>
      prevState.includes(index) ? prevState.filter((i) => i !== index) : [...prevState, index]
    );
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
                <button
                  onClick={() => handleFulfillment(productId)}
                  disabled={fulfillmentLoading}
                  className="fulfill-button"
                >
                  Fulfill
                </button>
              </li>
            );
          })}
        </ul>
        {/* Display Fulfillment History if it exists */}
        {orderDetails.fulfillment_history?.L && (
          <>
            <p><strong>Fulfillment History:</strong></p>
            <ul>
              {orderDetails.fulfillment_history.L.map((entry, index) => {
                const productId = entry.M.product_id?.S;
                const productTitle = productTitles[productId] || `Product ID: ${productId}`;
                const stockEntries = entry.M.stock?.S.split('>').map((stockItem, i) => (
                  <p key={i}>{stockItem.trim()}</p>
                ));
                const isLongStock = entry.M.stock?.S.length > 100; // Condition to check if stock is long
                return (
                  <li key={index} className="fulfillment-entry">
                    <div className="fulfillment-item">
                      <span className="fulfillment-label">Product:</span>
                      <span className="fulfillment-content">{productTitle}</span>
                    </div>
                    <div className="fulfillment-item">
                      <span className="fulfillment-label">Stock:</span>
                      <div className={`fulfillment-content fulfillment-stock ${expandedItems.includes(index) ? 'expanded' : ''}`}>
                        {stockEntries}
                        {isLongStock && (
                          <button className="toggle-expand" onClick={() => toggleExpand(index)}>
                            {expandedItems.includes(index) ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="timestamp">Timestamp: {new Date(entry.M.timestamp?.S).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {/* Mark as Paid button */}
        {orderDetails.payment_status?.S === 'unpaid' && (
          <button onClick={markAsPaid} disabled={isMarkingPaid} className="mark-as-paid-button">
            {isMarkingPaid ? 'Marking as Paid...' : 'Mark As Paid'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
