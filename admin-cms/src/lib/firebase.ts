import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// This import MUST appear — it registers the Firestore component with Firebase.
// Do not remove or move: tree-shaking must not eliminate this side-effect.
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

// Explicitly reference db so bundlers cannot eliminate the getFirestore call
if (!db) throw new Error("Firestore failed to initialize");

export { app, auth, db };
