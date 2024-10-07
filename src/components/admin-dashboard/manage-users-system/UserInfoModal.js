import React, { useState } from 'react';
import { FaUser, FaClock, FaStickyNote, FaDesktop, FaGlobe, FaList, FaHistory, FaIdCard, FaServer } from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md';
import StaffNotesModal from './StaffNotesModal';
import './UserInfoModal.css';

const UserInfoModal = ({ isModalVisible, closeModal, selectedUser }) => {
  const [isStaffNotesVisible, setIsStaffNotesVisible] = useState(false);

  if (!isModalVisible || !selectedUser) return null;

  // Safe access to metrics.fqoq, handle undefined cases
  const fqoq = selectedUser.metrics && selectedUser.metrics.fqoq ? selectedUser.metrics.fqoq : {};

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
        <p className="userInfoModal-info"><FaGlobe /> <strong>City:</strong> {selectedUser.GeolocationData.city}</p>
        <p className="userInfoModal-info"><FaGlobe /> <strong>Country:</strong> {selectedUser.GeolocationData.country}</p>

        {/* IP Address History */}
        <h3 className="userInfoModal-sectionTitle">IP Address History:</h3>
        {selectedUser.IPAddresses && selectedUser.IPAddresses.length > 0 ? (
          <ul className="userInfoModal-info">
            {selectedUser.IPAddresses.map((ip, index) => (
              <li key={index}>{ip.S}</li>
            ))}
          </ul>
        ) : (
          <p>No IP Addresses recorded.</p>
        )}

        {/* Metrics (Faulty Quantity to Ordered Quantity Ratios) */}
        <h3 className="userInfoModal-sectionTitle">Metrics (FQOQ Ratios):</h3>
        <p className="userInfoModal-info"><FaList /> <strong>Product 20/27:</strong> {fqoq['20/27'] || 'N/A'}</p>
        <p className="userInfoModal-info"><FaList /> <strong>Product 21/73:</strong> {fqoq['21/73'] || 'N/A'}</p>

        {/* Order History */}
        <h3 className="userInfoModal-sectionTitle">Order History:</h3>
        {selectedUser.OrderHistory && selectedUser.OrderHistory.length > 0 ? (
          <ul className="userInfoModal-info">
            {selectedUser.OrderHistory.map((order, index) => (
              <li key={index}><FaHistory /> {order.S}</li>
            ))}
          </ul>
        ) : (
          <p>No orders found.</p>
        )}

        {/* User Notes */}
        <h3 className="userInfoModal-sectionTitle">User Notes:</h3>
        {selectedUser.user_notes && selectedUser.user_notes.length > 0 ? (
          <ul className="userInfoModal-info">
            {selectedUser.user_notes.map((note, index) => (
              <li key={index}>
                <p><FaUser /> <strong>Staff:</strong> {note.M && note.M.staff_email ? note.M.staff_email.S : 'N/A'}</p>
                <p><FaClock /> <strong>Timestamp:</strong> {note.M && note.M.timestamp ? note.M.timestamp.S : 'N/A'}</p>
                <div><FaStickyNote /> {note.M && note.M.note_content ? note.M.note_content.S : 'No Content'}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No user notes available.</p>
        )}

        {/* Staff Notes */}
        <h3 className="userInfoModal-notesTitle">Staff Notes:</h3>
        <div className="userInfoModal-notesContainer">
          {selectedUser.staff_notes && selectedUser.staff_notes.length > 0 ? (
            <ul>
              {selectedUser.staff_notes.map((note, index) => (
                <li key={index}>
                  <p><FaUser /> <strong>Staff:</strong> {note.M && note.M.staff_email ? note.M.staff_email.S : 'N/A'}</p>
                  <p><FaClock /> <strong>Timestamp:</strong> {note.M && note.M.timestamp ? new Date(note.M.timestamp.S).toLocaleString() : 'N/A'}</p>
                  <div><FaStickyNote /> {note.M && note.M.note_content ? note.M.note_content.S : 'No Content'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No staff notes available.</p>
          )}
          <MdEditNote
            size={30}
            className="userInfoModal-addNoteIcon"
            onClick={() => setIsStaffNotesVisible(true)}
          />
        </div>

        {/* Secondary modal for staff notes */}
        {isStaffNotesVisible && (
          <StaffNotesModal
            isVisible={isStaffNotesVisible}
            closeModal={() => setIsStaffNotesVisible(false)}
            selectedUser={selectedUser}
          />
        )}
      </div>
    </div>
  );
};

export default UserInfoModal;
