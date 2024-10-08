import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MdOutlineExpandMore, MdOutlineExpandLess, MdCheckCircleOutline, MdAttachMoney, MdErrorOutline } from 'react-icons/md';
import { FaClipboardList, FaInfoCircle, FaEnvelope, FaDollarSign, FaCalendarAlt, FaDesktop, FaGlobe, FaUser, FaShoppingCart, FaBoxes, FaUserShield } from 'react-icons/fa';
import { GiPriceTag, GiCheckMark } from 'react-icons/gi';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import './styles/OrderDetails.css';
import { checkPermissionAndFetchData, getUserIdForOrder, getProductTitleById, getGroupTitleById } from './utils/adminUtils';
import { useNotification } from './utils/Notification';
import { fetchOrderDetails, modifyOrderStatusSQS, fulfillOrder } from '../../utils/api'; // Importing the relevant API functions

const OrderDetails = () => {
  // Extract the order ID from the URL parameters
  const { orderId } = useParams();

  // State management for order details and UI states
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productTitles, setProductTitles] = useState({});
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [fulfillmentLoading, setFulfillmentLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]); // State for expanded fulfillment entries

  // Notification hook
  const { showNotification } = useNotification();

  // Use refs to track marking paid state and initial fetch state
  const isMarkingPaidRef = useRef(false);
  const fetchCalledRef = useRef(false); // Add a ref to prevent duplicate fetches

  // Fetch order details from the API and update the state
  const fetchOrderDetailsHandler = async () => {
    const userId = getUserIdForOrder(orderId);
    if (!userId) {
      showNotification("User ID not found for this order.", 'error');
      return;
    }

    try {
      const data = await fetchOrderDetails(orderId);
      if (data) {
        const parsedData = JSON.parse(data.body); // Assuming the response is inside a 'body' field
        setOrderDetails(parsedData);

        // Fetch product titles from the order contents
        const titles = await fetchProductTitles(parsedData.order_contents?.L);
        setProductTitles(titles);

        // Fetch titles for the fulfillment history, if available
        if (parsedData.fulfillment_history?.L) {
          const fulfillmentTitles = await fetchProductTitles(
            parsedData.fulfillment_history?.L.map(item => ({
              M: { product_id: item.M.product_id },
            }))
          );
          setProductTitles(prevTitles => ({ ...prevTitles, ...fulfillmentTitles }));
        }
      }
    } catch (error) {
      showNotification("Failed to fetch order details. Please try again later.", 'error');
      console.error("Error fetching order details: ", error);
    }
  };

  // Helper function to fetch product titles based on order contents
  const fetchProductTitles = async (orderContents) => {
    const titles = {};
    for (const item of orderContents) {
      const productId = item.M.product_id?.S || item.M.product_id?.N;
      let productTitle = await getProductTitleById(productId);

      // Check if the product is under a group and get group title if applicable
      if (productId.includes('/')) {
        const [groupId, productIdOnly] = productId.split('/');
        const groupTitle = await getGroupTitleById(groupId);
        if (groupTitle && !productTitle.includes(groupTitle)) {
          // Concatenate group title and product title
          productTitle = `${groupTitle} - ${productTitle}`;
        }
      }
      titles[productId] = productTitle;
    }
    return titles;
  };

  // Handler to mark the order as paid
  const markAsPaid = async () => {
    if (isMarkingPaidRef.current) return;
    isMarkingPaidRef.current = true;
    setIsMarkingPaid(true);

    try {
      const responseMessage = await modifyOrderStatusSQS(orderDetails.orderId?.S, 'paid');
      if (responseMessage) {
        setOrderDetails(prevDetails => ({
          ...prevDetails,
          payment_status: { S: 'paid' },
        }));
        showNotification("Order status updated to Paid successfully.", 'success');
      }
    } catch (err) {
      showNotification('Error updating order status: {err.message}', 'error');
    } finally {
      isMarkingPaidRef.current = false;
      setIsMarkingPaid(false);
    }
  };

  // Handler to fulfill a product in the order
  const handleFulfillment = async (productId) => {
    const quantity = prompt("Enter the quantity to fulfill for product ID: {productId}");
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      showNotification("Please enter a valid quantity.", 'error');
      return;
    }
    const note = prompt("Why are you fulfilling this?");
    if (!note) {
      showNotification("Please specify a reason.", 'error');
      return;
    }

    setFulfillmentLoading(true);
    try {
      const responseMessage = await fulfillOrder(orderId, productId, parseInt(quantity, 10), note);
      if (responseMessage) {
        showNotification("Product fulfilled successfully.", 'success');
        await fetchOrderDetailsHandler(); // Refetch order details to update the UI
      }
    } catch (err) {
      showNotification("Error fulfilling product: {err.message}", 'error');
    } finally {
      setFulfillmentLoading(false);
    }
  };

  // Function to toggle expand/collapse for stock entries
  const toggleExpand = (index) => {
    setExpandedItems(prevState =>
      prevState.includes(index) ? prevState.filter(i => i !== index) : [...prevState, index]
    );
  };

  // Fetch order details on component mount
  useEffect(() => {
    const init = async () => {
      if (!fetchCalledRef.current) {
        fetchCalledRef.current = true;
        try {
          await checkPermissionAndFetchData(fetchOrderDetailsHandler, 'Matrix_FetchOrderDetails', '99990');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [orderId]);

  if (loading) return <p><MdOutlineExpandMore /> Loading order details...</p>;
  if (error) return <p className="error"><MdErrorOutline /> {error}</p>;
  if (!orderDetails) return <p>No order details available.</p>;

  const total = parseFloat(orderDetails.total_price?.S || '0');
  const final = parseFloat(orderDetails.final_price?.S || '0');
  const discount = total - final;

  return (
    <div className="order-details-container">
      <h1 className="order-details-title"><FaClipboardList /> Order Details</h1>
      <div className="order-details-content">
        <p><FaInfoCircle /><strong> Order ID:</strong> {orderDetails.orderId?.S || 'N/A'}</p>
        <p><FaEnvelope /><strong> Email:</strong> {orderDetails.user_email?.S || 'N/A'}</p>
        <p><FaDollarSign /><strong> Total Price:</strong>  ${orderDetails.total_price?.S || 'N/A'}</p>
        <p><GiPriceTag /><strong> Discount:</strong>  {discount > 0 ? `- $${discount.toFixed(2)}` : 'No discount applied'}</p>
        <p><FaDollarSign /><strong> Final Price:</strong>  ${orderDetails.final_price?.S || 'N/A'}</p>
        <p><FaUserShield /><strong> Payment Status:</strong>  {orderDetails.payment_status?.S || 'N/A'}</p>
        <p><FaCalendarAlt /><strong> Order Date:</strong>  {new Date(orderDetails.order_date?.S).toLocaleString() || 'N/A'}</p>
        <p><FaGlobe /><strong> IP Address:</strong>  {orderDetails.ip_address?.S || 'N/A'}</p>
        <p><FaDesktop /><strong> Device Type:</strong>  {orderDetails.device_type?.S || 'N/A'}</p>
        <p><FaUser /> <strong> User Agent:</strong> {orderDetails.user_agent?.S || 'N/A'}</p>
        <p><FaShoppingCart /><strong> Order Contents:</strong> </p>
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
                  <FaBoxes /> Fulfill
                </button>
              </li>
            );
          })}
        </ul>
        {orderDetails.fulfillment_history?.L && (
          <>
            <p><strong><FaBoxes /> Fulfillment History:</strong></p>
            <ul>
              {orderDetails.fulfillment_history.L.map((entry, index) => {
                const productId = entry.M.product_id?.S;
                const productTitle = productTitles[productId] || `Product ID: ${productId}`;
                const stockEntries = entry.M.stock?.S.split('>').map((stockItem, i) => (
                  <p key={i}>{stockItem.trim()}</p>
                ));
                const isLongStock = entry.M.stock?.S.length > 100;
                return (
                  <li key={index} className="fulfillment-entry">
                    <div className="fulfillment-item">
                      <span className="fulfillment-label"><FaClipboardList /> Product:</span>
                      <span className="fulfillment-content">{productTitle}</span>
                    </div>
                    <div className="fulfillment-item">
                      <span className="fulfillment-label"><FaBoxes /> Stock:</span>
                      <div className={`fulfillment-content fulfillment-stock ${expandedItems.includes(index) ? 'expanded' : ''}`}>
                        {stockEntries}
                        {isLongStock && (
                          <button className="toggle-expand" onClick={() => toggleExpand(index)}>
                            {expandedItems.includes(index) ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />} {expandedItems.includes(index) ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="timestamp"><FaInfoCircle /> Timestamp: {new Date(entry.M.timestamp?.S).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {orderDetails.payment_status?.S === 'unpaid' && (
          <button onClick={markAsPaid} disabled={isMarkingPaid} className="mark-as-paid-button">
            {isMarkingPaid ? 'Marking as Paid...' : <MdAttachMoney />} Mark As Paid
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
