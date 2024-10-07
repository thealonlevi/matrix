// src/components/admin-dashboard/ticket-system/TicketModals.js
import React from 'react';
import { FaTimes, FaExchangeAlt, FaDollarSign, FaBan, FaCheckCircle } from 'react-icons/fa';
import Modal from 'react-modal';
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
}) => (
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
        <p><strong>Product Name:</strong> {productTitle}</p>
        <p><strong>Issue:</strong> {selectedTicket.issue}</p>
        <p><strong>Status:</strong> {selectedTicket.status}</p>
        <p><strong>Creation Date:</strong> {selectedTicket.creationDate}</p>
        <p><strong>Replacements Asked:</strong> {selectedTicket.replacementsCountAsked || 0}</p>
        <p><strong>Message:</strong></p>
        <div className="message-box">{selectedTicket.message || 'N/A'}</div>
        <p><strong>History:</strong></p>
        <div className="history-container">
          {selectedTicket.history?.map((historyItem, index) => (
            <div key={index} className="history-item">
              <p><strong>Action:</strong> {historyItem.action}</p>
              <p><strong>Operator:</strong> {historyItem.operator}</p>
              <p><strong>Timestamp:</strong> {historyItem.timestamp}</p>
              {historyItem.new_status && <p><strong>New Status:</strong> {historyItem.new_status}</p>}
              {historyItem.exported_stock && <p><strong>Exported Stock:</strong> {historyItem.exported_stock}</p>}
              {historyItem.quantity && <p><strong>Quantity:</strong> {historyItem.quantity}</p>}
            </div>
          ))}
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
      </div>
    ) : (
      <p>Loading ticket details...</p>
    )}
  </Modal>
);

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
      <button onClick={handleAddCredit} className="confirm-btn">
        Confirm
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
    <h2>Issue Replacement</h2>
    <p>How many replacements would you like to issue?</p>
    <input
      type="number"
      value={replacementQuantity}
      onChange={(e) => setReplacementQuantity(e.target.value)}
      min="1"
    />
    <div className="button-container">
      <button onClick={handleReplacement} className="confirm-btn">
        Confirm
      </button>
    </div>
  </Modal>
);
