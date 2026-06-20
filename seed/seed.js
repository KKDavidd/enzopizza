// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Firestore seed script
//
// One-time helper that populates categories, products, settings
// and reviews with the data from the original paper menu, so
// you don't have to type ~25 products by hand in FireCMS.
//
// Usage:
//   1. npm install firebase-admin
//   2. Download a service account key (Firebase Console →
//      Project settings → Service accounts → Generate new
//      private key) and save it as ./serviceAccountKey.json
//      in this folder (already gitignored).
//   3. node seed.js
//
// Safe to re-run: it overwrites documents by deterministic ID
// (e.g. "sajtos", "sonkas") rather than creating duplicates.
// ============================================================

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ---------- Categories ----------

const categories = [
  { id: "pizzak", name: "Pizzák – 32 cm", note: "32 cm", order: 1 },
  { id: "extra-feltetek", name: "Extra feltétek", order: 2 },
  { id: "frissensultek", name: "Frissensültek", order: 3 },
  { id: "koretek", name: "Köretek", order: 4 },
  { id: "szoszok", name: "Szószok", order: 5 },
  { id: "desszertek", name: "Desszertek", order: 6 },
  { id: "savanyusag", name: "Savanyúság", order: 7 },
  { id: "italok", name: "Italok", note: "visszaváltási díj termékenként +50 Ft", order: 8 }
];

// ---------- Products ----------
// allergens follow the numbering printed on the original menu:
// 1 Glutén, 2 Rákfélék, 3 Tojás, 4 Hal, 5 Földimogyoró, 6 Szójabab,
// 7 Tej, 8 Diófélék, 9 Zeller, 10 Mustár, 11 Szezámmag, 12 Kéndioxid,
// 13 Csillagfürt, 14 Puhatestűek, 15 Méz

const products = [
  // Pizzák – 32 cm
  { id: "sajtos", categoryId: "pizzak", name: "Sajtos", description: "Paradicsomszósz, sajt", price: 3000, allergens: [1, 7], order: 1, active: true },
  { id: "sonkas", categoryId: "pizzak", name: "Sonkás", description: "Paradicsomszósz, sonka, sajt", price: 3100, allergens: [1, 7], order: 2, active: true },
  { id: "songoku", categoryId: "pizzak", name: "Songoku", description: "Paradicsomszósz, sonka, gomba, kukorica, sajt", price: 3300, allergens: [1, 7], order: 3, active: true },
  { id: "negysajtos", categoryId: "pizzak", name: "Négysajtos", description: "Paradicsomszósz, gouda, parmezán, camembert, füstölt sajt", price: 3400, allergens: [1, 7], order: 4, active: true },
  { id: "szalamis", categoryId: "pizzak", name: "Szalámis", description: "Paradicsomszósz, szalámi, sajt", price: 3100, allergens: [1, 7], order: 5, active: true },
  { id: "hawai", categoryId: "pizzak", name: "Hawai", description: "Paradicsomszósz, sonka, ananász, sajt", price: 3400, allergens: [1, 7], order: 6, active: true },
  { id: "magyaros", categoryId: "pizzak", name: "Magyaros", description: "Paradicsomszósz, csemegekolbász, bacon, hagyma, pepperóni, sajt", price: 3400, allergens: [1, 7], order: 7, active: true },
  { id: "tejfolos-tarjas", categoryId: "pizzak", name: "Tejfölös - tarjás", description: "Tejfölös alap, tarja, kukorica, hagyma, sajt", price: 3400, allergens: [1, 7], order: 8, active: true },
  { id: "bolognai", categoryId: "pizzak", name: "Bolognai", description: "Bolognai alap, sajt", price: 3400, allergens: [1, 7], order: 9, active: true },
  { id: "husimado", categoryId: "pizzak", name: "Húsimádó", description: "Paradicsomszósz, sonka, szalámi, bacon, tarja, sajt", price: 3400, allergens: [1, 7], order: 10, active: true },
  { id: "tonhalas", categoryId: "pizzak", name: "Tonhalas", description: "Paradicsomszósz, tonhal, hagyma, zöld olivabogyó, sajt", price: 3400, allergens: [1, 7, 4], order: 11, active: true },
  { id: "lazacos", categoryId: "pizzak", name: "Lazacos", description: "Paradicsomszósz, füstölt lazac, kecskesajt, olivabogyó, aszalt paradicsom, sajt", price: 3800, allergens: [1, 7, 4], order: 12, active: true },
  { id: "pizzacsiga", categoryId: "pizzak", name: "Pizzacsiga", description: "Paradicsomszósz, sonka, szalámi, sajt, fokhagymás tejfölös öntet", price: 3500, allergens: [1, 7], order: 13, active: true },

  // Extra feltétek
  { id: "extra-feltet", categoryId: "extra-feltetek", name: "Extra feltét", description: "Kolbász, szalámi, tarja, gouda sajt, bacon, camembert, füstölt sajt, gomba, kukorica, olivabogyó, tonhal, pepperóni, ananász", price: 600, order: 1, active: true },

  // Frissensültek
  { id: "rantott-csirkemell", categoryId: "frissensultek", name: "Rántott csirkemell", price: 2600, allergens: [1, 3], order: 1, active: true },
  { id: "rantott-csirkecombfile", categoryId: "frissensultek", name: "Rántott csirkecombfilé", price: 2600, allergens: [1, 3], order: 2, active: true },
  { id: "rantott-sajt", categoryId: "frissensultek", name: "Rántott sajt", price: 2600, allergens: [1, 3, 7], order: 3, active: true },

  // Köretek
  { id: "hasabburgonya", categoryId: "koretek", name: "Hasábburgonya", price: 900, order: 1, active: true },
  { id: "parolt-rizs", categoryId: "koretek", name: "Párolt rizs", price: 900, order: 2, active: true },

  // Szószok
  { id: "fokhagymas-tejfolos", categoryId: "szoszok", name: "Fokhagymás tejfölös mártogatós", price: 500, order: 1, active: true },
  { id: "pizzaszosz", categoryId: "szoszok", name: "Pizzaszósz", price: 500, order: 2, active: true },
  { id: "ketchup", categoryId: "szoszok", name: "Ketchup", price: 500, order: 3, active: true },
  { id: "majonez", categoryId: "szoszok", name: "Majonéz", price: 500, order: 4, active: true },

  // Desszertek
  { id: "panna-cotta", categoryId: "desszertek", name: "Panna cotta eperlekvárral", price: 1400, allergens: [7], order: 1, active: true },

  // Savanyúság
  { id: "csemege-uborka", categoryId: "savanyusag", name: "Csemege uborka", price: 850, priceSuffix: "/adag", order: 1, active: true },

  // Italok
  { id: "coca-cola-1l", categoryId: "italok", name: "Coca-Cola 1l", price: 900, order: 1, active: true },
  { id: "coca-cola-zero-1l", categoryId: "italok", name: "Coca-Cola Zero 1l", price: 900, order: 2, active: true },
  { id: "fanta-narancs-1l", categoryId: "italok", name: "Fanta - narancs 1l", price: 900, order: 3, active: true }
];

