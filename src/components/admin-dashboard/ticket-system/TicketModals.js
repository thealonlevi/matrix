// src/components/admin-dashboard/ticket-system/TicketModals.js

import React, { useState } from 'react';
import {
  FaUser,
  FaClock,
  FaBox,
  FaCartPlus,
  FaTimes,
  FaEdit,
  FaExchangeAlt,
  FaDollarSign,
  FaCheckCircle,
  FaBan,
  FaSave,
  FaEnvelope,
  FaShoppingCart,
  FaClipboardList,
  FaCalendarAlt,
  FaInfoCircle,
  FaHistory,
  FaStickyNote,
  FaPencilAlt,
} from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md'; // Import pencil with paper icon
import Modal from 'react-modal';
import { insertTicketNote } from '../../../utils/api';
import { TicketOrderDetailsModal } from './TicketOrderDetailsModal'; // Import the new Order Details Modal
import './TicketModals.css';

// Ticket Details Modal
export const TicketDetailsModal = ({
  modalIsOpen,
  closeModal,
  selectedTicket,
  productTitle,
  handleResolveOrDeny,
  openCreditModal,
  openReplacementModal,
  isResolving,
}) => {
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false); // New state for Order Details Modal
  const [newNoteContent, setNewNoteContent] = useState('');

  // Function to handle note submission
  const handleNoteSubmit = async () => {
    try {
      const ticketId = selectedTicket.ticket_id;
      await insertTicketNote(ticketId, newNoteContent);
      setNewNoteContent('');
      setAddNoteModalOpen(false);
      alert('Note added successfully!');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
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
          <p>
            <FaClipboardList /> <strong>Order ID:</strong>{' '}
            <a
              href="#"
              onClick={() => setOrderDetailsModalOpen(true)}
              className="order-id-link"
            >
              {selectedTicket.orderID}
            </a>
          </p>
          <p>
            <FaEnvelope /> <strong>Email:</strong> {selectedTicket.userEmail}
          </p>
          <p>
            <FaShoppingCart /> <strong>Product Name:</strong> {productTitle}
          </p>
          <p>
            <FaInfoCircle /> <strong>Issue:</strong> {selectedTicket.issue}
          </p>
          <p>
            <FaCheckCircle /> <strong>Status:</strong> {selectedTicket.status}
          </p>
          <p>
            <FaCalendarAlt /> <strong>Creation Date:</strong> {selectedTicket.creationDate}
          </p>
          <p>
            <FaCartPlus /> <strong>Replacements Asked:</strong> {selectedTicket.replacementsCountAsked || 0}
          </p>
          <p>
            <FaEdit /> <strong>Message:</strong>
          </p>
          <div className="message-box">{selectedTicket.message || 'N/A'}</div>
          <p>
            <FaHistory /> <strong>History:</strong>
          </p>
          <div className="history-container">
            {selectedTicket.history?.map((historyItem, index) => (
              <div key={index} className="history-item">
                <p>
                  <FaEdit /> <strong>Action:</strong> {historyItem.action}
                </p>
                <p>
                  <FaUser /> <strong>Operator:</strong> {historyItem.operator}
                </p>
                <p>
                  <FaClock /> <strong>Timestamp:</strong> {historyItem.timestamp}
                </p>
                {historyItem.new_status && (
                  <p>
                    <FaExchangeAlt /> <strong>New Status:</strong> {historyItem.new_status}
                  </p>
                )}
                {historyItem.exported_stock && (
                  <p>
                    <FaBox /> <strong>Exported Stock:</strong> {historyItem.exported_stock}
                  </p>
                )}
                {historyItem.quantity && (
                  <p>
                    <FaCartPlus /> <strong>Quantity:</strong> {historyItem.quantity}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Staff Notes Section */}
          <p>
            <FaStickyNote /> <strong>Staff Notes:</strong>
          </p>
          <div className="notes-container">
            {selectedTicket.staff_notes && selectedTicket.staff_notes.length > 0 ? (
              selectedTicket.staff_notes.map((note, index) => (
                <div key={index} className="note-item">
                  <p><FaUser /> <strong>Staff:</strong> {note.staff_email}</p>
                  <p><FaClock /> <strong>Timestamp:</strong> {note.timestamp}</p>
                  <div className="note-content">
                    <FaStickyNote /> {note.note_content}
                  </div>
                </div>
              ))
            ) : (
              <p>No notes added yet.</p>
            )}
            {/* Clickable Pencil with Paper Icon for Adding Note */}
            <MdEditNote size={24} className="add-note-icon" onClick={() => setAddNoteModalOpen(true)} />
          </div>

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
                  onClick={() => handleResolveOrDeny('resolved')}
                  disabled={isResolving}
                >
                  <FaCheckCircle size={20} />
                </button>
                <button
                  className="icon-btn deny-replacement-btn"
                  onClick={() => handleResolveOrDeny('denied')}
                  disabled={isResolving}
                >
                  <FaBan size={20} />
                </button>
              </>
            )}
          </div>

          {/* Add Note Modal */}
          <Modal
            isOpen={addNoteModalOpen}
            onRequestClose={() => setAddNoteModalOpen(false)}
            className="modal-content"
            overlayClassName="modal-overlay"
            contentLabel="Add Note Modal"
          >
            <FaTimes className="modal-close-icon" onClick={() => setAddNoteModalOpen(false)} />
            <h2>
              <FaStickyNote /> Add Staff Note
            </h2>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter your note here..."
              rows="4"
              className="note-textarea"
            />
            <div className="button-container">
              <button onClick={handleNoteSubmit} className="confirm-btn">
                <FaSave /> Submit Note
              </button>
            </div>
          </Modal>

          {/* New Order Details Modal */}
          <TicketOrderDetailsModal
            orderDetailsModalIsOpen={orderDetailsModalOpen}
            closeOrderDetailsModal={() => setOrderDetailsModalOpen(false)}
            orderId={selectedTicket.orderID} // Pass Order ID here
          />
        </div>
      ) : (
        <p>Loading ticket details...</p>
      )}
    </Modal>
  );
};

