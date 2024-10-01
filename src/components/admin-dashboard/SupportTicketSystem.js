import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal'; // Import Modal from react-modal
import { fetchSupportTickets, issueReplacement } from '../../utils/api'; // Include the issueReplacement API call
import { FaInfoCircle } from 'react-icons/fa'; // Import the info circle icon from react-icons
import { checkPermissionAndFetchData } from './utils/adminUtils';
import './styles/SupportTicketSystem.css'; // Ensure proper styling

// Modal style configuration
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

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
    // Simulated operator data fetching; replace with actual API call if necessary
    console.log('Fetching operator email...');
    return {
      email: 'operator@example.com',
    };
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
        const userAttributes = await checkPermissionAndFetchData(fetchOperatorEmail, 'Matrix_GetOperator', '9999');
        console.log('Operator email fetched:', userAttributes.email);
        setOperatorEmail(userAttributes.email); // Set the operator's email
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
                  color="dodgerblue"
                  onClick={() => openModal(ticket)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Ticket Details Modal"
      >
        {selectedTicket ? (
          <div>
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
            <button onClick={handleIssueReplacement} className="issue-replacement-btn">Issue Replacement</button>
            <button onClick={closeModal} className="close-btn">Close</button>
          </div>
        ) : (
          <p>Loading ticket details...</p>
        )}
      </Modal>
    </div>
  );
};

Modal.setAppElement('#root');

export default SupportTicketSystem;
