import React, { useState, useEffect } from 'react';
import { fetchSupportTickets } from '../../utils/api';
import './styles/SupportTicketSystem.css'; // Create CSS for the ticket system

const SupportTicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const fetchedTickets = await fetchSupportTickets();
        setTickets(fetchedTickets);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets');
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

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
            <th>Ticket ID</th>
            <th>Order ID</th>
            <th>Owner</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id}>
              <td>{ticket.ticket_id}</td>
              <td>{ticket.orderID}</td>
              <td>{ticket.ownerEmail}</td>
              <td>{ticket.issue}</td>
              <td className={ticket.status === 'resolved' ? 'resolved' : 'unresolved'}>
                {ticket.status}
              </td>
              <td>{ticket.lastModificationDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupportTicketSystem;
