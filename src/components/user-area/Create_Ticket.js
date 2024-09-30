import React, { useState, useEffect } from 'react';
import { submitSupportTicket, fetchUserOrders } from '../../utils/api';  // Assuming you have an API utility to fetch user orders
import { FiFileText, FiShoppingCart, FiMessageSquare, FiCamera, FiHash } from 'react-icons/fi'; // Feather icons
import './styles/Create_Ticket.css';  // Your CSS styles
import { fetchUserAttributes } from 'aws-amplify/auth';
import { getGroupTitleById, getProductTitleById } from '../admin-dashboard/utils/adminUtils';

const CreateTicket = () => {
  const [orderID, setOrderID] = useState('');  // To store the selected order ID
  const [orders, setOrders] = useState([]);  // For storing fetched orders
  const [productOptions, setProductOptions] = useState([]);  // To store the combined group and product names
  const [product, setProduct] = useState('');
  const [issue, setIssue] = useState('');
  const [replacementsCount, setReplacementsCount] = useState(0);
  const [imgurImageLink, setImgurImageLink] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Fetch user's previous orders and user attributes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user attributes
        const userResponse = await fetchUserAttributes();
        const { email, sub: userId } = userResponse;

        setUserEmail(email);
        setUserId(userId);

        console.log("User Email:", email);
        console.log("User ID:", userId);

        // Fetch user orders from the API
        const response = await fetchUserOrders({
          email: email,  // Pass user email
          userId: userId,  // Pass user ID
        });

        if (response.body) {
          const responseBody = JSON.parse(response.body);
          if (responseBody.orders) {
            setOrders(responseBody.orders);  // Set orders in state
            console.log("Fetched Orders:", responseBody.orders);
          } else {
            setError('No orders found for this user.');
          }
        } else {
          setError('Failed to fetch user orders.');
        }
      } catch (err) {
        console.error('Error fetching user orders or user data:', err);
        setError('An error occurred while fetching user data or orders.');
      }
    };

    fetchUserData();
  }, []);

  // Update productOptions based on selected Order ID
  useEffect(() => {
    const fetchTitlesForOrder = async () => {
      if (orderID) {
        const selectedOrder = orders.find(order => order.orderId === orderID);
        if (selectedOrder) {
          const productOptions = await Promise.all(selectedOrder.order_contents.map(async (item) => {
            const [groupId, productId] = item.product_id.split('/');
            const groupTitle = await getGroupTitleById(groupId);
            let productTitle = await getProductTitleById(item.product_id);

            // Log to debug the product title fetching
            console.log(`Fetching product title for product ID ${productId}`);
            console.log(`Product title fetched: ${productTitle}`);

            // Fallback if productTitle is not fetched correctly
            if (!productTitle) {
              productTitle = `Product ID: ${productId}`;
            }

            return {
              id: `${groupId}/${productId}`,
              title: `${productTitle}`
            };
          }));
          setProductOptions(productOptions);  // Set the combined group and product names
        }
      }
    };

    fetchTitlesForOrder();
  }, [orderID, orders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Ticket data payload to be sent to the API
    const body = {
      orderID,
      userEmail,  // Changed from ownerEmail to userEmail
      userId,  // Added userId
      issue,
      product_id: product,  // Product ID as "groupID/productID"
      replacementsCountAsked: parseInt(replacementsCount, 10),
      status: "pending",
      message: `${message}\nProof: ${imgurImageLink}`,  // Use backticks for string interpolation
    };
    
    const ticketData = {
      body: JSON.stringify(body)
    };
    console.log("Payload being sent to API:", body);  // Log the payload

    try {
      // Submit the ticket data using your API
      const response = await submitSupportTicket(ticketData);  // API call to submit the ticket
      console.log(response);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError('Error submitting the ticket. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <h2>Submit Ticket</h2>
      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="instructions">
          <h3>How to create a new ticket?</h3>
          <ul>
            <li>Copy order ID from the Orders page.</li>
            <li>Select the product, issue, and provide necessary details.</li>
            <li>Include proof images using Imgur and submit.</li>
          </ul>
        </div>

        {/* Dropdown for Order ID */}
        <div className="form-group">
          <FiHash size={20} />
          <label htmlFor="orderID">Order ID</label>
          <select
            id="orderID"
            value={orderID}
            onChange={(e) => setOrderID(e.target.value)}
            required
          >
            <option value="" disabled>Select an order</option>
            {orders.map((order) => {
              const formattedDate = isNaN(new Date(order.order_date))
                ? 'Unknown Date'
                : new Date(order.order_date).toLocaleDateString();

              return (
                <option key={order.orderId} value={order.orderId}>
                  {order.orderId} - {formattedDate}
                </option>
              );
            })}
          </select>
        </div>

        {/* Dropdown for Product (combined group and product names) */}
        <div className="form-group">
          <FiShoppingCart size={20} />
          <label htmlFor="product">Product</label>
          <select
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          >
            <option value="" disabled>Select a product</option>
            {productOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Text Field */}
        <div className="form-group">
          <FiMessageSquare size={20} />
          <label htmlFor="issue">Issue</label>
          <input
            type="text"
            id="issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />
        </div>

        {/* Replacements Count */}
        <div className="form-group">
          <FiFileText size={20} />
          <label htmlFor="replacementsCount">Replacements Count</label>
          <input
            type="number"
            id="replacementsCount"
            value={replacementsCount}
            onChange={(e) => setReplacementsCount(e.target.value)}
            required
          />
        </div>

        {/* Imgur Image Link */}
        <div className="form-group">
          <FiCamera size={20} />
          <label htmlFor="imgurImageLink">Proof Images (Imgur link)</label>
          <input
            type="text"
            id="imgurImageLink"
            value={imgurImageLink}
            onChange={(e) => setImgurImageLink(e.target.value)}
            placeholder="https://imgur.com/..."
          />
        </div>

        {/* Message Text Area */}
        <div className="form-group">
          <FiMessageSquare size={20} />
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            required
          ></textarea>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Ticket submitted successfully!</p>}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
