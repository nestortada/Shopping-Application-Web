// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
let messaging;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.error('Firebase messaging is not supported in this environment:', error);
}

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      try {
        // Get the token with error handling for getProjectConfig
        return await getToken(messaging, {
          vapidKey: 'BMNPqMai7MIuyxjRuZ1CkzQHTpziqDUL4c6bnNgoN6s1iXXjKQce-ytOp3OPlDEM4tLP4fDaVUMO_LaT0V3nBFg'
        });
      } catch (tokenError) {
        // Handle specific Firebase API errors
        if (tokenError.code === 'messaging/failed-service-worker-registration' ||
            tokenError.message?.includes('getProjectConfig')) {
          console.warn('Firebase messaging configuration issue:', tokenError.message);
          // Continue app functionality without push notifications
          return null;
        }
        throw tokenError; // Re-throw other errors
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  if (!messaging) return Promise.resolve();
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export { db, storage, auth, messaging };
