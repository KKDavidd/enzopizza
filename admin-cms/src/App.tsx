// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Root app: auth gate + sidebar navigation + page switching.
// No router library — a tiny admin with 4 pages doesn't need one,
// and it's one less dependency that could break the build.
// ============================================================

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuth } from "./lib/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { SettingsPage } from "./pages/SettingsPage";

type PageKey = "products" | "categories" | "reviews" | "settings";

const NAV_ITEMS: { key: PageKey; label: string; icon: string }[] = [
  { key: "products", label: "Termékek", icon: "🍕" },
  { key: "categories", label: "Kategóriák", icon: "📂" },
  { key: "reviews", label: "Vélemények", icon: "⭐" },
  { key: "settings", label: "Beállítások", icon: "⚙️" }
];

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageKey>("products");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">EP</div>
          <div className="sidebar-brand-name">
            Enzopizza
            <small>ADMIN · HAJMÁSKÉR</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={page === item.key ? "active" : ""}
              onClick={() => setPage(item.key)}
            >
              <span aria-hidden="true">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user?.email && <p className="sidebar-user">{user.email}</p>}
          <button className="btn-logout" onClick={() => signOut(auth)}>Kijelentkezés</button>
        </div>
      </aside>

      <main className="main">
        {page === "products" && <ProductsPage />}
        {page === "categories" && <CategoriesPage />}
        {page === "reviews" && <ReviewsPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">Betöltés…</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Shell />;
}
