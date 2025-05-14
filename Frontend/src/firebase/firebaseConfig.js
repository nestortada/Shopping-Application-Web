import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZS-B9yeYNTUR8wxyiQZFRa0kL74n1WWI",
  authDomain: "base-datos-apliacion-web.firebaseapp.com",
  projectId: "base-datos-apliacion-web",
  storageBucket: "base-datos-apliacion-web.firebasestorage.app",
  messagingSenderId: "626487116415",
  appId: "1:626487116415:web:96e739e65074235e4ab54a",
  measurementId: "G-WMFXC63J0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
export { db, storage, auth };