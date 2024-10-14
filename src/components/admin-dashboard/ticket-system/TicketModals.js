// src/components/admin-dashboard/ticket-system/TicketModals.js

import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaClock,
  FaBox,
  FaCartPlus,
  FaTimes,
  FaEdit,
  FaExchangeAlt,
  FaDollarSign,
  FaCheckCircle,
  FaBan,
  FaSave,
  FaEnvelope,
  FaShoppingCart,
  FaClipboardList,
  FaCalendarAlt,
  FaInfoCircle,
  FaHistory,
  FaStickyNote,
  FaPencilAlt,
} from 'react-icons/fa';
import { MdEditNote } from 'react-icons/md'; // Import pencil with paper icon
import Modal from 'react-modal';
import { insertTicketNote, insertTicketNotice, fetchUserInfo } from '../../../utils/api';
import { TicketOrderDetailsModal } from './TicketOrderDetailsModal'; // Import the new Order Details Modal
import UserInfoModal from '../manage-users-system/UserInfoModal';
import { modifyOrderStatusSQS, fetchOrderDetails } from '../../../utils/api';
import AddNoteModal from './AddNoteModal';
import AddNoticeModal from './AddNoticeModal';
import TicketActionButtons from './TicketActionButtons';
import useTicketData from './useTicketData';
import './TicketModals.css';

