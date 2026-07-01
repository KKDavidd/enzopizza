import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = {
  monday: "Hétfő", tuesday: "Kedd", wednesday: "Szerda", thursday: "Csütörtök",
  friday: "Péntek", saturday: "Szombat", sunday: "Vasárnap"
};

// Ezek az értékek már be vannak írva az index.html-be (contact-address,
// contact-phone, contact-email, contact-messenger, footer-address,
// header-call-link), így az oldal Firestore nélkül is helyesen jelenik meg.
// A backendből (settings/general) jövő adat csak akkor írja felül a DOM-ot,
// ha VALÓBAN eltér ettől az alapértéktől — így nincs felesleges "vibrálás",
// ha a Firestore-ban ugyanaz van beállítva, mint az alapérték.
const DEFAULT_SETTINGS = {
  address: "Jókai Mór ltp. 9., Hajmáskér, 8192",
  addressMapsUrl: "https://maps.google.com/?q=Jókai+Mór+ltp.+9.,+Hajmáskér,+8192",
  phone: "+36705846276",
  phoneDisplay: "(70) 584 6276",
  email: "hajmaskerpizzeria@gmail.com",
  messengerUrl: "https://m.me/enzopizzahajmasker"
};

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || "")
    .join("");
}

function getTodayKey() {
  const jsDay = new Date().getDay(); 
  return DAY_KEYS[(jsDay + 6) % 7]; 
}

function isOpenNow(dayHours) {
  if (!dayHours || dayHours.closed) return false;
  const now = new Date();
  const [oh, om] = dayHours.open.split(":").map(Number);
  const [ch, cm] = dayHours.close.split(":").map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= openMins && nowMins < closeMins;
}

function renderHours(hours) {
  const tbody = document.querySelector("#hours-table tbody");
  const nowText = document.getElementById("hours-now-text");
  const openBadge = document.getElementById("open-now-badge");
  const openLabel = document.getElementById("open-now-label");
  if (!tbody || !hours) return;

  const todayKey = getTodayKey();
  tbody.innerHTML = "";

  DAY_KEYS.forEach(key => {
    const dayHours = hours[key];
    const tr = el("tr");
    if (key === todayKey) tr.classList.add("today");
    if (!dayHours || dayHours.closed) tr.classList.add("closed");

    const valueLabel = (!dayHours || dayHours.closed)
      ? "Zárva"
      : `${dayHours.open} - ${dayHours.close}`;

    tr.innerHTML = `<td>${DAY_LABELS[key]}</td><td>${valueLabel}</td>`;
    tbody.appendChild(tr);
  });

  const todayHours = hours[todayKey];
  const openNow = isOpenNow(todayHours);

  if (nowText) {
    nowText.textContent = openNow
      ? `Most nyitva — ${todayHours.open}-${todayHours.close} óráig`
      : "Most zárva";
  }
  if (openBadge && openLabel) {
    openBadge.textContent = openNow ? "Nyitva" : "Zárva";
    openLabel.textContent = "most";
  }
}

