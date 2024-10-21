import React from 'react';
import Modal from 'react-modal';
import { FaTimes, FaExchangeAlt, FaSave } from 'react-icons/fa';

export const ReplacementModal = ({
  replacementModalIsOpen,
  closeReplacementModal,
  replacementQuantity,
  setReplacementQuantity,
  replacementNote,            // New state for the note
  setReplacementNote,         // New setter for the note
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

    {/* New Note Input for the Replacement Reason */}
    <p>Please provide a reason for issuing the replacement:</p>
    <textarea
      value={replacementNote}                   // Bind note value
      onChange={(e) => setReplacementNote(e.target.value)} // Update note value
      rows="4"
      placeholder="Enter the reason for issuing the replacement..."
    />

    <div className="button-container">
      <button onClick={handleReplacement} className="confirm-btn">
        <FaSave /> Confirm
      </button>
    </div>
  </Modal>
);

export default ReplacementModal;
