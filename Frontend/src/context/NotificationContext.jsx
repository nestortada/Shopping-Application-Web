import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { 
  initializeNotifications, 
  setupForegroundNotificationListener, 
  playNotificationSound,
  registerServiceWorker
} from '../services/notificationService';
import {
  successToast,
  errorToast,
  infoToast,
  warningToast,
  newOrderToast,
  lowStockToast,
  orderStatusToast,
  favoriteProductUpdateToast
} from '../utils/toastUtils.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user's email
  const userEmail = localStorage.getItem('userEmail');

  // Initialize FCM (Firebase Cloud Messaging)
  useEffect(() => {
    if (!userEmail) return;

    // Register service worker for push notifications
    registerServiceWorker().then(() => {
      // Initialize notifications (request permission, save token)
      initializeNotifications()
        .then((success) => {
          if (success) {
            console.log('FCM initialized successfully');
            
            // Setup foreground notification listener
            setupForegroundNotificationListener((payload) => {
              // Play notification sound
              playNotificationSound();
              
              // Show toast notification based on the notification type
              const { notification } = payload;
              
              if (notification) {
                const { title, body } = notification;
                
                // Determine which type of toast to show
                if (body.includes('order') || title.includes('Order')) {
                  if (body.includes('ready')) {
                    successToast(body);
                  } else if (body.includes('new')) {
                    newOrderToast(body.includes('from') ? body.split('from ')[1] : '');
                  } else {
                    infoToast(body);
                  }
                } else if (body.includes('stock') || title.includes('Stock')) {
                  warningToast(body);
                } else if (body.includes('favorite') || title.includes('Favorite')) {
                  favoriteProductUpdateToast(
                    body.includes('product') ? body.split('product ')[1].split(' has')[0] : ''
                  );
                } else {
                  infoToast(body);
                }
              }
            });
          }
        })
        .catch((error) => {
          console.error('Error initializing FCM:', error);
        });
    });
  }, [userEmail]);

  // Subscribe to notifications for the current user
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userEmail', '==', userEmail),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        
        setNotifications(notificationList);
        setUnreadCount(notificationList.filter(n => !n.read).length);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

  // Add a new notification
  const addNotification = async (notificationData) => {
    try {
      const newNotification = {
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false,
      };
      
      await addDoc(collection(db, 'notifications'), newNotification);
      return true;
    } catch (err) {
      console.error('Error adding notification:', err);
      setError(err.message);
      return false;
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter(notification => !notification.read)
        .map(notification => {
          const notificationRef = doc(db, 'notifications', notification.id);
          return updateDoc(notificationRef, { read: true });
        });
      
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message);
      return false;
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.message);
      return false;
    }
  };

  // Add notifications for POS users when new order is created
  const notifyNewOrder = async (orderData) => {
    try {
      // Notify all POS users associated with this location
      const { locationId, locationName } = orderData;
      
      // This would typically be a query to get all POS users for this location
      // For example purposes, we're using a simplistic approach
      // In a real app, you would query for all POS users with this locationId
      const posEmail = `${locationId}@sabanapos.edu.co`;
      
      await addNotification({
        userEmail: posEmail,
        message: `New order received for ${locationName || 'your restaurant'}.`,
        type: 'order',
        orderId: orderData.orderId,
        locationId: locationId
      });
      
      // Show toast notification for POS users
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'pos') {
        newOrderToast(locationName);
      }
      
      return true;
    } catch (err) {
      console.error('Error notifying about new order:', err);
      setError(err.message);
      return false;
    }
  };

  // Notify about stock running low
  const notifyLowStock = async (product, locationId) => {
    try {
      const posEmail = `${locationId}@sabanapos.edu.co`;
      
      await addNotification({
        userEmail: posEmail,
        message: `⚠️ Product ${product.nombre || product.name} is running low on stock.`,
        type: 'stock',
        productId: product.id,
        locationId: locationId
      });
      
      // Show toast notification for POS users
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'pos') {
        lowStockToast(product.nombre || product.name);
      }
      
      return true;
    } catch (err) {
      console.error('Error notifying about low stock:', err);
      setError(err.message);
      return false;
    }
  };

  // Notify about order status change
  const notifyOrderStatusChange = async (order, newStatus) => {
    try {
      // Notify the customer
      if (order.userEmail) {
        let message = '';
        
        if (newStatus === 'In preparation') {
          message = `Your order at ${order.locationName || 'the restaurant'} is now being prepared.`;
        } else if (newStatus === 'Ready for pickup') {
          message = `Your order at ${order.locationName || 'the restaurant'} is ready for pickup!`;
        }
        
        if (message) {
          await addNotification({
            userEmail: order.userEmail,
            message,
            type: 'order_status',
            orderId: order.id,
            locationId: order.locationId
          });
          
          // Show toast notification for customers
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail === order.userEmail) {
            orderStatusToast(newStatus, order.orderNumber || order.id);
          }
        }
      }
      
      // Also notify POS user about the status change
      const posEmail = `${order.locationId}@sabanapos.edu.co`;
      
      await addNotification({
        userEmail: posEmail,
        message: `Order #${order.orderNumber || order.id} has been updated to "${newStatus}".`,
        type: 'order_status',
        orderId: order.id,
        locationId: order.locationId
      });
      
      // Show toast notification for POS users
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      if (userRole === 'pos' && userEmail === posEmail) {
        infoToast(`Order #${order.orderNumber || order.id} has been updated to "${newStatus}".`);
      }
      
      return true;
    } catch (err) {
      console.error('Error notifying about order status change:', err);
      setError(err.message);
      return false;
    }
  };

  // Notify about favorite product updates
  const notifyFavoriteProductUpdate = async (product, updateType, locationId) => {
    try {
      // In a real app, you would query for all POS users who have favorited this product
      // For simplicity, we're using a direct approach
      const posEmail = `${locationId}@sabanapos.edu.co`;
      
      let message = '';
      if (updateType === 'stock') {
        message = `Your favorite product ${product.nombre || product.name} has been restocked.`;
      } else if (updateType === 'details') {
        message = `Your favorite product ${product.nombre || product.name} has been updated.`;
      }
      
      if (message) {
        await addNotification({
          userEmail: posEmail,
          message,
          type: 'favorite_product',
          productId: product.id,
          locationId: locationId
        });
        
        // Show toast notification for users with this product as favorite
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail === posEmail) {
          favoriteProductUpdateToast(product.nombre || product.name);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error notifying about favorite product update:', err);
      setError(err.message);
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        notifyNewOrder,
        notifyLowStock,
        notifyOrderStatusChange,
        notifyFavoriteProductUpdate
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
