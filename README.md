# Enzopizza Hajmáskér — weboldal + admin felület

Ez a repó két alkalmazást tartalmaz, amelyek **egy** Vercel projektként deployolódnak, GitHub-ra pusholva (Vercel automatikusan újrabuildel minden commitnál).

| Mappa | Mi ez | Hol fut |
|---|---|---|
| `public-site/` | A publikus weboldal — sima HTML + CSS + JS, külön fájlokban | `https://tedomained.hu/` |
| `admin-cms/` | Saját admin felület (React + Vite + Firebase SDK), táblázatos, inline szerkeszthető | `https://tedomained.hu/admin` |
| `seed/` | Egyszeri script, ami feltölti a Firestore-t a menü kezdő adataival | csak helyben futtatva |

Mindkét app **ugyanazt** a Firebase projektet használja (`enzopizzahajm`): a publikus oldal csak **olvas** Firestore-ból, az admin felület **ír** is (bejelentkezés után).

> **Firebase Storage nincs használva.** A Storage fizetős (Blaze terv), ezért a termékfotók és a hero kép nem feltöltős mezők, hanem egyszerű **URL szöveg mezők** az admin felületen — illessz be egy linket egy ingyenes képtárhozó szolgáltatásból (pl. [imgur.com](https://imgur.com), [imagekit.io](https://imagekit.io) ingyenes csomag, vagy egy GitHub repo `raw.githubusercontent.com` linkje). A Firestore-t és az Authentication-t (email/jelszó) viszont az ingyenes Spark terv is tudja.

> **Az admin felület saját kódú, nem külső CMS-csomag.** Korábban a FireCMS-t próbáltuk (egy kész, nyílt forrású Firebase-admin keretrendszer), de ennek a self-hosted, React-build-alapú integrációja ebben a környezetben több egymást követő build-hibát is okozott (instabil release-candidate verziók, hiányzó Tailwind-függőségek). Ezért az admin felület most egy **kicsi, saját React app**, ami közvetlenül a Firebase Auth + Firestore SDK-t hívja — nulla külső CMS-függőséggel, így sokkal kevesebb a lehetséges hibaforrás.

---

## 1. Firebase projekt beállítása

A Firebase config már be van állítva mindkét appban (`enzopizzahajm` projekt). Ha valaha új projektre váltanál, ezt kell tenned:

1. **Firestore Database** → hozz létre egy adatbázist (production mode), ha még nincs.
2. **Authentication** → engedélyezd az **Email/Password** providert, majd a **Users** fülön hozd létre a saját admin felhasználódat (email + jelszó).
3. **Project settings → General → Your apps** → másold ki a `firebaseConfig` objektumot.

### A config beillesztése

A config már be van illesztve mindkét helyre (ha cserélnéd, ide kell):

- `public-site/js/firebase-config.js`
- `admin-cms/src/firebaseConfig.ts`

A Firebase web API kulcs (`apiKey`) **nem titkos** — kliensoldali azonosító, amit a Firebase Security Rules védenek, nem maga a kulcs eltitkolása. Nyugodtan commitolhatod GitHub-ra; ettől még a Firestore security rules (lásd lent) tartja kontroll alatt, ki mit olvashat/írhat.

### Security rules + index feltöltése

A repó gyökerében lévő `firestore.rules` és `firestore.indexes.json` fájlok tartalmazzák a publikus olvasás / admin írás szabályokat, és a lekérdezésekhez szükséges composite indexeket.

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # válaszd ki az enzopizzahajm projektet
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 2. Kezdő adatok feltöltése (seed)

A `seed/seed.js` script feltölti Firestore-t a menü teljes tartalmával (a papír menü alapján), plusz a nyitvatartással, elérhetőségekkel és a 4 véleménnyel.

1. Firebase Console → **Project settings → Service accounts → Generate new private key** → mentsd `seed/serviceAccountKey.json` néven (ez `.gitignore`-olva van, soha ne kerüljön repóba).
2. ```bash
   cd seed
   npm install
   npm run seed
   ```

Ezután a Firestore-ban meglesz: `categories` (8 db), `products` (~25 db), `reviews` (4 db), `settings/general`, `settings/hours`, `settings/allergens`.

A seed **újrafuttatható** — fix ID-kkal dolgozik (`merge: true`), nem hoz létre duplikátumokat.

---

## 3. Helyi fejlesztés

### Publikus oldal

```bash
cd public-site
npx serve .          # vagy bármilyen statikus szerver / Live Server
```

A `js/` mappában lévő fájlok ES modulokat használnak, ezért **nem** működik `file://`-ról megnyitva — mindig helyi szerverrel indítsd.

### Admin felület

```bash
cd admin-cms
npm install
npm run dev
```

Ez `http://localhost:5173/admin/` alatt indul (a `vite.config.ts`-ben beállított `base: "/admin/"` miatt).

---

## 4. Deploy: GitHub → Vercel

Ez **egyetlen** Vercel projekt, ami a gyökér `package.json` build scriptjét futtatja (`build.js`), ami:

1. lebuildeli az `admin-cms` React appot,
2. összemásolja a `public-site` statikus fájljaival egy közös `dist/` mappába, ahol az admin felület a `dist/admin/` alá kerül.

### Repó feltöltése GitHubra

```bash
cd enzopizza
git init
git add .
git commit -m "Enzopizza weboldal + admin felület"
git branch -M main
git remote add origin https://github.com/SAJAT-FELHASZNALONEVED/enzopizza.git
git push -u origin main
```

A `.gitignore` már gondoskodik róla, hogy a `node_modules/`, a build outputok és a `seed/serviceAccountKey.json` (ha létrehoznád) ne kerüljenek be a repóba.

### Vercel projekt összekötése

1. [vercel.com](https://vercel.com) → **Add New → Project** → válaszd ki a most felpusholt GitHub repót.
2. Vercel automatikusan felismeri a `vercel.json`-t és a gyökér `package.json` build scriptjét — nincs szükség kézi beállításra, de ellenőrzésképp:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node verzió: 18+
3. **Deploy.**

Ettől kezdve minden `git push` a `main` branch-re automatikusan újradeployolja az oldalt (a `public-site` és az `admin-cms` is egyszerre frissül).

A `vercel.json` gondoskodik róla, hogy `/admin` és `/admin/*` mindig az admin SPA `index.html`-jét szolgálja ki (kliensoldali routing miatt), és hogy az admin oldalak ne legyenek indexelve keresőkben (`X-Robots-Tag: noindex`).

---

## 4.1 Hibaelhárítás — üres admin oldal / konzol hiba

**Első lépés mindig:** nézd meg a **Vercel build logot** (Vercel dashboard → projekt → Deployments → a legutóbbi deploy sorára kattintva → "Building" log). Ha a build hibázik, a régi (esetleg hetekkel korábbi) sikeres build marad élesben — ez az oka, ha a hibaüzenetben szereplő JS fájlnév (pl. `index-XXXXXXXX.js`) több deploy után sem változik, mert új build hash csak **sikeres** buildnél generálódik.

A jelenlegi admin felület szándékosan minimális dependency-listával rendelkezik (`firebase`, `react`, `react-dom` + a Vite/TypeScript dev-eszközök) — nincs Tailwind, nincs PostCSS, nincs külső CMS-csomag —, hogy a build-hibák lehetséges forrásainak száma a lehető legkisebb legyen.

### Ha mégis build-hiba lenne

1. Nézd meg a Vercel build logban a pontos `npm run build` hibaüzenetet — ez (Vite/Rollup) mindig konkrét fájlra vagy modulra mutat.
2. Ellenőrizd, hogy a `admin-cms/package.json` és a tényleges `admin-cms/src/` fájlok összhangban vannak-e (pl. ha egy fájl importál valamit, ami nincs a `dependencies`-ben).
3. Helyben futtatva (`cd admin-cms && npm install && npm run build`) ugyanazt a hibát kell adnia, mint a Vercelen — ez a leggyorsabb módja a reprodukálásnak, mielőtt push-olnál.

### Ha a build sikeres, de runtime hiba van (üres oldal)

1. **Frissítsd a böngésző cache-t teljesen** (Ctrl+Shift+R / Cmd+Shift+R) **és** próbáld inkognitó/privát ablakban is.
2. A projekt tartalmaz egy **Error Boundary**-t (`src/ErrorBoundary.tsx`), ami runtime hiba esetén a tényleges hibaüzenetet **kiírja a képernyőre** olvasható szöveggel, fehér oldal helyett.
3. **Sourcemap be van kapcsolva** (`vite.config.ts` → `build.sourcemap: true`), így a böngésző konzolban a hiba a forrásfájl pontos sorára mutat majd.

Ha mindezek után is elakadnál, másold ide a **teljes Vercel build logot** vagy az Error Boundary által kiírt hibaüzenetet — ezekből sokkal pontosabban behatárolható a probléma, mint egy minifikált runtime stack trace-ből.

---

## 5. Mindennapi tartalomszerkesztés

Lépj be ide: **`https://tedomained.hu/admin`**, jelentkezz be az email/jelszavaddal.

A bal oldali menüben:

- **🍕 Termékek** — minden étel/ital egy táblázatban. Bármelyik cellába kattintva azonnal szerkeszthetsz (a mentés a mezőből kikattintáskor/elhagyáskor történik). Itt állítható: sorrend, név, kategória (legördülő), leírás, ár, ár-utótag (pl. "/adag"), **allergének** (kattintható számgombok, ugyanaz a számozás, mint a nyomtatott menün: 1=Glutén, 7=Tej, stb. — aktív szám = sárga kiemelés), és hogy aktív-e (kikapcsolva eltűnik a weboldalról törlés nélkül). A "✕" gombbal törölhető egy sor (megerősítő kérdéssel).
- **📂 Kategóriák** — a menü fő szekciói (Pizzák, Frissensültek, stb.), sorrenddel és opcionális megjegyzéssel (pl. "32 cm").
- **⭐ Vélemények** — vendégvélemények táblázata, "Ajánlja" és "Látható" kapcsolókkal (utóbbival elrejthető a weboldalról törlés nélkül).
- **⚙️ Beállítások** — két form: **Elérhetőségek** (cím, Google Maps link, telefon, email, Messenger, hero fotó URL) és **Nyitvatartás** (naponkénti nyitás/zárás vagy "Zárva" jelölés). Mindkettőn külön "Mentés" gomb van.

### Termékfotók és a hero kép

Mivel a Firebase Storage fizetős, az admin felületen a kép mezők egyszerű **URL szöveg mezők**, nem feltöltők. Menet:

1. Töltsd fel a fotót egy ingyenes képtárhozóra (pl. [imgur.com](https://imgur.com) — húzd be a képet, jobb klikk → "Copy image address").
2. Az így kapott közvetlen képlinket (ami `.jpg`/`.png`-re végződik) illeszd be a **Beállítások** oldal **Főoldali (hero) fotó URL** mezőjébe.

A weboldal **élesben**, oldalbetöltéskor olvassa ki ezeket Firestore-ból — tehát bármilyen admin felületen végzett mentés azonnal (legfeljebb egy oldalfrissítés után) megjelenik a publikus oldalon, kód módosítása nélkül.

---

## 6. Adatszerkezet — gyors referencia

```
categories/{id}        name, note?, order
products/{id}          name, description?, price, priceSuffix?, categoryId,
                        allergens: number[], tags?: string[], order,
                        active: boolean, imageUrl?
reviews/{id}            name, text, recommends: boolean, order, visible: boolean
settings/general        address, addressMapsUrl, phone, phoneDisplay, email,
                        messengerUrl, heroPhotoUrl?
settings/hours          monday..sunday: { open, close } | { closed: true }
settings/allergens      list: { [code: number]: string }
```

Ez a séma **azonos** a publikus oldal JS-ében (`public-site/js/menu.js`, `info.js`), az admin felület típusaiban (`admin-cms/src/lib/types.ts`) és a seed scriptben (`seed/seed.js`) — ha bármelyiket módosítod, a másik kettőt is frissítsd ugyanúgy.

---

## 7. Mappa-/fájlstruktúra

```
public-site/
  index.html
  css/
    base.css         design tokenek, reset, tipográfia
    layout.css        header, hero, szekciók, footer
    components.css    menü kártyák, fülek, vélemény kártyák, mobil nav
  js/
    firebase-config.js  Firebase init (csak olvasás)
    menu.js              kategóriák + termékek betöltése és renderelése
    info.js               nyitvatartás, kapcsolat, vélemények betöltése
    app.js                mobil navigáció, scroll állapot, induló hívások
  assets/
    hero-pizza.jpg     (saját fotó ide — lásd assets/README.md)

admin-cms/
  index.html
  package.json          csak firebase + react + react-dom + Vite/TS — semmi más
  vite.config.ts
  tsconfig.json
  src/
    firebaseConfig.ts
    main.tsx               React entry, ErrorBoundary + globális CSS betöltése
    App.tsx                 auth-gate + oldalsáv navigáció + oldalváltás
    ErrorBoundary.tsx        crash esetén olvasható hibaüzenet a fehér oldal helyett
    index.css                saját, sima CSS (ugyanaz a brand-színvilág, mint a weboldalon)
    vite-env.d.ts            Vite kliens típusok (CSS import stb.)
    lib/
      firebase.ts            Firebase app/Auth/Firestore inicializálás
      types.ts                közös típusok (Category, Product, Review, Settings…)
      useAuth.ts               bejelentkezés-állapot hook
      useCollection.ts         generikus Firestore lista + dokumentum hook (CRUD, real-time)
    components/
      EditableCell.tsx         inline szerkeszthető táblázat-cellák (szöveg, szám, checkbox, select, allergén-chipek)
    pages/
      LoginPage.tsx
      ProductsPage.tsx
      CategoriesPage.tsx
      ReviewsPage.tsx
      SettingsPage.tsx
```
