import React, { useState } from 'react';
import { insertUserNote } from '../../../utils/api';
import { FaUser, FaClock, FaStickyNote } from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md';
import './StaffNotesModal.css';

const StaffNotesModal = ({ isVisible, closeModal, selectedUser }) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVisible || !selectedUser) return null;

  // Handle note submission
  const handleNoteSubmit = async () => {
    if (!newNoteContent.trim()) {
      alert('Please enter a valid note.');
      return;
    }

    try {
      setIsSubmitting(true);
      await insertUserNote(selectedUser.email, newNoteContent);
      alert('Note added successfully!');
      setNewNoteContent('');
    } catch (error) {
      console.error('Failed to insert user note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staffNotesModal-overlay" onClick={closeModal}>
      <div className="staffNotesModal-content" onClick={(e) => e.stopPropagation()}>
        <span className="staffNotesModal-close" onClick={closeModal}>&times;</span>
        <h2>Staff Notes</h2>

        {/* Display existing staff notes */}
        <div className="staffNotesModal-notesContainer">
          {selectedUser.staff_notes && selectedUser.staff_notes.length > 0 ? (
            <ul>
              {selectedUser.staff_notes.map((note, index) => (
                <li key={index} className="staffNotesModal-noteItem">
                  <p><FaUser /> <strong>Staff:</strong> {note.staff_email}</p>
                  <p><FaClock /> <strong>Timestamp:</strong> {new Date(note.timestamp).toLocaleString()}</p>
                  <div><FaStickyNote /> {note.note_content}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes available.</p>
          )}
        </div>

        {/* Add new note form */}
        <div className="staffNotesModal-composeNoteContainer">
          <h3>Add a New Note</h3>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Enter your note here..."
            rows="4"
            disabled={isSubmitting}
          />
          <button onClick={handleNoteSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffNotesModal;
