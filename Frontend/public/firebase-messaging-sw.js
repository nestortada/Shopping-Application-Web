// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmsYf38R_kFJRHqdmPCWq4KvYPcm_St8c",
  authDomain: "bdweb-c0c9f.firebaseapp.com",
  databaseURL: "https://bdweb-c0c9f-default-rtdb.firebaseio.com",
  projectId: "bdweb-c0c9f",
  storageBucket: "bdweb-c0c9f.firebasestorage.app",
  messagingSenderId: "788700727044",
  appId: "1:788700727044:web:0a1b1807f9b3a4e2c5b251",
  measurementId: "G-1D7RKWG7JK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: payload.data?.id || 'default', // Use as notification ID
    data: payload.data || {}
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked ', event);
  
  event.notification.close();
  
  // Get notification data
  const notificationType = event.notification.data?.type || 'default';
  const notificationId = event.notification.data?.id || null;
  
  // This will open the app and bring it to the foreground
  let urlToOpen;
  
  // Route based on notification type
  switch (notificationType) {
    case 'order':
      urlToOpen = '/pos/orders';
      break;
    case 'order_status':
      urlToOpen = '/client/order/status';
      break;
    case 'stock':
      urlToOpen = '/pos/inventory';
      break;
    default:
      urlToOpen = '/';
  }
  
  // Append ID if available
  if (notificationId) {
    urlToOpen += `?id=${notificationId}`;
  }
  
  // Open the specific URL
  const baseUrl = self.location.origin;
  const fullUrl = `${baseUrl}${urlToOpen}`;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no matching window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});
