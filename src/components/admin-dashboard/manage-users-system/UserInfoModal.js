import React, { useState } from 'react';
import { FaTimes, FaSave, FaUser, FaClock, FaStickyNote, FaDesktop, FaGlobe, FaList, FaHistory, FaServer } from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md';
import Modal from 'react-modal';
import './UserInfoModal.css';
import { insertUserNote } from '../../../utils/api';
import { getProductTitleById } from '../utils/adminUtils'; // Function to get product titles by ID

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
    <div className="userInfoModal-overlay" onClick={closeModal}>
      <div className="userInfoModal-content" onClick={(e) => e.stopPropagation()}>
        <span className="userInfoModal-close" onClick={closeModal}>&times;</span>
        <h2 className="userInfoModal-title">User Information</h2>

        {/* Basic User Information */}
        <p className="userInfoModal-info"><strong>Email:</strong> {selectedUser.email}</p>
        <p className="userInfoModal-info"><strong>Credits:</strong> {selectedUser.credits}</p>
        <p className="userInfoModal-info">
          <strong>Last Login:</strong> {selectedUser.LastActiveTimestamp ? new Date(selectedUser.LastActiveTimestamp).toLocaleString() : 'N/A'}
        </p>
        <p className="userInfoModal-info"><strong>Role:</strong> {selectedUser.role}</p>

        {/* Device Information */}
        <h3 className="userInfoModal-sectionTitle">Device Information:</h3>
        <p className="userInfoModal-info"><FaDesktop /> <strong>Device Type:</strong> {selectedUser.DeviceInformation.deviceType}</p>
        <p className="userInfoModal-info"><FaServer /> <strong>Platform:</strong> {selectedUser.DeviceInformation.platform}</p>
        <p className="userInfoModal-info"><FaGlobe /> <strong>User Agent:</strong> {selectedUser.DeviceInformation.userAgent}</p>

        {/* Geolocation Data */}
        <h3 className="userInfoModal-sectionTitle">Geolocation Data:</h3>
        <p className="userInfoModal-info"><FaGlobe /> <strong>IP Address:</strong> {selectedUser.GeolocationData.ip}</p>

        {/* Metrics (Faulty Quantity to Ordered Quantity Ratios) */}
        <h3 className="userInfoModal-sectionTitle">Metrics (FQOQ Ratios):</h3>
        {Object.keys(fqoqMetrics).length > 0 ? (
          <ul className="userInfoModal-info">
            {Object.entries(fqoqMetrics).map(([key, value]) => (
              <li key={key}><FaList /> <strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        ) : (
          <p>No FQOQ metrics available.</p>
        )}

        {/* Order History - Scrollable Box */}
        <h3 className="userInfoModal-sectionTitle">Order History:</h3>
        {selectedUser.OrderHistory && selectedUser.OrderHistory.length > 0 ? (
          <div className="order-history-container">
            <ul className="userInfoModal-info order-history-list">
              {selectedUser.OrderHistory.map((order, index) => (
                <li key={index}><FaHistory /> {order}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No orders found.</p>
        )}

        {/* Staff Notes Section */}
        <h3 className="userInfoModal-sectionTitle">Staff Notes:</h3>
        <div className="notes-container">
          {selectedUser.staff_notes && selectedUser.staff_notes.length > 0 ? (
            selectedUser.staff_notes.map((note, index) => (
              <div key={index} className="note-item">
                <p><FaUser /> <strong>Staff:</strong> {note.staff_email}</p>
                <p><FaClock /> <strong>Timestamp:</strong> {note.timestamp}</p>
                <div className="note-content"><FaStickyNote /> {note.note_content}</div>
              </div>
            ))
          ) : (
            <p>No notes added yet.</p>
          )}
          {/* Clickable Pencil with Paper Icon for Adding Note */}
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
          <FaTimes className="modal-close-icon" onClick={() => setAddNoteModalOpen(false)} />
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
      </div>
    </div>
  );
};

export default UserInfoModal;
