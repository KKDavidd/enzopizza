// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Categories table — menu sections (Pizzák, Frissensültek, stb.)
// and their display order.
// ============================================================

import { useCollection } from "../lib/useCollection";
import type { Category } from "../lib/types";
import { TextCell, NumberCell } from "../components/EditableCell";

export function CategoriesPage() {
  const { items, loading, error, addItem, updateItem, removeItem } = useCollection<Category>("categories");

  async function handleAdd() {
    await addItem({
      name: "Új kategória",
      note: "",
      order: (items.length ? Math.max(...items.map((c) => c.order ?? 0)) : 0) + 1
    } as Omit<Category, "id">);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Biztosan törlöd ezt a kategóriát: "${name}"?\n\nA hozzá tartozó termékek megmaradnak, de elveszítik a kategóriájukat — ezeket utána érdemes átsorolni a Termékek oldalon.`)) {
      await removeItem(id);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Kategóriák</h1>
          <p className="page-sub">A menü fő szekciói (Pizzák, Frissensültek, Italok, stb.) és a megjelenési sorrendjük.</p>
        </div>
      </div>

      <div className="toolbar">
        <span className="page-sub">{items.length} kategória</span>
        <button className="btn btn-primary" onClick={handleAdd}>+ Új kategória</button>
      </div>

      {error && <p className="login-error">Hiba: {error}</p>}

      {loading ? (
        <p className="empty-state">Betöltés…</p>
      ) : items.length === 0 ? (
        <p className="empty-state">Még nincs egyetlen kategória sem. Kattints a "+ Új kategória" gombra.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="cell-order">Sorrend</th>
                <th className="cell-name">Név</th>
                <th>Megjegyzés</th>
                <th className="cell-actions"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <NumberCell className="cell-order" value={c.order} onSave={(v) => updateItem(c.id, { order: v } as Partial<Category>)} />
                  </td>
                  <td>
                    <TextCell className="cell-name" value={c.name} onSave={(v) => updateItem(c.id, { name: v } as Partial<Category>)} />
                  </td>
                  <td>
                    <TextCell value={c.note ?? ""} placeholder="pl. 32 cm" onSave={(v) => updateItem(c.id, { note: v } as Partial<Category>)} />
                  </td>
                  <td className="cell-actions">
                    <button className="icon-btn" title="Törlés" onClick={() => handleDelete(c.id, c.name)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
