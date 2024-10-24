import React, { useState, useEffect } from 'react';
import { submitSupportTicket, fetchUserOrders } from '../../utils/api';
import { FiFileText, FiShoppingCart, FiMessageSquare, FiCamera, FiHash } from 'react-icons/fi';
import './styles/Create_Ticket.css';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { getProductTitleById } from '../admin-dashboard/utils/adminUtils';
import ImageUpload from '../admin-dashboard/ImageUpload';

const CreateTicket = () => {
  const [orderID, setOrderID] = useState('');
  const [orders, setOrders] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [product, setProduct] = useState('');
  const [issue, setIssue] = useState('');
  const [replacementsCount, setReplacementsCount] = useState(0);
  const [maxReplacementsCount, setMaxReplacementsCount] = useState(0); // New state for max replacements count
  const [imgurImageLink, setImgurImageLink] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Predefined list of issues
  const issueOptions = [
    'Invalid login',
    'Missing points/card',
    '2FA/not able to login',
    'Locked',
    'Other'
  ];

  // Fetch user's previous orders and user attributes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetchUserAttributes();
        const { email, sub: userId } = userResponse;

        setUserEmail(email);
        setUserId(userId);

        console.log("User Email:", email);
        console.log("User ID:", userId);

        const response = await fetchUserOrders({
          email,
          userId,
        });

        if (response.body) {
          const responseBody = JSON.parse(response.body);
          if (responseBody.orders) {
            const sortedOrders = responseBody.orders.sort((a, b) => {
              const dateA = new Date(a.order_date);
              const dateB = new Date(b.order_date);
              return dateB - dateA; // Sort by descending date (latest first)
            });
            setOrders(sortedOrders);
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
            let productTitle = await getProductTitleById(item.product_id);

            console.log(`Fetching product title for product ID ${productId}`);
            console.log(`Product title fetched: ${productTitle}`);

            if (!productTitle) {
              productTitle = `Product ID: ${productId}`;
            }

            return {
              id: `${groupId}/${productId}`,
              title: `${productTitle}`,
              quantity: item.quantity // Include the quantity for max replacement count
            };
          }));
          setProductOptions(productOptions);
        }
      }
    };

    fetchTitlesForOrder();
  }, [orderID, orders]);

  // Automatically select the single product if only one is available
  useEffect(() => {
    if (productOptions.length === 1) {
      setProduct(productOptions[0].id); // Automatically set the single product ID
      setMaxReplacementsCount(productOptions[0].quantity); // Set the max replacement count
    }
  }, [productOptions]);

  // Update max replacements count when a product is selected
  useEffect(() => {
    if (orderID && product) {
      const selectedOrder = orders.find(order => order.orderId === orderID);
      if (selectedOrder) {
        const selectedProduct = selectedOrder.order_contents.find(item => item.product_id === product);
        if (selectedProduct) {
          setMaxReplacementsCount(selectedProduct.quantity);
        }
      }
    }
  }, [orderID, product, orders]);

  const handleReplacementsChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10); // Handle empty string input
    if (value === '' || (value <= maxReplacementsCount && value >= 0)) {
      setReplacementsCount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const body = {
      orderID,
      userEmail,
      userId,
      issue,
      product_id: product,
      replacementsCountAsked: parseInt(replacementsCount, 10),
      status: "pending",
      message: message,
      image: imgurImageLink,
    };
    
    const ticketData = {
      body: JSON.stringify(body)
    };
    console.log("Payload being sent to API:", body);

    try {
      const response = await submitSupportTicket(ticketData);
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
            <li>Include proof images and submit.</li>
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

        {/* Dropdown for Product */}
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

        {/* Dropdown for Issue */}
        <div className="form-group">
          <FiMessageSquare size={20} />
          <label htmlFor="issue">Issue</label>
          <select
            id="issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          >
            <option value="" disabled>Select an issue</option>
            {issueOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Replacements Count */}
        <div className="form-group">
          <FiFileText size={20} />
          <label htmlFor="replacementsCount">Replacements Count</label>
          <input
            type="number"
            id="replacementsCount"
            value={replacementsCount}
            onChange={handleReplacementsChange}
            required
            min="0"
            max={maxReplacementsCount}
          />
        </div>

        {/* Image Upload Component */}
        <div className="form-group">
          <FiCamera size={20} />
          <label>Upload Proof Images (Optional)</label>
          <ImageUpload onUploadSuccess={(url) => setImgurImageLink(url)} /> {/* Use ImageUpload for uploading proof images */}
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
