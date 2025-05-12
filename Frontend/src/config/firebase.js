// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQ3Uqmufw8OGeJfK9wA0MJKUmhxbn1Ebg",
  authDomain: "my-database-b.firebaseapp.com",
  projectId: "my-database-b",
  databaseURL: "https://my-database-b-default-rtdb.firebaseio.com",
  storageBucket: "my-database-b.firebasestorage.app",
  messagingSenderId: "422414348931",
  appId: "1:422414348931:web:a1b3dd797068c2cf0fe1b6",
  measurementId: "G-Z9W5GFT24D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Initialize Storage with custom settings for CORS
const storageConfig = {
  customDomain: process.env.NODE_ENV === 'development' ? window.location.origin : undefined,
  maxOperationRetryTime: 10000,
  maxUploadRetryTime: 10000
};

const storage = getStorage(app);

// Configurar CORS para Firebase Storage
storage.customDomain = storageConfig.customDomain;
storage.maxOperationRetryTime = storageConfig.maxOperationRetryTime;
storage.maxUploadRetryTime = storageConfig.maxUploadRetryTime;

export { db, storage };
