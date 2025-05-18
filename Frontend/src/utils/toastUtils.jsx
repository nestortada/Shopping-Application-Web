// src/utils/toastUtils.jsx
import React from 'react';
import toast from 'react-hot-toast';
import { playNotificationSound } from '../services/notificationService';

// Custom toast with sound and persistence in notifications
const customToast = (message, options = {}) => {
  // Play sound if not disabled
  if (!options.disableSound) {
    playNotificationSound();
  }

  // Create notification ID for tracking
  const notificationId = `notification-${Date.now()}`;
  
  // Set default duration to show toast
  const toastDuration = options.duration || 5000; 
  
  // Return the toast with modified options to display briefly
  const toastId = toast(message, {
    ...options,
    id: notificationId,
    duration: toastDuration, // Show for specified duration
  });

  return toastId;
};

// Success toast
export const successToast = (message, options = {}) => {
  return customToast(message, { 
    ...options,
    icon: '✅',
    className: 'success-toast',
    duration: options.duration || 5000,
    style: {
      background: '#1D1981',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      ...options.style
    }
  });
};

// Error toast
export const errorToast = (message, options = {}) => {
  return customToast(message, { 
    ...options,
    icon: '❌',
    className: 'error-toast',
    duration: options.duration || 5000,
    style: {
      background: '#d73838',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      ...options.style
    }
  });
};

// Info toast
export const infoToast = (message, options = {}) => {
  return customToast(message, { 
    ...options,
    icon: 'ℹ️',
    className: 'info-toast',
    duration: options.duration || 5000,
    style: {
      background: '#363636',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      ...options.style
    }
  });
};

// Warning toast
export const warningToast = (message, options = {}) => {
  return customToast(message, { 
    ...options,
    icon: '⚠️',
    className: 'warning-toast',
    duration: options.duration || 5000,
    style: {
      background: '#ff9800',
      color: 'black',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      ...options.style
    }
  });
};

// New order toast for POS users
export const newOrderToast = (locationName) => {
  return customToast(
    (t) => (
      <div className="flex items-center">
        <span className="mr-2">🛍️</span>
        <span>New order received for {locationName || 'your restaurant'}</span>
        <button
          className="ml-4 px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
          onClick={() => toast.dismiss(t.id)}
        >
          View
        </button>
      </div>
    ),
    {
      duration: 5000, // Show for 5 seconds
      style: {
        background: '#1D1981',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }
  );
};

// Low stock toast for POS users
export const lowStockToast = (productName) => {
  return customToast(
    (t) => (
      <div className="flex items-center">
        <span className="mr-2">⚠️</span>
        <span>Low stock alert: {productName} is running low</span>
        <button
          className="ml-4 px-2 py-1 bg-orange-500 text-white rounded-md text-xs"
          onClick={() => toast.dismiss(t.id)}
        >
          View
        </button>
      </div>
    ),
    {
      duration: 5000, // Show for 5 seconds
      style: {
        background: '#FF9800',
        color: 'black',
        padding: '16px',
        borderRadius: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }
  );
};

// Order status change toast for customers
export const orderStatusToast = (status, orderNumber) => {
  let icon = '📦';
  let color = '#1D1981';
  let statusText = 'updated';
  
  switch (status.toLowerCase()) {
    case 'confirmed':
      icon = '✅';
      statusText = 'confirmed';
      break;
    case 'preparing':
      icon = '👨‍🍳';
      statusText = 'being prepared';
      break;
    case 'ready':
      icon = '🔔';
      statusText = 'ready for pickup';
      color = '#28a745';
      break;
    case 'completed':
      icon = '🎉';
      statusText = 'completed';
      color = '#28a745';
      break;
    case 'cancelled':
      icon = '❌';
      statusText = 'cancelled';
      color = '#dc3545';
      break;
    default:
      break;
  }
  
  return customToast(
    (t) => (
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span>Your order #{orderNumber} is {statusText}</span>
        <button
          className="ml-4 px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
          onClick={() => toast.dismiss(t.id)}
        >
          View
        </button>
      </div>
    ),
    {
      duration: 5000, // Show for 5 seconds
      style: {
        background: color,
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }
  );
};

// Favorite product update toast
export const favoriteProductUpdateToast = (productName) => {
  return customToast(
    (t) => (
      <div className="flex items-center">
        <span className="mr-2">💙</span>
        <span>Your favorite product "{productName}" has been updated!</span>
        <button
          className="ml-4 px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
          onClick={() => toast.dismiss(t.id)}
        >
          View
        </button>
      </div>
    ),
    {
      duration: 5000, // Show for 5 seconds
      style: {
        background: '#673AB7',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }
  );
};

// Default toast
export default customToast;