// Credit Modal
export const CreditModal = ({
  creditModalIsOpen,
  closeCreditModal,
  creditAmount,
  setCreditAmount,
  handleAddCredit,
}) => (
  <Modal
    isOpen={creditModalIsOpen}
    onRequestClose={closeCreditModal}
    className="modal-content"
    overlayClassName="modal-overlay"
    contentLabel="Credit Modal"
  >
    <FaTimes className="modal-close-icon" onClick={closeCreditModal} />
    <h2>
      <FaDollarSign /> Add Credit
    </h2>
    <p>How much credit would you like to add?</p>
    <input
      type="number"
      value={creditAmount}
      onChange={(e) => setCreditAmount(e.target.value)}
      min="0.01"
      step="0.01"
    />
    <div className="button-container">
      <button onClick={handleAddCredit} className="confirm-btn">
        <FaSave /> Confirm
      </button>
    </div>
  </Modal>
);

// Replacement Modal
export const ReplacementModal = ({
  replacementModalIsOpen,
  closeReplacementModal,
  replacementQuantity,
  setReplacementQuantity,
  handleReplacement,
}) => (
  <Modal
    isOpen={replacementModalIsOpen}
    onRequestClose={closeReplacementModal}
    className="modal-content"
    overlayClassName="modal-overlay"
    contentLabel="Replacement Modal"
  >
    <FaTimes className="modal-close-icon" onClick={closeReplacementModal} />
    <h2>
      <FaExchangeAlt /> Issue Replacement
    </h2>
    <p>How many replacements would you like to issue?</p>
    <input
      type="number"
      value={replacementQuantity}
      onChange={(e) => setReplacementQuantity(e.target.value)}
      min="1"
    />
    <div className="button-container">
      <button onClick={handleReplacement} className="confirm-btn">
        <FaSave /> Confirm
      </button>
    </div>
  </Modal>
);