import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationItem({ notification }) {
  const { markAsRead, deleteNotification } = useNotifications();
  const [startX, setStartX] = useState(null);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef(null);

  const handleMarkAsRead = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notificationDate = new Date(timestamp);
    
    const diffInMs = now - notificationDate;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  // Touch and mouse event handlers for swipe to delete functionality
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || startX === null) return;
    
    const currentPosition = e.touches[0].clientX;
    const difference = currentPosition - startX;
    
    // Only allow swiping right (from left to right)
    if (difference > 0) {
      setCurrentX(difference);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || startX === null) return;
    
    const currentPosition = e.clientX;
    const difference = currentPosition - startX;
    
    // Only allow swiping right (from left to right)
    if (difference > 0) {
      setCurrentX(difference);
    }
  };

  const handleTouchEnd = () => {
    if (currentX > 100) { // Threshold to delete
      handleDelete();
    } else {
      setCurrentX(0);
    }
    setIsDragging(false);
    setStartX(null);
  };

  const handleMouseUp = () => {
    if (currentX > 100) { // Threshold to delete
      handleDelete();
    } else {
      setCurrentX(0);
    }
    setIsDragging(false);
    setStartX(null);
  };

  // Classes for the notification item
  const itemClasses = `relative flex items-start p-3 rounded-lg 
    ${notification.read ? 'bg-white' : 'bg-blue-50'} 
    border ${notification.read ? 'border-gray-200' : 'border-blue-200'} 
    cursor-pointer transition-all`;

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'order':
        return '🛍️';
      case 'order_status':
        return '📦';
      case 'stock':
        return '⚠️';
      case 'favorite_product':
        return '⭐';
      default:
        return '📢';
    }
  };

  return (
    <li 
      ref={itemRef}
      className={itemClasses}
      style={{ 
        transform: `translateX(${currentX}px)`,
        opacity: 1 - (currentX / 200) // Fade out as it's swiped
      }}
      onClick={handleMarkAsRead}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mr-3 text-xl">{getNotificationIcon()}</div>
      <div className="flex-1">
        <div className="text-sm">
          {notification.message}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatTimestamp(notification.timestamp)}
        </div>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full self-start mt-1"></div>
      )}
      
      {/* Delete indicator that appears when swiping */}
      {currentX > 20 && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex items-center pr-4 text-red-500"
          style={{ opacity: currentX / 100 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )}
    </li>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    read: PropTypes.bool.isRequired,
    type: PropTypes.string
  }).isRequired
};
