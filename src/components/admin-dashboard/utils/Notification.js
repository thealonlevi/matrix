// src/components/utils/Notification.js
import React, { useEffect, useState, createContext, useContext } from 'react';
import './Notification.css';

// Context for managing notifications
const NotificationContext = createContext();

// Hook to use notifications anywhere in the app
export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a new notification
  const showNotification = (message, type = 'success') => {
    const id = Date.now(); // Unique ID based on timestamp
    const newNotification = { id, message, type, timestamp: Date.now() };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    // Store in sessionStorage to persist across pages
    sessionStorage.setItem('notifications', JSON.stringify([...notifications, newNotification]));
  };

  // Function to remove a notification by ID
  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );

    // Update sessionStorage
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Check for stored notifications on mount
  useEffect(() => {
    const storedNotifications = JSON.parse(sessionStorage.getItem('notifications'));
    if (storedNotifications) {
      setNotifications(storedNotifications);
    }
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
