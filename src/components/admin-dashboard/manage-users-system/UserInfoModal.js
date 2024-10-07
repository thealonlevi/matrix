import React, { useState } from 'react';
import { insertUserNote } from '../../../utils/api';
import { FaUser, FaClock, FaStickyNote } from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md';
import './UserInfoModal.css';

const UserInfoModal = ({ isModalVisible, closeModal, selectedUser }) => {
  const [newNoteContent, setNewNoteContent] = useState(''); // State to hold new note content
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission status
  const [isComposeVisible, setIsComposeVisible] = useState(false); // State to handle compose form visibility

  if (!isModalVisible || !selectedUser) return null;

  // Handle note submission
  const handleNoteSubmit = async () => {
    if (!newNoteContent.trim()) {
      alert('Please enter a valid note.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Pass the selected user's email and the new note content to insertUserNote
      await insertUserNote(selectedUser.email, newNoteContent);
      alert('Note added successfully!');
      setNewNoteContent(''); // Clear the note content after submission
      setIsComposeVisible(false); // Hide the compose form
    } catch (error) {
      console.error('Failed to insert user note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="userInfoModal-overlay" onClick={closeModal}>
      <div className="userInfoModal-content" onClick={(e) => e.stopPropagation()}>
        <span className="userInfoModal-close" onClick={closeModal}>&times;</span>
        <h2 className="userInfoModal-title">User Information</h2>
        <p className="userInfoModal-info"><strong>Email:</strong> {selectedUser.email}</p>
        <p className="userInfoModal-info"><strong>Credits:</strong> {selectedUser.credits}</p>
        <p className="userInfoModal-info">
          <strong>Last Login:</strong> {selectedUser.LastActiveTimestamp ? new Date(selectedUser.LastActiveTimestamp).toLocaleString() : 'N/A'}
        </p>
        <p className="userInfoModal-info"><strong>Role:</strong> {selectedUser.role}</p>

        {/* Display Staff Notes */}
        <h3 className="userInfoModal-notesTitle">Staff Notes:</h3>
        <div className="userInfoModal-notesContainer">
          {selectedUser.staff_notes && selectedUser.staff_notes.length > 0 ? (
            <ul className="userInfoModal-notesList">
              {selectedUser.staff_notes.map((note, index) => (
                <li key={index} className="userInfoModal-noteItem">
                  <p className="userInfoModal-noteDetail"><FaUser /> <strong>Staff:</strong> {note.staff_email}</p>
                  <p className="userInfoModal-noteDetail"><FaClock /> <strong>Timestamp:</strong> {new Date(note.timestamp).toLocaleString()}</p>
                  <div className="userInfoModal-noteContent">
                    <FaStickyNote /> {note.note_content}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="userInfoModal-noNotes">No notes available.</p>
          )}
          {/* Clickable Pencil with Paper Icon for Adding Note */}
          <MdEditNote size={30} className="userInfoModal-addNoteIcon" onClick={() => setIsComposeVisible(true)} />
        </div>

        {/* Compose Note Form */}
        {isComposeVisible && (
          <div className="userInfoModal-composeNoteContainer">
            <h3 className="userInfoModal-composeNoteTitle">Add a Staff Note</h3>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter your note here..."
              rows="4"
              className="userInfoModal-noteTextarea"
              disabled={isSubmitting}
            />
            <div className="userInfoModal-buttonContainer">
              <button onClick={handleNoteSubmit} className="userInfoModal-addNoteButton" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoModal;
