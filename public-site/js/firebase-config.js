import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLTLuVFG36zXOzF1YkrPm2hr4k8hRFwHI",
  authDomain: "enzohajm.firebaseapp.com",
  projectId: "enzohajm",
  storageBucket: "enzohajm.firebasestorage.app",
  messagingSenderId: "788231794322",
  appId: "1:788231794322:web:f2203afd0320954371004b"
};

export const firebaseApp = initializeApp(firebaseConfig);

// Firefoxon (főleg mobilnetes/proxy-s kapcsolatnál) a Firestore alap
// WebChannel-streamje néha örökre "lóg" hiba nélkül. Az autoDetect
// bekapcsolása miatt long-pollingra vált, ha a streaming nem működik.
export const db = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
});
