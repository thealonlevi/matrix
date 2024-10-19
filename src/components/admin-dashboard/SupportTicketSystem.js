import React, { useState, useEffect, useRef } from 'react';
import { fetchSupportTickets, getProductList } from '../../utils/api'; 
import { FaArrowLeft, FaArrowRight, FaInfoCircle, FaSearch } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
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
import { TicketDetailsModal } from './ticket-system/TicketModals';
import ReplacementModal from './ticket-system/ReplacementModal';
import CreditModal from './ticket-system/CreditModal';

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
  const [productStockCount, setProductStockCount] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ticketsPerPage = 10;

  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchIssue, setSearchIssue] = useState('');

  const { showNotification } = useNotification();
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
    setCurrentPage(0);
  }, [searchEmail, searchOrderId, searchUserId, searchProductName, searchStatus, searchIssue, tickets, productTitle]);

  const openModal = async (ticket) => {
    setSelectedTicket(ticket);
  
    const [mainProductId] = ticket.product_id.split('/');
    const productTitle = await getProductTitleById(mainProductId.toString());
    setProductTitle(productTitle || `Product ID: ${ticket.product_id}`);
  
    const productList = await getProductList();
    const mainProduct = productList.find((p) => p.product_id === parseInt(mainProductId, 10));
    let stockCount = null;
  
    if (mainProduct && mainProduct.product_group) {
      const subProduct = mainProduct.product_group.find((group) => group.product_id === parseInt(ticket.product_id.split('/')[1], 10));
      if (subProduct) {
        stockCount = subProduct.available_stock_count;
      }
    }
  
    setProductStockCount(stockCount);
    setModalIsOpen(true);
  };
  
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTicket(null);
    setProductStockCount(null);
  };

  const handleAddCredit = async () => {
    setCreditModalIsOpen(false);
    if (!selectedTicket) return;
    try {
      await handleCredit(
        {
          user_email: selectedTicket.userEmail,
          ticket_id: selectedTicket.ticket_id,
          order_id: selectedTicket.orderID,
          operator: operatorEmail,
          staff_user_id: operatorUserId,
          credit_amount: parseFloat(creditAmount),
        },
        operatorUserId
      );
      showNotification('Credit added successfully.', 'success');
      setCreditAmount('');
    } catch (error) {
      setCreditModalIsOpen(false);
      showNotification('Failed to add credit. Please try again.', 'error');
    }
  };

  const handleReplacement = async () => {
    if (!selectedTicket) return;
    if (productStockCount < selectedTicket.replacementsCountAsked) {
      showNotification('Not enough stock, please resort to credit.', 'error');
      setReplacementModalIsOpen(false);
      setReplacementQuantity('');
      return;
    }
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
      setReplacementModalIsOpen(false);
      setReplacementQuantity('');
    } catch (error) {
      showNotification('Failed to issue replacement. Please try again.', 'error');
    }
  };

  const handleResolveOrDeny = async (status) => {
    if (!selectedTicket || isResolving) return;
    setIsResolving(true);
    try {
      await handleResolveDeny({
        ticket_id: selectedTicket.ticket_id,
        status,
        staff_email: operatorEmail,
      });
      const updatedTickets = tickets.map((ticket) =>
        ticket.ticket_id === selectedTicket.ticket_id ? { ...ticket, status } : ticket
      );
      setTickets(updatedTickets);
      setFilteredTickets(updatedTickets);
      showNotification(`Ticket ${status} successfully.`, 'success');
      setIsResolving(false);
      closeModal();
    } catch (error) {
      setIsResolving(false);
      showNotification(`Failed to ${status} ticket. Please try again.`, 'error');
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="support-ticket-system-unique">
      <h2>Support Ticket System</h2>

      <button className="toggle-filter-button-unique" onClick={() => setFiltersVisible(!filtersVisible)}>
        <FaSearch /> {filtersVisible ? 'Hide Filters' : 'Show Filters'}
      </button>

      {filtersVisible && (
        <div className="filter-section-unique">
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

      <table className="tickets-table-unique">
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
          {filteredTickets.slice(currentPage * ticketsPerPage, (currentPage + 1) * ticketsPerPage).map((ticket) => (
            <tr key={ticket.ticket_id} className={ticket.status === 'pending' ? 'pending-row-unique' : ''}>
              <td>{ticket.orderID}</td>
              <td>{ticket.userEmail}</td>
              <td>{ticket.issue}</td>
              <td className={ticket.status === 'resolved' ? 'resolved-unique' : ticket.status === 'denied' ? 'denied-unique' : 'unresolved-unique'}>{ticket.status}</td>
              <td>{ticket.lastModificationDate}</td>
              <td>
                <FaInfoCircle className="info-icon-unique" size={24} onClick={() => openModal(ticket)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container-unique">
        <ReactPaginate
          previousLabel={'← Previous'}
          nextLabel={'Next →'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={Math.ceil(filteredTickets.length / ticketsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'}
        />
      </div>

      <TicketDetailsModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        selectedTicket={selectedTicket}
        productTitle={productTitle}
        handleResolveOrDeny={handleResolveOrDeny}
        openCreditModal={() => setCreditModalIsOpen(true)}
        openReplacementModal={() => setReplacementModalIsOpen(true)}
        isResolving={isResolving}
        productStockCount={productStockCount}
      />
      <CreditModal
        creditModalIsOpen={creditModalIsOpen}
        closeCreditModal={() => setCreditModalIsOpen(false)}
        creditAmount={creditAmount}
        setCreditAmount={setCreditAmount}
        handleAddCredit={handleAddCredit}
      />
      <ReplacementModal
        replacementModalIsOpen={replacementModalIsOpen}
        closeReplacementModal={() => setReplacementModalIsOpen(false)}
        replacementQuantity={replacementQuantity}
        setReplacementQuantity={setReplacementQuantity}
        handleReplacement={handleReplacement}
      />
    </div>
  );
};

export default SupportTicketSystem;
