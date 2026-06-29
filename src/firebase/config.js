import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1baCli92Rm3bubbUvtD-w2ui4HDuLfVI",
  authDomain: "family-menu-1c5f3.firebaseapp.com",
  projectId: "family-menu-1c5f3",
  storageBucket: "family-menu-1c5f3.firebasestorage.app",
  messagingSenderId: "876724163529",
  appId: "1:876724163529:web:b9184887ba93c674c08e18"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);