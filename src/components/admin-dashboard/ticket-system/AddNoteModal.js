// src/components/admin-dashboard/ticket-system/AddNoteModal.js
import React from 'react';
import { FaTimes, FaStickyNote, FaSave } from 'react-icons/fa';
import Modal from 'react-modal';

const AddNoteModal = ({ isOpen, closeModal, newNoteContent, setNewNoteContent, handleNoteSubmit }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={closeModal}
    className="modal-content"
    overlayClassName="modal-overlay"
    contentLabel="Add Note Modal"
  >
    <FaTimes className="modal-close-icon" onClick={closeModal} />
    <h2><FaStickyNote /> Add Staff Note</h2>
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
);

export default AddNoteModal;
