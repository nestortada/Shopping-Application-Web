// src/services/socketService.js
import { io } from 'socket.io-client';
import { playNotificationSound } from './notificationService';

let socket = null;
let notificationsNamespace = null;

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Connect to Socket.IO server
export const connectToSocketIO = (userEmail, locationId = null) => {
  if (!userEmail) {
    console.error('User email is required to connect to Socket.IO');
    return null;
  }
  
  try {
    // If we already have a connection, disconnect it
    if (socket && socket.connected) {
      console.log('Reusing existing Socket.IO connection');
      return socket;
    }
    
    console.log('Connecting to Socket.IO server at:', `${API_URL}/notifications`);
    
    // Create the socket connection to the notifications namespace
    notificationsNamespace = io(`${API_URL}/notifications`, {
      auth: {
        userEmail,
        locationId,
        token: localStorage.getItem('token') || localStorage.getItem('authToken') // Support both token formats
      },
      // Enable reconnection
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000 // Aumentar timeout para conexiones lentas
    });
    
    // Handle connection events
    notificationsNamespace.on('connect', () => {
      console.log('Socket.IO Connected to notifications namespace!');
    });
    
    notificationsNamespace.on('connect_error', (error) => {
      console.error('Socket.IO Connection error:', error);
    });
    
    notificationsNamespace.on('disconnect', (reason) => {
      console.log('Socket.IO Disconnected:', reason);
      // Attempt to reconnect if server disconnected us
      if (reason === 'io server disconnect') {
        notificationsNamespace.connect();
      }
    });
    
    socket = notificationsNamespace;
    return notificationsNamespace;
  } catch (error) {
    console.error('Error connecting to Socket.IO:', error);
    return null;
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (callback) => {
  if (!socket) {
    console.error('Socket not initialized. Call connectToSocketIO first.');
    return () => {};
  }
  
  // Listen for new notifications
  socket.on('newNotification', (notification) => {
    console.log('New notification received:', notification);
    
    // Play sound
    playNotificationSound();
    
    // Call the callback with the notification
    if (callback && typeof callback === 'function') {
      callback(notification);
    }
  });
  
  // Return unsubscribe function
  return () => {
    socket.off('newNotification');
  };
};

// Disconnect from Socket.IO server
export const disconnectFromSocketIO = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    notificationsNamespace = null;
    console.log('Disconnected from Socket.IO');
  }
};

// Check connection status
export const isConnected = () => {
  return socket?.connected || false;
};

// Reconnect to Socket.IO server
export const reconnect = () => {
  if (socket) {
    socket.connect();
  }
};

export default {
  connectToSocketIO,
  subscribeToNotifications,
  disconnectFromSocketIO,
  isConnected,
  reconnect
};
