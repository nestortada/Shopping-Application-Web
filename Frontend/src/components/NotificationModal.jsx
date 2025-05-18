import React from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationModal({ isOpen, onClose }) {
  const { 
    notifications, 
    loading, 
    error, 
    markAllAsRead,
    unreadCount,
    socketConnected
  } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50 flex justify-center items-start pt-16">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4 max-h-[70vh] flex flex-col animate-fadeIn">
        <div className="flex justify-between items-center border-b p-4 bg-[#F8F9FA] rounded-t-lg">
          <div>
            <h2 className="text-lg font-semibold text-[#3F2EDA]">Notificaciones</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {socketConnected ? (
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                  Live updates active
                </span>
              ) : (
                <span className="flex items-center text-gray-500">
                  <span className="h-2 w-2 bg-gray-300 rounded-full mr-1"></span>
                  Using local updates
                </span>
              )}
              {unreadCount > 0 && (
                <span className="ml-2">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm bg-[#3F2EDA] text-white px-2 py-1 rounded-md hover:bg-[#2C1DBA] transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div><div className="overflow-y-auto p-4 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#3F2EDA] border-opacity-50 border-r-2 border-b-2"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
              Error cargando notificaciones: {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
