import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc
} from "https:

const DEFAULT_ALLERGENS = {
  1: "Glutén", 2: "Rákfélék", 3: "Tojás", 4: "Hal", 5: "Földimogyoró",
  6: "Szójabab", 7: "Tej", 8: "Diófélék", 9: "Zeller", 10: "Mustár",
  11: "Szezámmag", 12: "Kéndioxid", 13: "Csillagfürt", 14: "Puhatestűek", 15: "Méz"
};

const HUF = new Intl.NumberFormat("hu-HU");

function formatPrice(price, suffix) {
  if (typeof price !== "number") return "";
  return `${HUF.format(price)} Ft${suffix ? ` ${suffix}` : ""}`;
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderAllergenLegend(allergenMap) {
  const listNode = document.getElementById("allergen-list");
  if (!listNode) return;
  listNode.innerHTML = "";
  Object.entries(allergenMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([code, label]) => {
      const li = el("li", null, `${code}. ${label}`);
      listNode.appendChild(li);
    });
}

function renderMenuItem(product) {
  const allergensLabel = (product.allergens || []).length
    ? `(${product.allergens.join(",")})`
    : "";

  const card = el("article", "menu-item");
  card.innerHTML = `
    <div class="menu-item-head">
      <p class="menu-item-name">${escapeHtml(product.name || "")}
        ${allergensLabel ? `<span class="menu-item-allergens">${allergensLabel}</span>` : ""}
      </p>
      <p class="menu-item-price">${formatPrice(product.price, product.priceSuffix)}</p>
    </div>
    ${product.description ? `<p class="menu-item-desc">${escapeHtml(product.description)}</p>` : ""}
    ${(product.tags && product.tags.length) ? `
      <div class="menu-item-tags">
        ${product.tags.map(t => `<span class="menu-item-tag">${escapeHtml(t)}</span>`).join("")}
      </div>` : ""}
  `;
  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function loadAllergenOverrides() {
  try {
    const snap = await getDoc(doc(db, "settings", "allergens"));
    if (snap.exists() && snap.data().list) {
      return { ...DEFAULT_ALLERGENS, ...snap.data().list };
    }
  } catch (err) {
    console.warn("Allergén lista betöltése sikertelen, alapértelmezett lista használata.", err);
  }
  return DEFAULT_ALLERGENS;
}

async function loadCategories() {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function loadProducts() {
  try {
    
    const q = query(
      collection(db, "products"),
      where("active", "==", true),
      orderBy("order", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    
    
    console.warn("Összetett index hiányzik, kliens oldali szűrés használata:", err);
    const q = query(collection(db, "products"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.active !== false);
  }
}

function buildMenuDOM(categories, productsByCategory) {
  const tabsNode = document.getElementById("menu-tabs");
  const contentNode = document.getElementById("menu-content");
  tabsNode.innerHTML = "";
  contentNode.innerHTML = "";

  categories.forEach((cat, idx) => {
    const items = productsByCategory[cat.id] || [];
    if (!items.length) return;

    const tabId = `tab-${slugify(cat.name)}`;
    const panelId = `panel-${slugify(cat.name)}`;

    
    const tabBtn = el("button", "tab-btn", cat.name);
    tabBtn.id = tabId;
    tabBtn.type = "button";
    tabBtn.setAttribute("role", "tab");
    tabBtn.setAttribute("aria-controls", panelId);
    tabBtn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
    tabBtn.addEventListener("click", () => {
      document.getElementById(panelId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      tabsNode.querySelectorAll(".tab-btn").forEach(b => b.setAttribute("aria-selected", "false"));
      tabBtn.setAttribute("aria-selected", "true");
    });
    tabsNode.appendChild(tabBtn);

    
    const group = el("div", "menu-group");
    group.id = panelId;
    group.setAttribute("role", "tabpanel");
    group.setAttribute("aria-labelledby", tabId);
    group.style.animationDelay = `${Math.min(idx * 0.05, 0.3)}s`;

    const titleHtml = cat.note
      ? `${escapeHtml(cat.name)} <small style="font-family:var(--font-mono);font-size:0.7rem;color:var(--color-cream-dim);text-transform:none;">${escapeHtml(cat.note)}</small>`
      : escapeHtml(cat.name);
    group.appendChild(el("h3", "menu-group-title", titleHtml));

    const grid = el("div", "menu-grid");
    items.forEach(p => grid.appendChild(renderMenuItem(p)));
    group.appendChild(grid);

    contentNode.appendChild(group);
  });
}

export async function initMenu() {
  const loadingNode = document.getElementById("menu-loading");
  const contentNode = document.getElementById("menu-content");
  const emptyNode = document.getElementById("menu-empty");

  try {
    const [categories, products, allergenMap] = await Promise.all([
      loadCategories(),
      loadProducts(),
      loadAllergenOverrides()
    ]);

    const productsByCategory = {};
    products.forEach(p => {
      if (!p.categoryId) return;
      (productsByCategory[p.categoryId] ||= []).push(p);
    });

    const hasAnyItems = categories.some(c => (productsByCategory[c.id] || []).length > 0);

    if (!hasAnyItems) {
      loadingNode.hidden = true;
      emptyNode.hidden = false;
      return;
    }

    buildMenuDOM(categories, productsByCategory);
    renderAllergenLegend(allergenMap);

    loadingNode.hidden = true;
    contentNode.hidden = false;
  } catch (err) {
    console.error("Menü betöltési hiba:", err);
    loadingNode.hidden = true;
    if (contentNode) contentNode.hidden = true;
    emptyNode.hidden = false;
  }
}
