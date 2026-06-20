// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Barrel export for all Firestore collections used by FireCMS.
// ============================================================

import { categoriesCollection } from "./categories";
import { productsCollection } from "./products";
import { reviewsCollection } from "./reviews";
import { settingsCollection } from "./settings";

export const collections = [
  categoriesCollection,
  productsCollection,
  reviewsCollection,
  settingsCollection
];
