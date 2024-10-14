import React from 'react';
import Modal from 'react-modal';
import { FaTimes, FaExchangeAlt, FaSave } from 'react-icons/fa';

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

export default ReplacementModal;
