// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firestore collection: products
//
// Each pizza/dish/drink/dessert on the menu. Belongs to one
// category (via categoryId, a reference). Allergens are stored
// as an array of numbers (1-15), matching the legend printed on
// the original paper menu and rendered in settings/allergens.
// ============================================================

import { buildCollection, buildProperty } from "@firecms/core";

export type Product = {
  name: string;
  description?: string;
  price: number;
  priceSuffix?: string;
  categoryId: string;
  allergens?: number[];
  tags?: string[];
  order: number;
  active: boolean;
  imageUrl?: string;
};

const ALLERGEN_OPTIONS = {
  1: { label: "1 — Glutén" },
  2: { label: "2 — Rákfélék" },
  3: { label: "3 — Tojás" },
  4: { label: "4 — Hal" },
  5: { label: "5 — Földimogyoró" },
  6: { label: "6 — Szójabab" },
  7: { label: "7 — Tej" },
  8: { label: "8 — Diófélék" },
  9: { label: "9 — Zeller" },
  10: { label: "10 — Mustár" },
  11: { label: "11 — Szezámmag" },
  12: { label: "12 — Kéndioxid" },
  13: { label: "13 — Csillagfürt" },
  14: { label: "14 — Puhatestűek" },
  15: { label: "15 — Méz" }
};

export const productsCollection = buildCollection<Product>({
  id: "products",
  path: "products",
  name: "Termékek",
  singularName: "Termék",
  description: "A menü összes étele és itala — pizzák, frissensültek, köretek, szószok, desszertek, italok.",
  icon: "LocalPizza",
  group: "Menü",
  textSearchEnabled: true,
  defaultSize: "m",
  properties: {
    name: buildProperty({
      name: "Név",
      validation: { required: true },
      dataType: "string"
    }),
    categoryId: buildProperty({
      name: "Kategória",
      dataType: "reference",
      path: "categories",
      validation: { required: true }
    }),
    description: buildProperty({
      name: "Leírás",
      dataType: "string",
      multiline: true,
      description: "Pl. összetevők: 'Paradicsomszósz, sonka, gomba, kukorica, sajt'"
    }),
    price: buildProperty({
      name: "Ár (Ft)",
      dataType: "number",
      validation: { required: true, min: 0 }
    }),
    priceSuffix: buildProperty({
      name: "Ár utótag",
      dataType: "string",
      description: "Opcionális, pl. '/adag', '/1l' — az ár mögé íródik ki"
    }),
    allergens: buildProperty({
      name: "Allergének",
      dataType: "array",
      of: {
        dataType: "number",
        enumValues: ALLERGEN_OPTIONS
      },
      description: "A számozás megegyezik a nyomtatott menün lévő allergén-listával."
    }),
    tags: buildProperty({
      name: "Címkék",
      dataType: "array",
      of: { dataType: "string" },
      description: "Opcionális, pl. 'Új', 'Csípős', 'Vega'"
    }),
    imageUrl: buildProperty({
      name: "Kép URL",
      dataType: "string",
      url: true,
      description: "Illessz be egy kép linket (pl. Imgur, ImageKit, Cloudinary, vagy bármilyen publikus kép URL). A Firebase Storage fizetős, ezért itt nincs közvetlen feltöltés."
    }),
    order: buildProperty({
      name: "Sorrend",
      dataType: "number",
      description: "Kisebb szám = előrébb jelenik meg a kategórián belül.",
      validation: { required: true }
    }),
    active: buildProperty({
      name: "Aktív",
      dataType: "boolean",
      description: "Ha ki van kapcsolva, a termék nem jelenik meg a weboldalon.",
      defaultValue: true
    })
  }
});