function renderSettings(settings) {
  const addressLink = document.getElementById("contact-address");
  const phoneLink = document.getElementById("contact-phone");
  const emailLink = document.getElementById("contact-email");
  const messengerLink = document.getElementById("contact-messenger");
  const footerAddress = document.getElementById("footer-address");
  const headerCallValue = document.querySelector("#header-call-link .cta-value");
  const heroImg = document.getElementById("hero-photo-img");

  // A HTML-ben már ott vannak az alapértékek (DEFAULT_SETTINGS).
  // Csak akkor nyúlunk a DOM-hoz, ha a Firestore-ból jövő érték
  // TÉNYLEGESEN eltér az alapértéktől — ha nincs settings dokumentum,
  // vagy pontosan ugyanaz van beállítva, a lap a saját alapértékét tartja.
  const remote = settings || {};

  const addressChanged = remote.address && remote.address !== DEFAULT_SETTINGS.address;
  const phoneChanged = remote.phone && remote.phone !== DEFAULT_SETTINGS.phone;
  const phoneDisplayChanged = remote.phoneDisplay && remote.phoneDisplay !== DEFAULT_SETTINGS.phoneDisplay;
  const emailChanged = remote.email && remote.email !== DEFAULT_SETTINGS.email;
  const messengerChanged = remote.messengerUrl && remote.messengerUrl !== DEFAULT_SETTINGS.messengerUrl;

  if (addressLink && addressChanged) {
    addressLink.textContent = remote.address;
    addressLink.href = remote.addressMapsUrl || "#";
  }
  if (phoneLink && (phoneChanged || phoneDisplayChanged)) {
    phoneLink.textContent = remote.phoneDisplay || remote.phone;
    phoneLink.href = `tel:${remote.phone || DEFAULT_SETTINGS.phone}`;
  }
  if (emailLink && emailChanged) {
    emailLink.textContent = remote.email;
    emailLink.href = `mailto:${remote.email}`;
  }
  if (messengerLink && messengerChanged) {
    messengerLink.href = remote.messengerUrl;
  }
  if (footerAddress && addressChanged) {
    footerAddress.textContent = remote.address;
  }
  if (headerCallValue && (phoneChanged || phoneDisplayChanged)) {
    headerCallValue.textContent = remote.phoneDisplay || remote.phone;
    document.getElementById("header-call-link").href = `tel:${remote.phone || DEFAULT_SETTINGS.phone}`;
  }
  // A hero fotónak nincs statikus alapértéke a HTML-ben, azt továbbra is
  // mindig beállítjuk, ha a backend ad meg egyet.
  if (heroImg && remote.heroPhotoUrl) {
    heroImg.src = remote.heroPhotoUrl;
  }
}

function renderReviews(reviews) {
  const grid = document.getElementById("reviews-grid");
  const scoreValue = document.getElementById("reviews-score-value");
  const countLabel = document.getElementById("reviews-count-label");
  const statReviews = document.getElementById("stat-reviews");
  const statRating = document.getElementById("stat-rating");
  if (!grid) return;

  grid.innerHTML = "";
  if (!reviews.length) {
    grid.parentElement.hidden = true;
    return;
  }

  const recommendCount = reviews.filter(r => r.recommends !== false).length;
  const pct = Math.round((recommendCount / reviews.length) * 100);

  if (scoreValue) scoreValue.textContent = `${pct}%`;
  if (countLabel) countLabel.textContent = `${reviews.length} vélemény alapján`;
  if (statReviews) statReviews.textContent = String(reviews.length);
  if (statRating) statRating.textContent = `${pct}%`;

  reviews.forEach(r => {
    const card = el("article", "review-card");
    card.innerHTML = `
      <div class="review-head">
        <div class="review-avatar">${escapeHtml(initials(r.name))}</div>
        <div>
          <p class="review-name">${escapeHtml(r.name || "Vendég")}</p>
          ${r.recommends !== false ? `<p class="review-recommend">✓ ajánlja</p>` : ""}
        </div>
      </div>
      <p class="review-text">${escapeHtml(r.text || "")}</p>
    `;
    grid.appendChild(card);
  });
}

async function loadSettings() {
  const snap = await getDoc(doc(db, "settings", "general"));
  return snap.exists() ? snap.data() : null;
}

async function loadHours() {
  const snap = await getDoc(doc(db, "settings", "hours"));
  return snap.exists() ? snap.data() : null;
}

async function loadReviews() {
  try {
    const q = query(
      collection(db, "reviews"),
      where("visible", "==", true),
      orderBy("order", "asc"),
      limit(12)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Összetett index hiányzik, fallback használata:", err);
    try {
      const q = query(collection(db, "reviews"), orderBy("order", "asc"), limit(12));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.visible !== false);
    } catch (err2) {
      console.warn("Vélemények betöltése sikertelen.", err2);
      return [];
    }
  }
}

export async function initInfo() {
  try {
    const [settings, hours, reviews] = await Promise.all([
      loadSettings(),
      loadHours(),
      loadReviews()
    ]);
    renderSettings(settings);
    renderHours(hours);
    renderReviews(reviews);
  } catch (err) {
    console.error("Adatok betöltési hiba (settings/hours/reviews):", err);
  }
}
