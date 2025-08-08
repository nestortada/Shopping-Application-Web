// src/services/notificationService.js
import { 
  requestNotificationPermission, 
  onMessageListener 
} from '../firebase/firebaseConfig';
import { db } from '../firebase/firebaseConfig';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { playBeep } from '../utils/audioUtils';

// Store FCM token in Firestore
export const saveFcmToken = async (token, userEmail) => {
  if (!token || !userEmail) return false;
  
  try {
    // Check if user exists in the tokens collection
    const userTokenRef = doc(db, 'fcmTokens', userEmail);
    const userTokenDoc = await getDoc(userTokenRef);
    
    if (userTokenDoc.exists()) {
      // Update existing record
      await updateDoc(userTokenRef, {
        token,
        updatedAt: new Date()
      });
    } else {
      // Create new record
      await setDoc(userTokenRef, {
        email: userEmail,
        token,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Initialize notifications (request permission and save token)
export const initializeNotifications = async () => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return false;
    
    const token = await requestNotificationPermission();
    if (!token) return false;
    
    console.log('FCM Token:', token);
    
    // Save token in Firestore
    return await saveFcmToken(token, userEmail);
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// Setup foreground message handler
export const setupForegroundNotificationListener = (callback) => {
  onMessageListener()
    .then((payload) => {
      console.log('Received foreground message:', payload);
      
      // Display notification using the browser's Notification API
      const title = payload.notification?.title || 'New Notification';
      const options = {
        body: payload.notification?.body || '',
        icon: '/vite.svg',
        badge: '/vite.svg'
      };
      
      // Create and show notification
      const notification = new Notification(title, options);
      
      // Handle notification click
      notification.onclick = () => {
        console.log('Notification clicked');
        window.focus();
        notification.close();
      };
      
      // Run callback if provided
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
    })
    .catch((error) => {
      console.error('Error setting up foreground notification listener:', error);
    });
};
// Notificar nuevo pedido: guarda una notificación en Firestore
export const notifyNewOrder = async (orderData) => {
  try {
    if (!orderData || !orderData.userEmail) throw new Error('orderData o userEmail faltante');
    const notificationRef = doc(collection(db, 'notifications'));
    const notification = {
      type: 'order',
      title: 'Nuevo pedido',
      body: `Tienes un nuevo pedido de ${orderData.userEmail}`,
      userEmail: orderData.userEmail,
      orderId: orderData.orderId || null,
      createdAt: new Date(),
      ...orderData
    };
    await setDoc(notificationRef, notification);
    return true;
  } catch (error) {
    console.error('Error notificando nuevo pedido:', error);
    return false;
  }
};

// Play notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification-sound.mp3');
    
    // Set volume to 50%
    audio.volume = 0.5;
    
    // Add error event listener to handle missing file
    audio.addEventListener('error', (e) => {
      console.warn('Notification sound file could not be loaded, using fallback beep');
      // Use our custom beep function as fallback
      playBeep();
    });
    
    audio.play()
      .catch(error => {
        console.error('Error playing notification sound:', error);
        // Try fallback beep if audio.play() fails
        playBeep();
      });
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Try fallback beep if any other error occurs
    playBeep();
  }
};

// Handle notification click (e.g., redirect to a specific page)
export const handleNotificationClick = (notification) => {
  if (!notification) return;
  
  // Based on notification type, redirect to appropriate page
  switch (notification.type) {
    case 'order':
      // For POS users
      window.location.href = '/pos/orders';
      break;
    case 'order_status':
      // For clients
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'CLIENT') {
        window.location.href = '/client/orders/status';
      } else {
        window.location.href = '/pos/orders';
      }
      break;
    case 'stock':
      // For POS users
      window.location.href = '/pos/inventory';
      break;
    case 'favorite_product':
      // For clients
      window.location.href = '/client/favorites';
      break;
    default:
      // Just focus the window
      window.focus();
  }
};

// Register a service worker for push notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  return null;
};
