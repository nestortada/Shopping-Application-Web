import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationModal from './NotificationModal';
import bellIcon from '../assets/bell.svg';

export default function NotificationBell() {
  const { unreadCount, socketConnected } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleModal}
        className="flex items-center justify-center p-2 focus:outline-none"
        aria-label="Open notifications"
      >
        <img src={bellIcon} alt="Notifications" className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Socket.IO connection indicator */}
        {socketConnected && (
          <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-2 h-2"></span>
        )}
      </button>
      
      <NotificationModal isOpen={showModal} onClose={toggleModal} />
    </div>
  );
}
