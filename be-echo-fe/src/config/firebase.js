import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "api-key",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "project-id",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "project.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "app-id",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
