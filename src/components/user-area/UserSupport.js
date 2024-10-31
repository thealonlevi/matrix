import React, { useEffect, useState } from 'react';
import { fetchUserTickets, updateTicketUnreadStatus } from '../../utils/api';
import TicketDetailsModal from './TicketDetailsModal';
import { getProductTitleById } from '../admin-dashboard/utils/adminUtils';
import './styles/UserSupport.css';

const UserSupport = ({ userEmail }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetchUserTickets(userEmail);
        const fetchedTickets = JSON.parse(response.body).tickets;

        const ticketsWithTitles = await Promise.all(
          fetchedTickets.map(async (ticket) => {
            const [mainProductId] = ticket.product_id.split('/');
            const productTitle = await getProductTitleById(mainProductId.toString());
            return {
              ...ticket,
              productTitle: productTitle || `Product ID: ${ticket.product_id}`, // Fall back to ID if title not found
            };
          })
        );

        const sortedTickets = ticketsWithTitles.sort(
          (a, b) => new Date(b.lastModificationDate) - new Date(a.lastModificationDate)
        );
        setTickets(sortedTickets);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load support tickets.');
        setLoading(false);
      }
    };

    if (userEmail) fetchTickets();
  }, [userEmail]);

  // Open the modal when a ticket is clicked and mark as read if it was unread
  const openModal = async (ticket) => {
    setSelectedTicket(ticket);
    setModalIsOpen(true);

    // Update the unread status if it's true
    if (ticket.unread) {
      try {
        await updateTicketUnreadStatus(ticket.ticket_id, false);
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.ticket_id === ticket.ticket_id ? { ...t, unread: false } : t
          )
        );
      } catch (error) {
        console.error('Failed to update ticket unread status:', error);
      }
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTicket(null);
  };

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-support-section">
      <h2>Your Support Tickets</h2>
      {tickets.length === 0 ? (
        <p>No support tickets found.</p>
      ) : (
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Product</th> {/* Updated to display Product Title */}
              <th>Issue</th>
              <th>Status</th>
              <th>Creation Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} onClick={() => openModal(ticket)} className={`ticket-row ${ticket.unread ? 'ticket-unread' : ''}`}>
                <td>{ticket.ticket_id}</td>
                <td>{ticket.productTitle}</td> {/* Display Product Title */}
                <td>{ticket.issue}</td>
                <td>{ticket.status}</td>
                <td>{ticket.creationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTicket && (
        <TicketDetailsModal
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          selectedTicket={selectedTicket}
        />
      )}
    </div>
  );
};

export default UserSupport;
