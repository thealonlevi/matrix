// src/components/utils/Notification.js
import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Retrieve the notification from sessionStorage
    const storedNotification = JSON.parse(sessionStorage.getItem('notification'));
    if (storedNotification) {
      setNotification(storedNotification);

      // Set a timer to clear the notification after it is shown
      const timer = setTimeout(() => {
        setNotification(null);
        sessionStorage.removeItem('notification'); // Clear sessionStorage after the notification is hidden
      }, 3000); // Notification disappears after 3 seconds

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, []);

  if (!notification) return null; // Don't render if no notification

  return (
    <div className={`matrix-toast-notification matrix-toast-notification-${notification.type}`}>
      {notification.message}
    </div>
  );
};

// Utility function to show notifications
export const showNotification = (message, type = 'success') => {
    const notificationData = { message, type, timestamp: Date.now() }; // Include timestamp
    sessionStorage.setItem('notification', JSON.stringify(notificationData)); // Store notification in sessionStorage
  };
  
export default Notification;
