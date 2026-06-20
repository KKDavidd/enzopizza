// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firestore collection: categories
//
// Menu categories — e.g. "Pizzák – 32 cm", "Frissensültek",
// "Köretek", "Szószok", "Desszertek", "Italok". Controls the
// tabs and section order on the public site.
// ============================================================

import { buildCollection, buildProperty } from "@firecms/core";

export type Category = {
  name: string;
  note?: string;
  order: number;
};

export const categoriesCollection = buildCollection<Category>({
  id: "categories",
  path: "categories",
  name: "Kategóriák",
  singularName: "Kategória",
  description: "A menü fő szekciói (pl. Pizzák, Frissensültek, Köretek, Italok). Ezek adják a fülek sorrendjét a weboldalon.",
  icon: "Category",
  group: "Menü",
  defaultSize: "s",
  properties: {
    name: buildProperty({
      name: "Név",
      dataType: "string",
      validation: { required: true },
      description: "Pl. 'Pizzák – 32 cm', 'Frissensültek', 'Italok'"
    }),
    note: buildProperty({
      name: "Megjegyzés",
      dataType: "string",
      description: "Opcionális alcím, pl. '32 cm'"
    }),
    order: buildProperty({
      name: "Sorrend",
      dataType: "number",
      validation: { required: true },
      description: "Kisebb szám = előrébb jelenik meg a menüben és a füleknél."
    })
  }
});
