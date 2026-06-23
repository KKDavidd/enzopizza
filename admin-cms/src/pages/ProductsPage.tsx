// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Products table — the core editing surface: name, description,
// price, category, allergens (numbers, matching the printed
// menu), order, active toggle.
// ============================================================

import { useCollection } from "../lib/useCollection";
import { ALLERGEN_LEGEND, type Category, type Product } from "../lib/types";
import { TextCell, NumberCell, CheckboxCell, SelectCell, AllergenChipsCell } from "../components/EditableCell";

export function ProductsPage() {
  const { items: categories } = useCollection<Category>("categories");
  const { items: products, loading, error, addItem, updateItem, removeItem } =
    useCollection<Product>("products");

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  async function handleAdd() {
    const fallbackCategoryId = categories[0]?.id ?? "";
    await addItem({
      name: "Új termék",
      description: "",
      price: 0,
      categoryId: fallbackCategoryId,
      allergens: [],
      order: (products.length ? Math.max(...products.map((p) => p.order ?? 0)) : 0) + 1,
      active: true
    } as Omit<Product, "id">);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Biztosan törlöd ezt a terméket: "${name}"?`)) {
      await removeItem(id);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Termékek</h1>
          <p className="page-sub">A menü összes étele és itala. A táblázatba kattintva azonnal szerkeszthetsz — a mentés elhagyáskor (blur) történik.</p>
        </div>
      </div>

      <div className="toolbar">
        <span className="page-sub">{products.length} termék</span>
        <button className="btn btn-primary" onClick={handleAdd} disabled={categories.length === 0}>
          + Új termék
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <p className="empty-state">Előbb hozz létre legalább egy kategóriát a "Kategóriák" oldalon.</p>
      )}

      {error && <p className="login-error">Hiba: {error}</p>}

      {loading ? (
        <p className="empty-state">Betöltés…</p>
      ) : products.length === 0 ? (
        <p className="empty-state">Még nincs egyetlen termék sem. Kattints a "+ Új termék" gombra.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="cell-order">Sorrend</th>
                <th className="cell-name">Név</th>
                <th>Kategória</th>
                <th className="cell-desc">Leírás</th>
                <th className="cell-price">Ár (Ft)</th>
                <th className="cell-price">Ár utótag</th>
                <th className="cell-allergens">Allergének</th>
                <th className="cell-checkbox">Aktív</th>
                <th className="cell-actions"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "row-inactive"} title={!p.active ? "Inaktív — nem jelenik meg a weboldalon" : undefined}>
                  <td>
                    <NumberCell className="cell-order" value={p.order} onSave={(v) => updateItem(p.id, { order: v } as Partial<Product>)} />
                  </td>
                  <td>
                    <TextCell className="cell-name" value={p.name} onSave={(v) => updateItem(p.id, { name: v } as Partial<Product>)} />
                  </td>
                  <td>
                    <SelectCell
                      value={p.categoryId}
                      options={categoryOptions.length ? categoryOptions : [{ value: p.categoryId, label: categoryName(p.categoryId) }]}
                      onSave={(v) => updateItem(p.id, { categoryId: v } as Partial<Product>)}
                    />
                  </td>
                  <td>
                    <TextCell className="cell-desc" value={p.description ?? ""} placeholder="Összetevők…" onSave={(v) => updateItem(p.id, { description: v } as Partial<Product>)} />
                  </td>
                  <td>
                    <NumberCell className="cell-price" value={p.price} min={0} onSave={(v) => updateItem(p.id, { price: v } as Partial<Product>)} />
                  </td>
                  <td>
                    <TextCell className="cell-price" value={p.priceSuffix ?? ""} placeholder="/adag" onSave={(v) => updateItem(p.id, { priceSuffix: v } as Partial<Product>)} />
                  </td>
                  <td>
                    <AllergenChipsCell
                      selected={p.allergens ?? []}
                      legend={ALLERGEN_LEGEND}
                      onSave={(v) => updateItem(p.id, { allergens: v } as Partial<Product>)}
                    />
                  </td>
                  <td className="cell-checkbox">
                    <CheckboxCell checked={p.active} onSave={(v) => updateItem(p.id, { active: v } as Partial<Product>)} />
                  </td>
                  <td className="cell-actions">
                    <button className="icon-btn" title="Törlés" onClick={() => handleDelete(p.id, p.name)}>✕</button>
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
