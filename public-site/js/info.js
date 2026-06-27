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
  if (!settings) return;

  const addressLink = document.getElementById("contact-address");
  const phoneLink = document.getElementById("contact-phone");
  const emailLink = document.getElementById("contact-email");
  const messengerLink = document.getElementById("contact-messenger");
  const footerAddress = document.getElementById("footer-address");
  const headerCallValue = document.querySelector("#header-call-link .cta-value");
  const heroImg = document.getElementById("hero-photo-img");

  if (addressLink && settings.address) {
    addressLink.textContent = settings.address;
    addressLink.href = settings.addressMapsUrl || "#";
  }
  if (phoneLink && settings.phone) {
    phoneLink.textContent = settings.phoneDisplay || settings.phone;
    phoneLink.href = `tel:${settings.phone}`;
  }
  if (emailLink && settings.email) {
    emailLink.textContent = settings.email;
    emailLink.href = `mailto:${settings.email}`;
  }
  if (messengerLink && settings.messengerUrl) {
    messengerLink.href = settings.messengerUrl;
  }
  if (footerAddress && settings.address) {
    footerAddress.textContent = settings.address;
  }
  if (headerCallValue && settings.phoneDisplay) {
    headerCallValue.textContent = settings.phoneDisplay;
    document.getElementById("header-call-link").href = `tel:${settings.phone || ""}`;
  }
  if (heroImg && settings.heroPhotoUrl) {
    heroImg.src = settings.heroPhotoUrl;
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
