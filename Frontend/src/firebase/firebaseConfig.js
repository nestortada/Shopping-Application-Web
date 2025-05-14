// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

export { db, storage };
