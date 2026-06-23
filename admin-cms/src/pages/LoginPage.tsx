// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Email/password login screen. Add admin users in the Firebase
// Console → Authentication → Users tab (Email/Password provider).
// ============================================================

import React, { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Hibás email cím vagy jelszó.",
  "auth/invalid-email": "Érvénytelen email cím.",
  "auth/user-disabled": "Ez a fiók le van tiltva.",
  "auth/too-many-requests": "Túl sok próbálkozás. Várj egy kicsit, majd próbáld újra."
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      setError((code && ERROR_MESSAGES[code]) || "Bejelentkezési hiba történt. Próbáld újra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Enzopizza — Admin</h1>
        <p className="page-sub">Jelentkezz be a menü szerkesztéséhez.</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
            {submitting ? "Bejelentkezés…" : "Bejelentkezés"}
          </button>
        </form>
      </div>
    </div>
  );
}
