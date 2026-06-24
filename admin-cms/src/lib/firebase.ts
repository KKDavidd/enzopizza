// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firebase app/Auth/Firestore initialization, used everywhere
// else in the admin app via these shared exports.
// ============================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

export const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
