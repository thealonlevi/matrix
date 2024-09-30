import React, { useState, useEffect } from 'react';
import { fetchSupportTickets } from '../../utils/api';
import './styles/SupportTicketSystem.css'; // Ensure proper styling

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
            <th>Order ID</th>
            <th>Email</th>
            <th>Status</th>
            <th>Modified</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupportTicketSystem;
