import React, { useState, useEffect } from 'react';
import { submitSupportTicket } from '../../utils/api';
import { FiFileText, FiShoppingCart, FiMessageSquare, FiCamera, FiHash } from 'react-icons/fi'; // Feather icons
import './styles/Create_Ticket.css';  // Your CSS styles
import { fetchUserAttributes } from 'aws-amplify/auth';

const CreateTicket = () => {
  const [orderID, setOrderID] = useState('');
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Ticket data payload to be sent to the API
    const body = {
      orderID,
      ownerEmail: userEmail,  // Replace with actual user email from context or auth
      issue,
      product,
      productOption: "No Locks",
      replacementsCountAsked: parseInt(replacementsCount, 10),
      status: "pending",
      message: `${message}\nProof: ${imgurImageLink}`, // Backticks are used here for string interpolation
    };

    const ticketData =
    {
        body: JSON.stringify(body)
    };
    console.log("Payload being sent to API:", body);  // Log the payload

    try {
      // Submit the ticket data using your API
      const response = await submitSupportTicket(ticketData);  // Body will be converted to JSON in the API call
      console.log(response);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError('Error submitting the ticket. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const userResponse = await fetchUserAttributes();
          const userId = userResponse.sub;
          const { email } = userResponse;
  
          setUserEmail(email);
          setUserId(userId);
            console.log("THE EMAIL:", email);
          
        } catch (err) {
          console.error('Error fetching user data or credits:', err);
          setError('An error occurred while fetching user data.');
        }
    
      };
      fetchUserData();
    })
 

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

        <div className="form-group">
          <FiHash size={20} />
          <label htmlFor="orderID">Order ID</label>
          <input
            type="text"
            id="orderID"
            value={orderID}
            onChange={(e) => setOrderID(e.target.value)}
            required
          />
        </div>

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
            <option value="Product1">Product 1</option>
            <option value="Product2">Product 2</option>
          </select>
        </div>

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