// Ticket Details Modal
export const TicketDetailsModal = ({
  modalIsOpen,
  closeModal,
  selectedTicket,
  productTitle,
  handleResolveOrDeny,
  openCreditModal,
  openReplacementModal,
  isResolving,
  productStockCount,
}) => {
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false); // New state for Order Details Modal
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addNoticeModalOpen, setAddNoticeModalOpen] = useState(false);
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [userCache, setUserCache] = useState({}); // Cache for storing user information
  const [isUserModalVisible, setIsUserModalVisible] = useState(false); // Modal visibility state
  const [isMarkingPaid, setIsMarkingPaid] = useState(false); // New state to track loading
  const { orderInfo, userInfo } = useTicketData(selectedTicket);


  // Close the modal
  const closeUserModal = () => {
    setIsUserModalVisible(false); // Hide the modal
  };

  // Function to handle note submission
  const handleNoteSubmit = async () => {
    try {
      const ticketId = selectedTicket.ticket_id;
      await insertTicketNote(ticketId, newNoteContent);
      setNewNoteContent('');
      setAddNoteModalOpen(false);
      alert('Note added successfully!');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      if (orderInfo.payment_status?.S==="paid"){
        console.log("FLAG");
      }
      setIsMarkingPaid(true); // Set loading state to true
      const orderId = selectedTicket.orderID;
      const ticketId = selectedTicket.ticket_id || 'ADMIN'; // Use ticket_id or default to "ADMIN"
      
      // Call the modifyOrderStatusSQS function with order_id, 'paid', and ticket_id
      await modifyOrderStatusSQS(orderId, 'paid', ticketId);
      
      alert('Order marked as paid successfully!');
      closeModal(); // Optionally close the modal after marking the order as paid
    } catch (error) {
      console.error('Failed to mark order as paid:', error);
      alert('Failed to mark order as paid. Please try again.');
    } finally {
      setIsMarkingPaid(false); // Reset loading state
    }
  };
  

  // Function to handle notice submission
  const handleNoticeSubmit = async () => {
    try {
      const ticketId = selectedTicket.ticket_id;
      await insertTicketNotice(ticketId, newNoticeContent);
      setNewNoticeContent('');
      setAddNoticeModalOpen(false);
      alert('Notice added successfully!');
    } catch (error) {
      console.error('Failed to add notice:', error);
    }
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Ticket Details Modal"
    >
      {selectedTicket ? (
        <div>
          <FaTimes className="modal-close-icon" onClick={closeModal} />
          <h2>Ticket Details</h2>
          <p>
            <FaClipboardList /> <strong>Order ID:</strong>{' '}
            <a
              href="#"
              onClick={() => setOrderDetailsModalOpen(true)}
              className="order-id-link"
            >
              {selectedTicket.orderID}
            </a>
          </p>
          <p>
            <FaEnvelope /> <strong>Email: </strong>
            <a
              href="#"
              onClick={() => setIsUserModalVisible(true)}
              className="order-id-link"
            >
              {selectedTicket.userEmail}
            </a>
          </p>
          <p>
            <FaShoppingCart /> <strong>Product Name:</strong> {productTitle}
          </p>
          <p>
            <FaShoppingCart /> <strong>Product Stock:</strong> {productStockCount}
          </p>
          <p>
            <FaInfoCircle /> <strong>Issue:</strong> {selectedTicket.issue}
          </p>
          <p>
            <FaCheckCircle /> <strong>Status:</strong> {selectedTicket.status}
          </p>

          <p>
            <FaCalendarAlt /> <strong>Creation Date:</strong> {selectedTicket.creationDate}
          </p>
          <p>
            <FaCartPlus /> <strong>Replacements Asked:</strong> {selectedTicket.replacementsCountAsked || 0}
          </p>
          <p>
            <FaEdit /> <strong>Message:</strong>
          </p>
          <div className="message-box">{selectedTicket.message || 'N/A'}</div>
          <p>
            <FaHistory /> <strong>History:</strong>
          </p>
          <div className="history-container">
            {selectedTicket.history?.map((historyItem, index) => (
              <div key={index} className="history-item">
                <p>
                  <FaEdit /> <strong>Action:</strong> {historyItem.action}
                </p>
                <p>
                  <FaUser /> <strong>Operator:</strong> {historyItem.operator}
                </p>
                <p>
                  <FaClock /> <strong>Timestamp:</strong> {historyItem.timestamp}
                </p>
                {historyItem.new_status && (
                  <p>
                    <FaExchangeAlt /> <strong>New Status:</strong> {historyItem.new_status}
                  </p>
                )}
                {historyItem.exported_stock && (
                  <p>
                    <FaBox /> <strong>Exported Stock:</strong> {historyItem.exported_stock}
                  </p>
                )}
                {historyItem.quantity && (
                  <p>
                    <FaCartPlus /> <strong>Quantity:</strong> {historyItem.quantity}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Staff Notes Section */}
          <p>
            <FaStickyNote /> <strong>Staff Notes:</strong>
          </p>
          <div className="notes-container">
            {selectedTicket.staff_notes && selectedTicket.staff_notes.length > 0 ? (
              selectedTicket.staff_notes.map((note, index) => (
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
            {/* Clickable Pencil with Paper Icon for Adding Note */}
            <MdEditNote size={24} className="add-note-icon" onClick={() => setAddNoteModalOpen(true)} />
          </div>

          {/* Notices Section */}
          <p>
            <FaStickyNote /> <strong>Notices:</strong>
          </p>
          <div className="notices-container">
            {selectedTicket.notice && selectedTicket.notice.length > 0 ? (
              selectedTicket.notice.map((notice, index) => (
                <div key={index} className="notice-item">
                  <p><FaUser /> <strong>Sender:</strong> {notice.sender_email}</p>
                  <p><FaClock /> <strong>Timestamp:</strong> {notice.timestamp}</p>
                  <div className="notice-content">
                    <FaStickyNote /> {notice.notice_content}
                  </div>
                </div>
              ))
            ) : (
              <p>No notices added yet.</p>
            )}
            {/* Clickable Pencil with Paper Icon for Adding Notice */}
            <MdEditNote size={24} className="add-note-icon" onClick={() => setAddNoticeModalOpen(true)} />
          </div>

          <div className="button-container">
          <TicketActionButtons
            isMarkingPaid={isMarkingPaid}
            handleMarkAsPaid={handleMarkAsPaid}
            openReplacementModal={openReplacementModal}
            openCreditModal={openCreditModal}
            handleResolveOrDeny={handleResolveOrDeny}
            isResolving={isResolving}
            status={selectedTicket.status}
          />
            <UserInfoModal
                isModalVisible={isUserModalVisible}
                closeModal={closeUserModal}
                selectedUser={userInfo}
            />
          </div>

          <AddNoteModal
            isOpen={addNoteModalOpen}
            closeModal={() => setAddNoteModalOpen(false)}
            newNoteContent={newNoteContent}
            setNewNoteContent={setNewNoteContent}
            handleNoteSubmit={handleNoteSubmit}
          />

          <AddNoticeModal
            isOpen={addNoticeModalOpen}
            closeModal={() => setAddNoticeModalOpen(false)}
            newNoticeContent={newNoticeContent}
            setNewNoticeContent={setNewNoticeContent}
            handleNoticeSubmit={handleNoticeSubmit}
          />

          {/* New Order Details Modal */}
          <TicketOrderDetailsModal
            orderDetailsModalIsOpen={orderDetailsModalOpen}
            closeOrderDetailsModal={() => setOrderDetailsModalOpen(false)}
            orderId={selectedTicket.orderID} // Pass Order ID here
          />
        </div>
      ) : (
        <p>Loading ticket details...</p>
      )}
    </Modal>
  );
};