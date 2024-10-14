// src/components/admin-dashboard/ticket-system/TicketActionButtons.js
import React from 'react';
import { FaExchangeAlt, FaDollarSign, FaCheckCircle, FaBan } from 'react-icons/fa';

const TicketActionButtons = ({
  isMarkingPaid,
  handleMarkAsPaid,
  openReplacementModal,
  openCreditModal,
  handleResolveOrDeny,
  isResolving,
  status,
}) => (
  <div className="button-container">
    <button
      onClick={handleMarkAsPaid}
      className="icon-btn mark-paid-btn"
      disabled={isMarkingPaid}
    >
      {isMarkingPaid ? 'Processing...' : 'Mark as Paid'}
    </button>
    <button onClick={openReplacementModal} className="icon-btn issue-replacement-btn">
      <FaExchangeAlt size={20} />
    </button>
    <button onClick={openCreditModal} className="icon-btn credit-btn">
      <FaDollarSign size={20} />
    </button>
    {status === 'pending' && (
      <>
        <button
          className="icon-btn resolve-btn"
          onClick={() => handleResolveOrDeny('resolved')}
          disabled={isResolving}
        >
          <FaCheckCircle size={20} />
        </button>
        <button
          className="icon-btn deny-replacement-btn"
          onClick={() => handleResolveOrDeny('denied')}
          disabled={isResolving}
        >
          <FaBan size={20} />
        </button>
      </>
    )}
  </div>
);

export default TicketActionButtons;
