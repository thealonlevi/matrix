import React from 'react';
import Modal from 'react-modal';
import { FaTimes, FaDollarSign, FaSave } from 'react-icons/fa';

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

export default CreditModal;
