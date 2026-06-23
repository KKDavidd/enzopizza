// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firebase app/Auth/Firestore initialization, used everywhere
// else in the admin app via these shared exports.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
