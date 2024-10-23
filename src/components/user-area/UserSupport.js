import React, { useEffect, useState } from 'react';
import { fetchUserTickets } from '../../utils/api';
import TicketDetailsModal from './TicketDetailsModal'; // Import the TicketDetailsModal component
import './styles/UserSupport.css'; // Custom CSS for table and modal

const UserSupport = ({ userEmail }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // To store the currently selected ticket

  // Fetch user tickets on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetchUserTickets(userEmail);
        const fetchedTickets = JSON.parse(response.body).tickets;
        const sortedTickets = fetchedTickets.sort(
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

  // Open the modal when a ticket is clicked
  const openModal = (ticket) => {
    setSelectedTicket(ticket); // Set the selected ticket data
    setModalIsOpen(true); // Open the modal
  };

  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false); // Close the modal
    setSelectedTicket(null); // Clear the selected ticket
  };

  // Show a loading state
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
              <th>Issue</th>
              <th>Status</th>
              <th>Creation Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} onClick={() => openModal(ticket)} className="ticket-row">
                <td>{ticket.ticket_id}</td>
                <td>{ticket.issue}</td>
                <td>{ticket.status}</td>
                <td>{ticket.creationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Render the TicketDetailsModal */}
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