// ---------- Settings ----------

const settingsGeneral = {
  address: "Jókai Mór ltp. 9., Hajmáskér, 8192",
  addressMapsUrl: "https://maps.google.com/?q=Jókai+Mór+ltp.+9.,+Hajmáskér,+8192",
  phone: "+36705846276",
  phoneDisplay: "(70) 584 6276",
  email: "hajmaskerpizzeria@gmail.com",
  messengerUrl: "https://m.me/enzopizzahajmasker"
};

const settingsHours = {
  monday: { closed: true, open: "", close: "" },
  tuesday: { open: "11:00", close: "20:00" },
  wednesday: { open: "11:00", close: "20:00" },
  thursday: { open: "11:00", close: "20:00" },
  friday: { open: "11:00", close: "20:00" },
  saturday: { open: "11:00", close: "20:00" },
  sunday: { open: "11:00", close: "18:00" }
};

const settingsAllergens = {
  list: {
    1: "Glutén", 2: "Rákfélék", 3: "Tojás", 4: "Hal", 5: "Földimogyoró",
    6: "Szójabab", 7: "Tej", 8: "Diófélék", 9: "Zeller", 10: "Mustár",
    11: "Szezámmag", 12: "Kéndioxid", 13: "Csillagfürt", 14: "Puhatestűek", 15: "Méz"
  }
};

// ---------- Reviews ----------

const reviews = [
  { id: "review-1", name: "Nikoletta Gál", text: "10/10, kedves gyors kiszolgálás, az első jel, amire tényleg azt mondom, hogy tényleg megéri.", recommends: true, order: 1, visible: true },
  { id: "review-2", name: "Varga Beni", text: "Gyors, kedves kiszolgálás, finom pizza.", recommends: true, order: 2, visible: true },
  { id: "review-3", name: "Solyom Kriszti", text: "Gyors kedves kiszolgálás finom ételek.", recommends: true, order: 3, visible: true },
  { id: "review-4", name: "Sándor Nagy", text: "A pizza nagyon finom volt, és a kiszállítás nagyon gyors volt. Még tuti rendelünk.", recommends: true, order: 4, visible: true }
];

// ---------- Seed runner ----------

async function seed() {
  const batch = db.batch();

  categories.forEach(({ id, ...data }) => {
    batch.set(db.collection("categories").doc(id), data, { merge: true });
  });

  products.forEach(({ id, ...data }) => {
    batch.set(db.collection("products").doc(id), data, { merge: true });
  });

  reviews.forEach(({ id, ...data }) => {
    batch.set(db.collection("reviews").doc(id), data, { merge: true });
  });

  batch.set(db.collection("settings").doc("general"), settingsGeneral, { merge: true });
  batch.set(db.collection("settings").doc("hours"), settingsHours, { merge: true });
  batch.set(db.collection("settings").doc("allergens"), settingsAllergens, { merge: true });

  await batch.commit();
  console.log(`✓ Seed kész: ${categories.length} kategória, ${products.length} termék, ${reviews.length} vélemény, 3 settings dokumentum.`);
}

seed().catch(err => {
  console.error("Seed hiba:", err);
  process.exit(1);
});
