// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Tiny auth hook wrapping Firebase Auth's onAuthStateChanged.
// ============================================================

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => setUser(u),
      (err) => setError(err.message)
    );
    return unsubscribe;
  }, []);

  return { user, loading: user === undefined, error };
}
