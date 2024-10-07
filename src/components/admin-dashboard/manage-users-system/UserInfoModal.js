import React, { useState } from 'react';
import { FaServer, FaUser, FaClock, FaDollarSign, FaEnvelope, FaDesktop, FaGlobe, FaList, FaHistory, FaStickyNote, FaTimes, FaInfoCircle, FaSave } from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md';
import Modal from 'react-modal';
import './UserInfoModal.css';
import { insertUserNote } from '../../../utils/api';
import { getProductTitleById } from '../utils/adminUtils'; // Function to get product titles by ID

// Ensure Modal is attached to the correct root element
Modal.setAppElement('#root'); // Change this if your root ID is different

const UserInfoModal = ({ isModalVisible, closeModal, selectedUser }) => {
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Function to handle note submission
  const handleNoteSubmit = async () => {
    try {
      const userEmail = selectedUser.email;
      await insertUserNote(userEmail, newNoteContent);
      setNewNoteContent('');
      setAddNoteModalOpen(false);
      alert('Note added successfully!');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  if (!isModalVisible || !selectedUser) return null;

  // Extract FQOQ metrics dynamically from selectedUser object and convert keys to product titles
  const fqoqMetrics = Object.keys(selectedUser)
    .filter(key => key.startsWith('metrics.fqoq.'))
    .reduce((result, key) => {
      const productId = key.replace('metrics.fqoq.', ''); // Get the product ID
      const productTitle = getProductTitleById(productId) || productId; // Convert ID to title
      result[productTitle] = selectedUser[key]; // Use product title as the key
      return result;
    }, {});

  return (
    <Modal
      isOpen={isModalVisible}
      onRequestClose={closeModal}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="User Information Modal"
    >
      <div>
        <div className="modal-header">
          <h2><FaUser /> User Information</h2>
          <FaTimes className="modal-close-icon" onClick={closeModal} />
        </div>

        {/* User Information */}
        <div className="modal-section">
          <p><FaEnvelope /> <strong>Email:</strong> {selectedUser.email}</p>
          <p><FaDollarSign /> <strong>Credits:</strong> {selectedUser.credits}</p>
          <p><FaClock /> <strong>Last Login:</strong> {selectedUser.LastActiveTimestamp ? new Date(selectedUser.LastActiveTimestamp).toLocaleString() : 'N/A'}</p>
          <p><FaUser /> <strong>Role:</strong> {selectedUser.role}</p>
        </div>

        {/* Device Information */}
        <h3 className="userInfoModal-sectionTitle"><FaDesktop /> Device Information</h3>
        <div className="modal-section">
          <p><FaDesktop /> <strong>Device Type:</strong> {selectedUser.DeviceInformation.deviceType}</p>
          <p><FaServer /> <strong>Platform:</strong> {selectedUser.DeviceInformation.platform}</p>
          <p><FaGlobe /> <strong>User Agent:</strong> {selectedUser.DeviceInformation.userAgent}</p>
        </div>

        {/* Geolocation Data */}
        <h3 className="userInfoModal-sectionTitle"><FaGlobe /> Geolocation Data</h3>
        <div className="modal-section">
          <p><FaGlobe /> <strong>IP Address:</strong> {selectedUser.GeolocationData.ip}</p>
        </div>

        {/* Metrics */}
        <h3 className="userInfoModal-sectionTitle"><FaList /> Metrics (FQOQ Ratios)</h3>
        <div className="modal-section scrollable-container">
          {Object.keys(fqoqMetrics).length > 0 ? (
            <ul className="userInfoModal-info">
              {Object.entries(fqoqMetrics).map(([key, value]) => (
                <li key={key}><FaList /> <strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          ) : (
            <p>No FQOQ metrics available.</p>
          )}
        </div>

        {/* Order History - Scrollable Box */}
        <h3 className="userInfoModal-sectionTitle"><FaHistory /> Order History</h3>
        <div className="modal-section scrollable-container">
          {selectedUser.OrderHistory && selectedUser.OrderHistory.length > 0 ? (
            <ul className="userInfoModal-info order-history-list">
              {selectedUser.OrderHistory.map((order, index) => (
                <li key={index}><FaHistory /> {order}</li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>

        {/* Staff Notes */}
        <h3 className="userInfoModal-sectionTitle"><FaStickyNote /> Staff Notes</h3>
        <div className="modal-section notes-container">
          {selectedUser.staff_notes && selectedUser.staff_notes.length > 0 ? (
            selectedUser.staff_notes.map((note, index) => (
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
          <MdEditNote size={24} className="add-note-icon" onClick={() => setAddNoteModalOpen(true)} />
        </div>

        {/* Add Note Modal */}
        <Modal
          isOpen={addNoteModalOpen}
          onRequestClose={() => setAddNoteModalOpen(false)}
          className="modal-content"
          overlayClassName="modal-overlay"
          contentLabel="Add Note Modal"
        >
          <div className="modal-header">
            <h2><FaStickyNote /> Add Staff Note</h2>
            <FaTimes className="modal-close-icon" onClick={() => setAddNoteModalOpen(false)} />
          </div>
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
      </div>
    </Modal>
  );
};

export default UserInfoModal;
