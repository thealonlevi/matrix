import React, { useState } from 'react';
import { submitSupportTicket } from '../../utils/api';
import './styles/Create_Ticket.css'; // Add your styles here

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Example ticket data
    const ticketData = {
      ticket_id: `ticket-${Date.now()}`, // Mock ticket ID
      orderID,
      ownerEmail: "useremail@example.com", // Replace with actual user's email from auth
      creationDate: new Date().toLocaleString(),
      lastModificationDate: new Date().toLocaleString(),
      issue,
      product,
      productOption: 'No Locks', // Example product option, you can change this based on UI
      replacementsCountAsked: parseInt(replacementsCount, 10),
      status: 'pending',
      message: `${message}\nProof: ${imgurImageLink}`,
    };

    // Wrap ticket data in the required 'body' field as per the API requirements
    const requestBody = {
      body: JSON.stringify(ticketData)
    };

    try {
      const response = await submitSupportTicket(requestBody);
      console.log(response);
      setSuccess(true); // Show success message
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
          <h3>How to perform new ticket?</h3>
          <ul>
            <li>Copy order ID from the Orders page.</li>
            <li>Select the product, issue, and provide necessary details.</li>
            <li>Include proof images using Imgur and submit.</li>
          </ul>
        </div>

        <div className="form-group">
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
            {/* Add more products here */}
          </select>
        </div>

        <div className="form-group">
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
