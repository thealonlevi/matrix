import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import {
  FaUser,
  FaEnvelope,
  FaInfoCircle,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimes,
  FaStickyNote,
  FaHistory
} from 'react-icons/fa';
import { updateTicketUnreadStatus } from '../../utils/api';
import './styles/TicketDetailsModal.css';

const TicketDetailsModal = ({ modalIsOpen, closeModal, selectedTicket }) => {
  const [localUnread, setLocalUnread] = useState(selectedTicket?.unread);

  // Function to get status-specific CSS class
  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'status-resolved';
      case 'denied':
        return 'status-denied';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  // Effect to update unread status if necessary
  useEffect(() => {
    const markAsRead = async () => {
      if (selectedTicket && (localUnread === true || localUnread === undefined)) {
        console.log("Unread Status:", localUnread);
        try {
          await updateTicketUnreadStatus(selectedTicket.ticket_id, false);
          console.log('Ticket marked as read.');
          setLocalUnread(false); // Update the local state to reflect the read status
        } catch (error) {
          console.error('Error marking ticket as read:', error);
        }
      }
    };

    if (modalIsOpen) {
      markAsRead();
    }
  }, [modalIsOpen, selectedTicket, localUnread]);

  useEffect(() => {
    if (selectedTicket) {
      setLocalUnread(selectedTicket.unread);
    }
  }, [selectedTicket]);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="ticket-details-modal"
      overlayClassName="ticket-details-overlay"
      contentLabel="Ticket Details Modal"
    >
      {selectedTicket ? (
        <div>
          <FaTimes className="modal-close-icon" onClick={closeModal} />
          <h2>Ticket Details</h2>

          {/* Display Ticket Information */}
          <p>
            <FaInfoCircle /> <strong>Issue:</strong> {selectedTicket.issue}
          </p>
          <p className={getStatusClass(selectedTicket.status)}>
            <FaCheckCircle /> <strong>Status:</strong> {selectedTicket.status}
          </p>
          <p>
            <FaCalendarAlt /> <strong>Creation Date:</strong> {selectedTicket.creationDate}
          </p>
          <p>
            <FaCalendarAlt /> <strong>Last Modified:</strong> {selectedTicket.lastModificationDate}
          </p>
          <p>
            <FaStickyNote /> <strong>Message:</strong> {selectedTicket.message}
          </p>

          {/* Display Notices */}
          <p>
            <FaStickyNote /> <strong>Notices:</strong>
          </p>
          <div className="notices-container scrollable-section">
            {selectedTicket.notice && selectedTicket.notice.length > 0 ? (
              selectedTicket.notice.map((notice, index) => (
                <div key={index} className="notice-item">
                  <p><FaCalendarAlt /> <strong>Timestamp:</strong> {notice.timestamp}</p>
                  <div className="notice-content">
                    <FaStickyNote /> {notice.notice_content}
                  </div>
                </div>
              ))
            ) : (
              <p>No notices available.</p>
            )}
          </div>

          {/* Display Ticket History */}
          <p>
            <FaHistory /> <strong>History:</strong>
          </p>
          <div className="history-container scrollable-section">
            {selectedTicket.history?.map((historyItem, index) => (
              <div key={index} className="history-item">
                <p><FaCheckCircle /> <strong>Action:</strong> {historyItem.action}</p>
                <p><FaCalendarAlt /> <strong>Timestamp:</strong> {historyItem.timestamp}</p>
              </div>
            ))}
          </div>

          <button onClick={closeModal} className="modal-close-button">Close</button>
        </div>
      ) : (
        <p>Loading ticket details...</p>
      )}
    </Modal>
  );
};

export default TicketDetailsModal;
