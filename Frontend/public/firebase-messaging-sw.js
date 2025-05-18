// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

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

let messaging;

try {
  // Inicializa Firebase
  firebase.initializeApp(firebaseConfig);
  // Inicializa Firebase Cloud Messaging
  messaging = firebase.messaging();
} catch (err) {
  console.error('Error al inicializar Firebase en el Service Worker', err);
}

// Manejo de mensajes en background
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje en background recibido:', payload);

    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: payload.data?.id || 'default',
      data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Manejo de clic en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notificación clicada:', event);
  event.notification.close();

  const { type: notificationType = 'default', id: notificationId = '' } = event.notification.data || {};

  let urlToOpen = '/';
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
  }

  if (notificationId) {
    urlToOpen += `?id=${notificationId}`;
  }

  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
