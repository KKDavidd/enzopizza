// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Reviews table — customer reviews shown on the public site.
// ============================================================

import { useCollection } from "../lib/useCollection";
import type { Review } from "../lib/types";
import { TextCell, NumberCell, CheckboxCell } from "../components/EditableCell";

export function ReviewsPage() {
  const { items, loading, error, addItem, updateItem, removeItem } = useCollection<Review>("reviews");

  async function handleAdd() {
    await addItem({
      name: "Új vendég",
      text: "",
      recommends: true,
      visible: true,
      order: (items.length ? Math.max(...items.map((r) => r.order ?? 0)) : 0) + 1
    } as Omit<Review, "id">);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Biztosan törlöd ezt a véleményt: "${name}"?`)) {
      await removeItem(id);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Vélemények</h1>
          <p className="page-sub">Vendégvélemények a weboldal "Vélemények" szekciójához. A "Látható" kapcsolóval rejthetők el anélkül, hogy törölnéd őket.</p>
        </div>
      </div>

      <div className="toolbar">
        <span className="page-sub">{items.length} vélemény</span>
        <button className="btn btn-primary" onClick={handleAdd}>+ Új vélemény</button>
      </div>

      {error && <p className="login-error">Hiba: {error}</p>}

      {loading ? (
        <p className="empty-state">Betöltés…</p>
      ) : items.length === 0 ? (
        <p className="empty-state">Még nincs egyetlen vélemény sem. Kattints a "+ Új vélemény" gombra.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="cell-order">Sorrend</th>
                <th className="cell-name">Név</th>
                <th className="cell-desc">Vélemény szövege</th>
                <th className="cell-checkbox">Ajánlja</th>
                <th className="cell-checkbox">Látható</th>
                <th className="cell-actions"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className={r.visible ? "" : "row-inactive"}>
                  <td>
                    <NumberCell className="cell-order" value={r.order} onSave={(v) => updateItem(r.id, { order: v } as Partial<Review>)} />
                  </td>
                  <td>
                    <TextCell className="cell-name" value={r.name} onSave={(v) => updateItem(r.id, { name: v } as Partial<Review>)} />
                  </td>
                  <td>
                    <TextCell className="cell-desc" value={r.text} onSave={(v) => updateItem(r.id, { text: v } as Partial<Review>)} />
                  </td>
                  <td className="cell-checkbox">
                    <CheckboxCell checked={r.recommends} onSave={(v) => updateItem(r.id, { recommends: v } as Partial<Review>)} />
                  </td>
                  <td className="cell-checkbox">
                    <CheckboxCell checked={r.visible} onSave={(v) => updateItem(r.id, { visible: v } as Partial<Review>)} />
                  </td>
                  <td className="cell-actions">
                    <button className="icon-btn" title="Törlés" onClick={() => handleDelete(r.id, r.name)}>✕</button>
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
