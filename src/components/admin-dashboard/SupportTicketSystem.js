import React, { useState, useEffect, useRef } from 'react';
import { fetchSupportTickets, issueReplacement } from '../../utils/api'; // Include the issueReplacement API call
import { FaInfoCircle, FaTimes } from 'react-icons/fa'; // Import the info circle and times (X) icon from react-icons
import { fetchUserAttributes } from 'aws-amplify/auth';
import Modal from 'react-modal';
import './styles/SupportTicketSystem.css'; // Ensure proper styling

const SupportTicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility
  const [selectedTicket, setSelectedTicket] = useState(null); // State for the selected ticket
  const [operatorEmail, setOperatorEmail] = useState(''); // Operator's email state
  const [quantity, setQuantity] = useState(1); // State to handle quantity
  const initRef = useRef(false); // Add useRef to track initialization

  // Function to fetch the operator's email (this will be the fetchCallback)
  const fetchOperatorEmail = async () => {
    const userResponse = await fetchUserAttributes();
    const { email } = userResponse;

    return email;
  };

  useEffect(() => {
    const loadTickets = async () => {
      console.log('Loading tickets...');
      try {
        const fetchedTickets = await fetchSupportTickets();
        setTickets(fetchedTickets);
        console.log('Tickets loaded:', fetchedTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    const getOperatorEmail = async () => {
      try {
        console.log('Getting operator email...');
        // Check permissions and fetch operator email
        const userEmail = await fetchOperatorEmail();
        console.log('Operator email fetched:', userEmail);
        setOperatorEmail(userEmail); // Set the operator's email
      } catch (error) {
        console.error('Error fetching operator email:', error);
      }
    };

    // Prevent multiple initializations
    if (!initRef.current) {
      initRef.current = true;
      loadTickets();
      getOperatorEmail();
    }
  }, []);

  // Function to open modal and set the selected ticket
  const openModal = (ticket) => {
    setSelectedTicket(ticket); // Set the ticket information to show in modal
    setModalIsOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTicket(null); // Reset the selected ticket when modal closes
    setQuantity(1); // Reset the quantity input when modal closes
  };

  // Handle issuing the replacement
  const handleIssueReplacement = async () => {
    if (!selectedTicket) return;

    const replacementData = {
      userEmail: selectedTicket.userEmail,
      ticket_id: selectedTicket.ticket_id, // Use ticket_id from the ticket
      operator: operatorEmail, // Use the fetched operator's email
      product_id: selectedTicket.product_id, // Fetch product_id from the ticket (ensure it's part of the ticket data)
      quantity, // Quantity inputted by the operator
      orderID: selectedTicket.orderID, // Use orderID from the ticket
    };

    console.log('Sending replacement request:', replacementData);
    try {
      const response = await issueReplacement(replacementData); // API call to Lambda
      console.log('Replacement request sent, response:', response);
      alert('Issue replacement request submitted successfully!');
      closeModal();
    } catch (error) {
      console.error('Error issuing replacement:', error);
      alert('Failed to submit issue replacement.');
    }
  };

  if (loading) {
    return <p>Loading tickets...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="support-ticket-system">
      <h2>Support Ticket System</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Email</th>
            <th>Status</th>
            <th>Modified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id}>
              <td>{ticket.orderID}</td>
              <td>{ticket.userEmail}</td>
              <td className={ticket.status === 'resolved' ? 'resolved' : 'unresolved'}>
                {ticket.status}
              </td>
              <td>{ticket.lastModificationDate}</td>
              <td>
                <FaInfoCircle
                  className="info-icon"
                  size={24}
                  onClick={() => openModal(ticket)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Ticket Details Modal"
      >
        {selectedTicket ? (
          loading ? (
            <div className="modal-loading">Loading ticket details...</div>
          ) : (
            <div>
              {/* Use FaTimes Icon for Close Button */}
              <FaTimes className="modal-close-icon" onClick={closeModal} />

              <h2>Ticket Details</h2>
              <p><strong>Order ID:</strong> {selectedTicket.orderID}</p>
              <p><strong>Email:</strong> {selectedTicket.userEmail}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>
              <p><strong>Last Modified:</strong> {selectedTicket.lastModificationDate}</p>
              <p><strong>Ticket ID:</strong> {selectedTicket.ticket_id}</p>
              <p><strong>Product ID:</strong> {selectedTicket.product_id}</p>
              <p><strong>Operator:</strong> {operatorEmail}</p>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
              <button onClick={handleIssueReplacement} className="issue-replacement-btn">
                Issue Replacement
              </button>
            </div>
          )
        ) : (
          <p>Loading ticket details...</p>
        )}
      </Modal>
    </div>
  );
};
Modal.setAppElement('#root'); // Make sure to set this to your app's root element ID

export default SupportTicketSystem;
