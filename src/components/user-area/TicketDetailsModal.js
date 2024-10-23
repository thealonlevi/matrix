import React from 'react';
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
import './styles/TicketDetailsModal.css';

const TicketDetailsModal = ({ modalIsOpen, closeModal, selectedTicket }) => {

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
