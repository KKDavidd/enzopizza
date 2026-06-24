import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLTLuVFG36zXOzF1YkrPm2hr4k8hRFwHI",
  authDomain: "enzohajm.firebaseapp.com",
  projectId: "enzohajm",
  storageBucket: "enzohajm.firebasestorage.app",
  messagingSenderId: "788231794322",
  appId: "1:788231794322:web:f2203afd0320954371004b"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
