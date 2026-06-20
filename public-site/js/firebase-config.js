// ============================================================
// ENZOPIZZA HAJMÁSKÉR — firebase-config.js
// Firebase app initialization for the PUBLIC site.
// This client only ever READS from Firestore — it never writes.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfvBi5R-4kq1iqXBsn6T0C0ZhUjTVxvcU",
  authDomain: "enzopizzahajm.firebaseapp.com",
  projectId: "enzopizzahajm",
  storageBucket: "enzopizzahajm.firebasestorage.app",
  messagingSenderId: "331213372184",
  appId: "1:331213372184:web:a663dbb69ce440a9a87c6d"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
