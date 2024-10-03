import React, { useState, useEffect, useRef } from 'react';
import { fetchSupportTickets, issueReplacement } from '../../utils/api';
import { FaInfoCircle, FaTimes } from 'react-icons/fa'; 
import { fetchUserAttributes } from 'aws-amplify/auth';
import Modal from 'react-modal';
import './styles/SupportTicketSystem.css'; 

const SupportTicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false); 
  const [creditModalIsOpen, setCreditModalIsOpen] = useState(false); 
  const [replacementModalIsOpen, setReplacementModalIsOpen] = useState(false); // State to control replacement modal
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [operatorEmail, setOperatorEmail] = useState(''); 
  const [creditAmount, setCreditAmount] = useState(''); 
  const [replacementQuantity, setReplacementQuantity] = useState(''); // State for replacement quantity
  const initRef = useRef(false); 

  const fetchOperatorEmail = async () => {
    const userResponse = await fetchUserAttributes();
    const { email } = userResponse;
    return email;
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const fetchedTickets = await fetchSupportTickets();
        setTickets(fetchedTickets);
      } catch (err) {
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    const getOperatorEmail = async () => {
      try {
        const userEmail = await fetchOperatorEmail();
        setOperatorEmail(userEmail); 
      } catch (error) {
        console.error('Error fetching operator email:', error);
      }
    };

    if (!initRef.current) {
      initRef.current = true;
      loadTickets();
      getOperatorEmail();
    }
  }, []);

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTicket(null);
  };

  const openCreditModal = () => {
    setCreditModalIsOpen(true);
  };

  const closeCreditModal = () => {
    setCreditModalIsOpen(false);
    setCreditAmount('');
  };

  const openReplacementModal = () => {
    setReplacementModalIsOpen(true);
  };

  const closeReplacementModal = () => {
    setReplacementModalIsOpen(false);
    setReplacementQuantity('');
  };

  const handleIssueReplacement = async () => {
    if (!selectedTicket) return;
    const quantity = parseInt(replacementQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity.');
      return;
    }

    const replacementData = {
      userEmail: selectedTicket.userEmail,
      ticket_id: selectedTicket.ticket_id, 
      operator: operatorEmail, 
      product_id: selectedTicket.product_id, 
      quantity,
      orderID: selectedTicket.orderID, 
    };

    try {
      const response = await issueReplacement(replacementData); 
      alert('Issue replacement request submitted successfully!');
      closeReplacementModal();
    } catch (error) {
      alert('Failed to submit issue replacement.');
    }
  };

  const handleCredit = () => {
    console.log(`Credit amount entered: ${creditAmount}`);
    closeCreditModal();
  };

  const handleResolve = () => {
    console.log('Ticket resolved.');
    // Placeholder functionality: log the resolve action
    // Future implementation can include updating the status in the backend.
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
          <div>
            <FaTimes className="modal-close-icon" onClick={closeModal} />
            <h2>Ticket Details</h2>
            <p><strong>Order ID:</strong> {selectedTicket.orderID}</p>
            <p><strong>Email:</strong> {selectedTicket.userEmail}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            <p><strong>Last Modified:</strong> {selectedTicket.lastModificationDate}</p>
            <p><strong>Ticket ID:</strong> {selectedTicket.ticket_id}</p>
            <p><strong>Product ID:</strong> {selectedTicket.product_id}</p>
            <p><strong>Operator:</strong> {operatorEmail}</p>
            <div className="button-container">
              <button onClick={openReplacementModal} className="issue-replacement-btn">
                Issue Replacement
              </button>
              <button onClick={openCreditModal} className="credit-btn">Credit</button> 
              <button className="deny-replacement-btn">Deny Replacement</button>
              <button onClick={handleResolve} className="resolve-btn">Resolve</button> {/* Resolve button */}
            </div>
          </div>
        ) : (
          <p>Loading ticket details...</p>
        )}
      </Modal>

      {/* Credit Modal */}
      <Modal
        isOpen={creditModalIsOpen}
        onRequestClose={closeCreditModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Credit Modal"
      >
        <FaTimes className="modal-close-icon" onClick={closeCreditModal} />
        <h2>Add Credit</h2>
        <p>How much credit would you like to add?</p>
        <input
          type="number"
          value={creditAmount}
          onChange={(e) => setCreditAmount(e.target.value)}
          min="0.01"
          step="0.01"
        />
        <div className="button-container">
          <button onClick={handleCredit} className="confirm-btn">Confirm</button>
        </div>
      </Modal>

      {/* Replacement Modal */}
      <Modal
        isOpen={replacementModalIsOpen}
        onRequestClose={closeReplacementModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Replacement Modal"
      >
        <FaTimes className="modal-close-icon" onClick={closeReplacementModal} />
        <h2>Issue Replacement</h2>
        <p>How many replacements would you like to issue?</p>
        <input
          type="number"
          value={replacementQuantity}
          onChange={(e) => setReplacementQuantity(e.target.value)}
          min="1"
        />
        <div className="button-container">
          <button onClick={handleIssueReplacement} className="confirm-btn">Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

Modal.setAppElement('#root'); 

export default SupportTicketSystem;
