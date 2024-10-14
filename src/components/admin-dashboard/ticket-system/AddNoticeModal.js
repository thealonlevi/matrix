// src/components/admin-dashboard/ticket-system/AddNoticeModal.js
import React from 'react';
import { FaTimes, FaStickyNote, FaSave } from 'react-icons/fa';
import Modal from 'react-modal';

const AddNoticeModal = ({ isOpen, closeModal, newNoticeContent, setNewNoticeContent, handleNoticeSubmit }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={closeModal}
    className="modal-content"
    overlayClassName="modal-overlay"
    contentLabel="Add Notice Modal"
  >
    <FaTimes className="modal-close-icon" onClick={closeModal} />
    <h2><FaStickyNote /> Add Notice</h2>
    <textarea
      value={newNoticeContent}
      onChange={(e) => setNewNoticeContent(e.target.value)}
      placeholder="Enter your notice here..."
      rows="4"
      className="notice-textarea"
    />
    <div className="button-container">
      <button onClick={handleNoticeSubmit} className="confirm-btn">
        <FaSave /> Submit Notice
      </button>
    </div>
  </Modal>
);

export default AddNoticeModal;
