// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Shared types — these field names must stay in sync with
// public-site/js/menu.js, public-site/js/info.js, and seed/seed.js.
// ============================================================

export type Category = {
  id: string;
  name: string;
  note?: string;
  order: number;
};

export type Product = {
  id: string;
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

export type Review = {
  id: string;
  name: string;
  text: string;
  recommends: boolean;
  order: number;
  visible: boolean;
};

export type DayHours = {
  open?: string;
  close?: string;
  closed?: boolean;
};

export type SettingsGeneral = {
  address?: string;
  addressMapsUrl?: string;
  phone?: string;
  phoneDisplay?: string;
  email?: string;
  messengerUrl?: string;
  heroPhotoUrl?: string;
};

export type SettingsHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export const ALLERGEN_LEGEND: Record<number, string> = {
  1: "Glutén", 2: "Rákfélék", 3: "Tojás", 4: "Hal", 5: "Földimogyoró",
  6: "Szójabab", 7: "Tej", 8: "Diófélék", 9: "Zeller", 10: "Mustár",
  11: "Szezámmag", 12: "Kéndioxid", 13: "Csillagfürt", 14: "Puhatestűek", 15: "Méz"
};

export const DAY_KEYS: (keyof SettingsHours)[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
];

export const DAY_LABELS: Record<string, string> = {
  monday: "Hétfő", tuesday: "Kedd", wednesday: "Szerda", thursday: "Csütörtök",
  friday: "Péntek", saturday: "Szombat", sunday: "Vasárnap"
};
