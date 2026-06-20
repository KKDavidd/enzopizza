# Enzopizza Hajmáskér — weboldal + admin CMS

Ez a repó két alkalmazást tartalmaz, amelyek **egy** Vercel projektként deployolódnak, GitHube-ra pusholva (Vercel automatikusan újrabuildel minden commitnál).

| Mappa | Mi ez | Hol fut |
|---|---|---|
| `public-site/` | A publikus weboldal — sima HTML + CSS + JS, külön fájlokban | `https://tedomained.hu/` |
| `admin-cms/` | A FireCMS admin felület (React + Vite) | `https://tedomained.hu/admin` |
| `seed/` | Egyszeri script, ami feltölti a Firestore-t a menü kezdő adataival | csak helyben futtatva |

Mindkét app **ugyanazt** a Firebase projektet használja (`enzopizzahajm`): a publikus oldal csak **olvas** Firestore-ból, a CMS **ír** is (bejelentkezés után).

> **Firebase Storage nincs használva.** A Storage fizetős (Blaze terv), ezért a termékfotók és a hero kép nem feltöltős mezők, hanem egyszerű **URL szöveg mezők** a CMS-ben — illessz be egy linket egy ingyenes képtárhozó szolgáltatásból (pl. [imgur.com](https://imgur.com), [imagekit.io](https://imagekit.io) ingyenes csomag, vagy akár egy GitHub repo `raw.githubusercontent.com` linkje). A Firestore-t és az Authentication-t (email/jelszó) viszont az ingyenes Spark terv is tudja.

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

A Firebase web API kulcs (`apiKey`) **nem titkos** — kliensoldali azonosító, amit a Firebase Security Rules védenek, nem maga a kulcs eltitkolása. Nyugodtan commitolhatod GitHube-ra; ettől még a Firestore security rules (lásd lent) tartja kontroll alatt, ki mit olvashat/írhat.

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

### Admin (FireCMS)

```bash
cd admin-cms
npm install
npm run dev
```

Ez `http://localhost:5173/admin/` alatt indul (a `vite.config.ts`-ben beállított `base: "/admin/"` miatt).

---

## 4. Deploy: GitHub → Vercel

Ez **egyetlen** Vercel projekt, ami a gyökér `package.json` build scriptjét futtatja (`build.js`), ami:

1. lebuildeli a `admin-cms` React appot,
2. összemásolja a `public-site` statikus fájljaival egy közös `dist/` mappába, ahol a CMS a `dist/admin/` alá kerül.

### Repó feltöltése GitHubra

```bash
cd enzopizza
git init
git add .
git commit -m "Enzopizza weboldal + admin CMS"
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

A `vercel.json` gondoskodik róla, hogy `/admin` és `/admin/*` mindig az admin SPA `index.html`-jét szolgálja ki (kliensoldali routing miatt), és hogy a CMS oldalak ne legyenek indexelve keresőkben (`X-Robots-Tag: noindex`).

---

## 5. Mindennapi tartalomszerkesztés

Lépj be ide: **`https://tedomained.hu/admin`**, jelentkezz be az email/jelszavaddal.

A bal oldali menüben:

- **Menü → Kategóriák** — a menü fő szekciói (Pizzák, Frissensültek, stb.) és a megjelenési sorrendjük.
- **Menü → Termékek** — minden étel/ital. Itt állítható az ár, leírás, **allergének számokkal** (ugyanaz a számozás, mint a nyomtatott menün: 1=Glutén, 7=Tej, stb.), kép **URL** (lásd lent), és hogy aktív-e (ha kikapcsolod, eltűnik a weboldalról anélkül, hogy törölnéd).
- **Tartalom → Vélemények** — vendégvélemények, ki/be kapcsolható láthatósággal.
- **Beállítások → Beállítások** — két dokumentum: `general` (cím, telefon, email, Messenger link, hero fotó URL) és `hours` (nyitvatartás naponta). Csak ezt a kettőt szerkeszd, ne hozz létre újat.

### Termékfotók és a hero kép

Mivel a Firebase Storage fizetős, a CMS-ben a kép mezők egyszerű **URL szöveg mezők**, nem feltöltők. Menet:

1. Töltsd fel a fotót egy ingyenes képtárhozóra (pl. [imgur.com](https://imgur.com) — húzd be a képet, jobb klikk → "Copy image address").
2. Az így kapott közvetlen képlinket (ami `.jpg`/`.png`-re végződik) illeszd be a CMS-ben a termék **Kép URL** mezőjébe, vagy a `settings/general` dokumentum **Főoldali (hero) fotó URL** mezőjébe.

A weboldal **élesben**, oldalbetöltéskor olvassa ki ezeket Firestore-ból — tehát bármilyen CMS-ben végzett mentés azonnal (legfeljebb egy oldalfrissítés után) megjelenik a publikus oldalon, kód módosítása nélkül.

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

---

## 7. Mappa-/fájlstruktúra (a kérésnek megfelelően külön HTML/CSS/JS)

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
  src/
    firebaseConfig.ts
    App.tsx                FireCMS app összerakása (auth + collections)
    main.tsx
    collections/
      categories.ts
      products.ts
      reviews.ts
      settings.ts
      index.ts
```
