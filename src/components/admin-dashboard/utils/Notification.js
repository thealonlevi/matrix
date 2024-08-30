// src/components/utils/Notification.js
import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    console.log(`Rendering Notification: ${message} - Type: ${type}`);

    // Set a timer to clear the notification after it is shown
    const timer = setTimeout(() => {
      console.log('Clearing notification timer.');
      onClose();
    }, 30000); // Notification disappears after 30 seconds

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [onClose]);

  console.log(`Notification class applied: matrix-custom-toast-notification matrix-custom-toast-notification-${type}`);

  return (
    <div className={`matrix-custom-toast-notification matrix-custom-toast-notification-${type}`}>
      {message}
    </div>
  );
};

// Utility function to show notifications
export const showNotification = (message, type = 'success') => {
  const notificationData = { message, type, timestamp: Date.now() };
  sessionStorage.setItem('notification', JSON.stringify(notificationData));
  console.log('Notification stored in sessionStorage:', notificationData);
};

export default Notification;
