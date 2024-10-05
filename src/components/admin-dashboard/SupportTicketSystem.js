import React, { useState, useEffect, useRef } from 'react';
import { fetchSupportTickets, issueReplacement, addCreditViaTicket, logRequest, resolveOrDenyTicket } from '../../utils/api'; 
import { FaInfoCircle, FaTimes, FaExchangeAlt, FaDollarSign, FaBan, FaCheckCircle, FaSearch } from 'react-icons/fa'; 
import { fetchUserAttributes } from 'aws-amplify/auth';
import Modal from 'react-modal';
import './styles/SupportTicketSystem.css'; 
import { getProductTitleById } from './utils/adminUtils';

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
  const [filtersVisible, setFiltersVisible] = useState(false); // Toggle filter visibility
  const [filteredTickets, setFilteredTickets] = useState([]); // Filtered tickets list

  // Filter states
  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchIssue, setSearchIssue] = useState('');

  const initRef = useRef(false);

  const fetchOperatorEmail = async () => {
    const userResponse = await fetchUserAttributes();
    const { email } = userResponse;
    return email;
  };
  
  const fetchOperatorUserId = async () => {
    const response = await fetchUserAttributes();
    const { sub } = response;
    const userId = sub;
    return userId;
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const fetchedTickets = await fetchSupportTickets();
        const sortedTickets = fetchedTickets.sort(
          (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
        );
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets); // Set filtered tickets initially to all tickets
      } catch (err) {
        setError('Failed to load tickets');
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
      }
    };

    if (!initRef.current) {
      initRef.current = true;
      loadTickets();
      getOperatorInfo();
    }
  }, []);

  // This effect will run whenever any of the filter values change and will apply the filters in real-time
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
      await issueReplacement(replacementData); 
      alert('Issue replacement request submitted successfully!');
      closeReplacementModal();
    } catch (error) {
      alert('Failed to submit issue replacement.');
    }
  };

  const handleCredit = async () => {
    if (!selectedTicket) return;

    const creditAmountValue = parseFloat(creditAmount);
    if (isNaN(creditAmountValue) || creditAmountValue <= 0) {
      alert('Please enter a valid credit amount.');
      return;
    }
    
    const creditData = {
      user_email: selectedTicket.userEmail,
      ticket_id: selectedTicket.ticket_id,
      operator: operatorEmail,  
      staff_user_id: operatorUserId,  
      credit_amount: creditAmountValue,
    };

    try {
      const logSuccess = await logRequest('Matrix_AddCredit', operatorUserId);
      if (!logSuccess) {
        throw new Error('Failed to log the add credit request.');
      }

      const response = await addCreditViaTicket(creditData);
      if (response.statusCode === 200) {
        alert('Credit added successfully!');
        closeCreditModal();
      } else {
        const parsedResponse = JSON.parse(response.body);
        alert(`Failed to add credit: ${parsedResponse.message || 'Unknown error'}`);
      }

    } catch (error) {
      alert('Failed to add credit.');
    }
  };

  const handleResolveDeny = async (action) => {
    if (!selectedTicket) return;

    const resolveDenyData = {
      ticket_id: selectedTicket.ticket_id,
      status: action,
      staff_email: operatorEmail
    };

    try {
      const response = await resolveOrDenyTicket(resolveDenyData);
      if (response.statusCode === 200) {
        alert(`Ticket ${action} successfully!`);
        
        setTickets(prevTickets => 
          prevTickets.map(ticket =>
            ticket.ticket_id === selectedTicket.ticket_id 
              ? { ...ticket, status: action }
              : ticket
          )
        );

        setSelectedTicket({ ...selectedTicket, status: action });
      } else {
        alert('Failed to update ticket status.');
      }
    } catch (error) {
      alert(`Failed to ${action} ticket.`);
    }
  };

  return (
    <div className="support-ticket-system">
      <h2>Support Ticket System</h2>

      {/* Toggle Filter Button */}
      <button className="toggle-filter-button" onClick={toggleFilters}>
        <FaSearch /> {filtersVisible ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filter Section */}
      {filtersVisible && (
        <div className="filter-section">
          <input
            type="text"
            placeholder="Search by Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by User ID"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by Product Name"
            value={searchProductName}
            onChange={(e) => setSearchProductName(e.target.value)}
          />
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="denied">Denied</option>
          </select>
          <select
            value={searchIssue}
            onChange={(e) => setSearchIssue(e.target.value)}
          >
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
            <tr key={ticket.ticket_id}>
              <td>{ticket.orderID}</td>
              <td>{ticket.userEmail}</td>
              <td>{ticket.issue}</td>
              <td className={
                ticket.status === 'resolved' ? 'resolved' :
                ticket.status === 'denied' ? 'denied' : 'unresolved'
              }>
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

      {/* Modal Sections */}
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
                  <button
                    className="icon-btn resolve-btn"
                    onClick={() => handleResolveDeny('resolved')}
                  >
                    <FaCheckCircle size={20} />
                  </button>
                  <button
                    className="icon-btn deny-replacement-btn"
                    onClick={() => handleResolveDeny('denied')}
                  >
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
