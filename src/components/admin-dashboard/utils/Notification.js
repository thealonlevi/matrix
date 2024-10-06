import React, { useEffect, useState, createContext, useContext } from 'react';
import './Notification.css';

// Context for managing notifications
const NotificationContext = createContext();

// Hook to use notifications anywhere in the app
export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const MAX_NOTIFICATIONS = 3; // Limit to 3 notifications at a time

  // Function to add a new notification
  const showNotification = (message, type = 'success') => {
    const id = Date.now(); // Unique ID based on timestamp
    const newNotification = { id, message, type, timestamp: Date.now() };

    setNotifications((prevNotifications) => {
      let updatedNotifications = [...prevNotifications, newNotification];

      // Ensure we only keep the maximum number of notifications
      if (updatedNotifications.length > MAX_NOTIFICATIONS) {
        updatedNotifications = updatedNotifications.slice(-MAX_NOTIFICATIONS);
      }

      // Store in sessionStorage
      sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  // Function to remove a notification by ID
  const removeNotification = (id) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = prevNotifications.filter((notification) => notification.id !== id);
      
      // Update sessionStorage
      sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  // Function to get pending notifications from sessionStorage
  const getPendingNotifications = () => {
    return JSON.parse(sessionStorage.getItem('notifications')) || [];
  };

  // Function to clean up expired notifications
  const cleanUpExpiredNotifications = () => {
    setNotifications((prevNotifications) => {
      const now = Date.now();
      const updatedNotifications = prevNotifications.filter((notification) => now - notification.timestamp < 5000); // 30 seconds expiration

      // Update sessionStorage
      sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  // Check for stored notifications on mount and periodically clean up expired notifications
  useEffect(() => {
    const storedNotifications = getPendingNotifications();
    setNotifications(storedNotifications);

    const intervalId = setInterval(() => {
      cleanUpExpiredNotifications(); // Clean up expired notifications every 5 seconds
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="matrix-toast-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 30000); // Notification disappears after 30 seconds

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [onClose]);

  return (
    <div className={`matrix-custom-toast-notification matrix-custom-toast-notification-${type}`}>
      {message}
    </div>
  );
};

export { NotificationProvider };
