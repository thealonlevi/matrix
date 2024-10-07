import React from 'react';
import './FulfillmentHistoryModal.css';

const FulfillmentHistoryModal = ({ isOpen, onClose, fulfillmentHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>&times;</span>
        <h3>Fulfillment History</h3>
        <ul>
          {fulfillmentHistory && fulfillmentHistory.length > 0 ? (
            fulfillmentHistory.map((history, index) => (
              <li key={index}>

                <strong>Stock:</strong> {history.stock} | 
                <strong>Timestamp:</strong> {new Date(history.timestamp).toLocaleString()}
              </li>
            ))
          ) : (
            <li>No fulfillment history available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FulfillmentHistoryModal;
