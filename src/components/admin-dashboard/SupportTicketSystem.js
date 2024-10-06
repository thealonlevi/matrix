import React, { useState, useEffect, useRef } from 'react';
import { fetchSupportTickets } from '../../utils/api';
import { FaInfoCircle, FaTimes, FaExchangeAlt, FaDollarSign, FaBan, FaCheckCircle, FaSearch } from 'react-icons/fa';
import Modal from 'react-modal';
import './styles/SupportTicketSystem.css';
import { getProductTitleById } from './utils/adminUtils';
import { useNotification } from './utils/Notification';
import {
  fetchOperatorEmail,
  fetchOperatorUserId,
  handleIssueReplacement,
  handleCredit,
  handleResolveDeny,
} from './utils/ticketUtils';

const SupportTicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [creditModalIsOpen, setCreditModalIsOpen] = useState(false);
  const [replacementModalIsOpen, setReplacementModalIsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [operatorEmail, setOperatorEmail] = useState('');
  const [operatorUserId, setOperatorUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [replacementQuantity, setReplacementQuantity] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchIssue, setSearchIssue] = useState('');

  const { showNotification } = useNotification(); // Notification hook
  const initRef = useRef(false);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const fetchedTickets = await fetchSupportTickets();
        const sortedTickets = fetchedTickets.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets);
      } catch (err) {
        setError('Failed to load tickets');
        showNotification('Failed to load tickets. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    const getOperatorInfo = async () => {
      try {
        const userEmail = await fetchOperatorEmail();
        const userId = await fetchOperatorUserId();
        setOperatorUserId(userId);
        setOperatorEmail(userEmail);
      } catch (error) {
        console.error('Error fetching operator info:', error);
        showNotification('Failed to fetch operator information.', 'error');
      }
    };

    if (!initRef.current) {
      initRef.current = true;
      loadTickets();
      getOperatorInfo();
    }
  }, [showNotification]);

  useEffect(() => {
    const filtered = tickets.filter((ticket) => {
      return (
        (!searchEmail || ticket.userEmail.includes(searchEmail)) &&
        (!searchOrderId || ticket.orderID.includes(searchOrderId)) &&
        (!searchUserId || ticket.userId?.includes(searchUserId)) &&
        (!searchProductName || productTitle?.toLowerCase().includes(searchProductName.toLowerCase())) &&
        (!searchStatus || ticket.status === searchStatus) &&
        (!searchIssue || ticket.issue === searchIssue)
      );
    });
    setFilteredTickets(filtered);
  }, [searchEmail, searchOrderId, searchUserId, searchProductName, searchStatus, searchIssue, tickets, productTitle]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const openModal = async (ticket) => {
    setSelectedTicket(ticket);
    const title = await getProductTitleById(ticket.product_id);
    const productTitle = title ? title : `Product ID: ${ticket.product_id}`;
    setProductTitle(productTitle);
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

  const handleReplacement = async () => {
    if (!selectedTicket) return;
    try {
      await handleIssueReplacement({
        userEmail: selectedTicket.userEmail,
        ticket_id: selectedTicket.ticket_id,
        operator: operatorEmail,
        product_id: selectedTicket.product_id,
        quantity: parseInt(replacementQuantity, 10),
        orderID: selectedTicket.orderID,
      });
      showNotification('Replacement issued successfully.', 'success');
      closeReplacementModal();
    } catch (error) {
      showNotification('Failed to issue replacement. Please try again.', 'error');
    }
  };

  const handleAddCredit = async () => {
    if (!selectedTicket) return;
    try {
      await handleCredit(
        {
          user_email: selectedTicket.userEmail,
          ticket_id: selectedTicket.ticket_id,
          operator: operatorEmail,
          staff_user_id: operatorUserId,
          credit_amount: parseFloat(creditAmount),
        },
        operatorUserId
      );
      showNotification('Credit added successfully.', 'success');
      closeCreditModal();
    } catch (error) {
      showNotification('Failed to add credit. Please try again.', 'error');
    }
  };

  const handleResolveOrDeny = async (status) => {
    if (!selectedTicket) return;
    try {
      await handleResolveDeny({
        ticket_id: selectedTicket.ticket_id,
        status,
        staff_email: operatorEmail,
      });
      
      // Update ticket status in the UI
      const updatedTickets = tickets.map((ticket) =>
        ticket.ticket_id === selectedTicket.ticket_id ? { ...ticket, status } : ticket
      );
      setTickets(updatedTickets);
      setFilteredTickets(updatedTickets);

      showNotification(`Ticket ${status} successfully.`, 'success');
      closeModal(); // Close modal after resolving/denying
    } catch (error) {
      showNotification(`Failed to ${status} ticket. Please try again.`, 'error');
    }
  };

  return (
    <div className="support-ticket-system">
      <h2>Support Ticket System</h2>

      <button className="toggle-filter-button" onClick={toggleFilters}>
        <FaSearch /> {filtersVisible ? 'Hide Filters' : 'Show Filters'}
      </button>

      {filtersVisible && (
        <div className="filter-section">
          <input type="text" placeholder="Search by Email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
          <input type="text" placeholder="Search by Order ID" value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)} />
          <input type="text" placeholder="Search by User ID" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <input type="text" placeholder="Search by Product Name" value={searchProductName} onChange={(e) => setSearchProductName(e.target.value)} />
          <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="denied">Denied</option>
          </select>
          <select value={searchIssue} onChange={(e) => setSearchIssue(e.target.value)}>
            <option value="">Select Issue</option>
            <option value="Invalid login">Invalid login</option>
            <option value="Missing points/card">Missing points/card</option>
            <option value="2FA/not able to login">2FA/not able to login</option>
            <option value="Locked">Locked</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Email</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Modified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((ticket) => (
            <tr key={ticket.ticket_id} className={ticket.status === 'pending' ? 'pending-row' : ''}>
              <td>{ticket.orderID}</td>
              <td>{ticket.userEmail}</td>
              <td>{ticket.issue}</td>
              <td className={ticket.status === 'resolved' ? 'resolved' : ticket.status === 'denied' ? 'denied' : 'unresolved'}>{ticket.status}</td>
              <td>{ticket.lastModificationDate}</td>
              <td>
                <FaInfoCircle className="info-icon" size={24} onClick={() => openModal(ticket)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal-content" overlayClassName="modal-overlay" contentLabel="Ticket Details Modal">
        {selectedTicket ? (
          <div>
            <FaTimes className="modal-close-icon" onClick={closeModal} />
            <h2>Ticket Details</h2>
            <p><strong>Order ID:</strong> {selectedTicket.orderID}</p>
            <p><strong>Email:</strong> {selectedTicket.userEmail}</p>
            <p><strong>Issue:</strong> {selectedTicket.issue}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            <p><strong>Last Modified:</strong> {selectedTicket.lastModificationDate}</p>
            <p><strong>Ticket ID:</strong> {selectedTicket.ticket_id}</p>
            <p><strong>Product Name:</strong> {productTitle}</p>
            <p><strong>Operator:</strong> {operatorEmail}</p>
            <p><strong>Creation Date:</strong> {selectedTicket.creationDate}</p>
            <div className="button-container">
              <button onClick={openReplacementModal} className="icon-btn issue-replacement-btn">
                <FaExchangeAlt size={20} />
              </button>
              <button onClick={openCreditModal} className="icon-btn credit-btn">
                <FaDollarSign size={20} />
              </button>
              {selectedTicket.status === 'pending' && (
                <>
                  <button className="icon-btn resolve-btn" onClick={() => handleResolveOrDeny('resolved')}>
                    <FaCheckCircle size={20} />
                  </button>
                  <button className="icon-btn deny-replacement-btn" onClick={() => handleResolveOrDeny('denied')}>
                    <FaBan size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <p>Loading ticket details...</p>
        )}
      </Modal>

      <Modal isOpen={creditModalIsOpen} onRequestClose={closeCreditModal} className="modal-content" overlayClassName="modal-overlay" contentLabel="Credit Modal">
        <FaTimes className="modal-close-icon" onClick={closeCreditModal} />
        <h2>Add Credit</h2>
        <p>How much credit would you like to add?</p>
        <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} min="0.01" step="0.01" />
        <div className="button-container">
          <button onClick={handleAddCredit} className="confirm-btn">
            Confirm
          </button>
        </div>
      </Modal>

      <Modal isOpen={replacementModalIsOpen} onRequestClose={closeReplacementModal} className="modal-content" overlayClassName="modal-overlay" contentLabel="Replacement Modal">
        <FaTimes className="modal-close-icon" onClick={closeReplacementModal} />
        <h2>Issue Replacement</h2>
        <p>How many replacements would you like to issue?</p>
        <input type="number" value={replacementQuantity} onChange={(e) => setReplacementQuantity(e.target.value)} min="1" />
        <div className="button-container">
          <button onClick={handleReplacement} className="confirm-btn">
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

Modal.setAppElement('#root');

export default SupportTicketSystem;
