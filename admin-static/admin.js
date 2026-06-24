// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS (vanilla JS, CDN Firebase)
// No bundler — Firebase loaded directly from CDN so tree-shaking
// cannot remove Firestore component registration.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Firebase init ────────────────────────────────────────────
const app = initializeApp({
  apiKey: "AIzaSyCLTLuVFG36zXOzF1YkrPm2hr4k8hRFwHI",
  authDomain: "enzohajm.firebaseapp.com",
  projectId: "enzohajm",
  storageBucket: "enzohajm.firebasestorage.app",
  messagingSenderId: "788231794322",
  appId: "1:788231794322:web:f2203afd0320954371004b"
});
const auth = getAuth(app);
const db = getFirestore(app);

// ── Constants ────────────────────────────────────────────────
const ALLERGEN_LEGEND = {
  1:"Glutén",2:"Rákfélék",3:"Tojás",4:"Hal",5:"Földimogyoró",
  6:"Szójabab",7:"Tej",8:"Diófélék",9:"Zeller",10:"Mustár",
  11:"Szezámmag",12:"Kéndioxid",13:"Csillagfürt",14:"Puhatestűek",15:"Méz"
};
const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS = {monday:"Hétfő",tuesday:"Kedd",wednesday:"Szerda",thursday:"Csütörtök",friday:"Péntek",saturday:"Szombat",sunday:"Vasárnap"};
const ERROR_MESSAGES = {
  "auth/invalid-credential":"Hibás email cím vagy jelszó.",
  "auth/invalid-email":"Érvénytelen email cím.",
  "auth/user-disabled":"Ez a fiók le van tiltva.",
  "auth/too-many-requests":"Túl sok próbálkozás. Várj egy kicsit, majd próbáld újra."
};

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, attrs = {}, ...children) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "className") e.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    e.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return e;
};

// ── State ────────────────────────────────────────────────────
let currentPage = "products";
let currentUser = null;
const unsubs = [];

// ── Auth ─────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  currentUser = user;
  render();
});

// ── Render root ──────────────────────────────────────────────
function render() {
  const root = $("root");
  root.innerHTML = "";
  if (currentUser === null) {
    // still loading
    root.append(el("div", {className:"center-screen"}, "Betöltés…"));
    return;
  }
  if (!currentUser.uid) {
    renderLogin(root);
    return;
  }
  renderShell(root);
}

// Triggered by onAuthStateChanged: null = loading, object with no uid = signed out
onAuthStateChanged(auth, user => {
  currentUser = user ? user : {uid: null};
  render();
});

// ── Login ────────────────────────────────────────────────────
function renderLogin(root) {
  let errDiv;
  const emailInput = el("input", {id:"email",type:"email",autocomplete:"username",required:""});
  const passInput = el("input", {id:"password",type:"password",autocomplete:"current-password",required:""});
  const submitBtn = el("button", {className:"btn btn-primary login-submit",type:"button"}, "Bejelentkezés");
  errDiv = el("div", {className:"login-error",style:{display:"none"}});

  submitBtn.addEventListener("click", async () => {
    errDiv.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Bejelentkezés…";
    try {
      await signInWithEmailAndPassword(auth, emailInput.value.trim(), passInput.value);
    } catch(e) {
      errDiv.textContent = ERROR_MESSAGES[e.code] || "Bejelentkezési hiba történt.";
      errDiv.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Bejelentkezés";
    }
  });

  root.append(el("div", {className:"login-screen"},
    el("div", {className:"login-card"},
      el("h1", {}, "Enzopizza — Admin"),
      el("p", {className:"page-sub"}, "Jelentkezz be a menü szerkesztéséhez."),
      errDiv,
      el("div", {className:"login-field"},
        el("label", {for:"email"}, "Email"), emailInput),
      el("div", {className:"login-field"},
        el("label", {for:"password"}, "Jelszó"), passInput),
      submitBtn
    )
  ));
}

// ── Shell ────────────────────────────────────────────────────
function renderShell(root) {
  const NAV = [
    {key:"products",label:"Termékek",icon:"🍕"},
    {key:"categories",label:"Kategóriák",icon:"📂"},
    {key:"reviews",label:"Vélemények",icon:"⭐"},
    {key:"settings",label:"Beállítások",icon:"⚙️"},
  ];

  const mainEl = el("main", {className:"main"});

  const navBtns = {};
  const navEl = el("nav", {className:"sidebar-nav"});
  for (const {key, label, icon} of NAV) {
    const btn = el("button", {}, el("span", {"aria-hidden":"true"}, icon), " " + label);
    btn.className = key === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = key;
      for (const [k,b] of Object.entries(navBtns)) b.className = k === currentPage ? "active" : "";
      loadPage(mainEl);
    });
    navBtns[key] = btn;
    navEl.append(btn);
  }

  root.append(el("div", {className:"app-shell"},
    el("aside", {className:"sidebar"},
      el("div", {className:"sidebar-brand"},
        el("div", {className:"sidebar-brand-mark"}, "EP"),
        el("div", {className:"sidebar-brand-name"}, "Enzopizza",
          el("small", {}, "ADMIN · HAJMÁSKÉR"))
      ),
      navEl,
      el("div", {className:"sidebar-footer"},
        el("p", {className:"sidebar-user"}, currentUser.email || ""),
        el("button", {className:"btn-logout", onClick: () => signOut(auth)}, "Kijelentkezés")
      )
    ),
    mainEl
  ));

  loadPage(mainEl);
}

// ── Page loader ──────────────────────────────────────────────
function loadPage(container) {
  // Clear previous Firestore subscriptions
  for (const u of unsubs) try { u(); } catch {}
  unsubs.length = 0;
  container.innerHTML = "";
  if (currentPage === "products") renderProductsPage(container);
  else if (currentPage === "categories") renderCategoriesPage(container);
  else if (currentPage === "reviews") renderReviewsPage(container);
  else if (currentPage === "settings") renderSettingsPage(container);
}

// ── Generic table page builder ───────────────────────────────
function collectionPage(container, colPath, orderField, {title, subtitle, emptyMsg, addLabel, buildRow, newItem, columns}) {
  container.append(
    el("div", {className:"page-head"},
      el("div", {},
        el("h1", {}, title),
        el("p", {className:"page-sub"}, subtitle)
      )
    )
  );

  const countSpan = el("span", {className:"page-sub"}, "…");
  const addBtn = el("button", {className:"btn btn-primary"}, addLabel);
  container.append(el("div", {className:"toolbar"}, countSpan, addBtn));

  const errP = el("p", {className:"login-error", style:{display:"none"}});
  const bodyEl = el("p", {className:"empty-state"}, "Betöltés…");
  container.append(errP, bodyEl);

  const thead = el("thead", {}, el("tr", {}, ...columns.map(c => el("th", {className:c.className||""}, c.label))));
  const tbody = el("tbody", {});
  const table = el("table", {className:"data-table"}, thead, tbody);
  const wrap = el("div", {className:"table-wrap"}, table);

  let items = [];

  const q = query(collection(db, colPath), orderBy(orderField, "asc"));
  const unsub = onSnapshot(q, snap => {
    items = snap.docs.map(d => ({id:d.id, ...d.data()}));
    countSpan.textContent = `${items.length} elem`;
    tbody.innerHTML = "";
    if (!items.length) {
      bodyEl.textContent = emptyMsg;
      bodyEl.style.display = "";
      wrap.style.display = "none";
    } else {
      bodyEl.style.display = "none";
      wrap.style.display = "";
      for (const item of items) tbody.append(buildRow(item, items, update, remove));
    }
  }, err => {
    errP.textContent = "Hiba: " + err.message;
    errP.style.display = "";
    bodyEl.textContent = "";
  });
  unsubs.push(unsub);
  container.append(wrap);

  async function update(id, patch) {
    await updateDoc(doc(db, colPath, id), patch);
  }
  async function remove(id) {
    await deleteDoc(doc(db, colPath, id));
  }

  addBtn.addEventListener("click", async () => {
    await addDoc(collection(db, colPath), newItem(items));
  });
}

// ── Text cell ────────────────────────────────────────────────
function textCell(value, onSave, {className="", placeholder=""} = {}) {
  const inp = el("input", {className:`cell-input ${className}`, value: value ?? "", placeholder});
  inp.addEventListener("blur", () => { if (inp.value !== value) onSave(inp.value); });
  inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
  return inp;
}

function numberCell(value, onSave, {className="", min=""} = {}) {
  const inp = el("input", {type:"number", className:`cell-input ${className}`, value: value ?? "", min});
  inp.addEventListener("blur", () => {
    const n = Number(inp.value);
    if (!isNaN(n) && n !== value) onSave(n);
  });
  inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
  return inp;
}

function checkboxCell(checked, onSave) {
  const inp = el("input", {type:"checkbox"});
  inp.checked = !!checked;
  inp.addEventListener("change", () => onSave(inp.checked));
  return inp;
}

function selectCell(value, options, onSave) {
  const sel = el("select", {className:"cell-input"},
    ...options.map(o => {
      const opt = el("option", {value:o.value}, o.label);
      if (o.value === value) opt.selected = true;
      return opt;
    })
  );
  sel.addEventListener("change", () => onSave(sel.value));
  return sel;
}

function allergenCell(selected, onSave) {
  const sel = new Set(selected || []);
  const wrap = el("div", {className:"allergen-chips"});
  const chips = {};
  for (const [code, label] of Object.entries(ALLERGEN_LEGEND)) {
    const btn = el("button", {type:"button", className:`allergen-chip${sel.has(Number(code))?" active":""}`, title:label}, code);
    btn.addEventListener("click", () => {
      if (sel.has(Number(code))) sel.delete(Number(code)); else sel.add(Number(code));
      btn.className = `allergen-chip${sel.has(Number(code))?" active":""}`;
      onSave(Array.from(sel).sort((a,b)=>a-b));
    });
    chips[code] = btn;
    wrap.append(btn);
  }
  return wrap;
}

function deleteBtn(onClick) {
  const btn = el("button", {className:"icon-btn", title:"Törlés"}, "✕");
  btn.addEventListener("click", onClick);
  return btn;
}

// ── Products page ────────────────────────────────────────────
function renderProductsPage(container) {
  let categories = [];

  // Subscribe to categories for the select
  const catUnsub = onSnapshot(
    query(collection(db, "categories"), orderBy("order","asc")),
    snap => { categories = snap.docs.map(d=>({id:d.id,...d.data()})); }
  );
  unsubs.push(catUnsub);

  collectionPage(container, "products", "order", {
    title: "Termékek",
    subtitle: "A menü összes étele és itala. Kattints a cellába a szerkesztéshez — mentés elhagyáskor történik.",
    emptyMsg: "Még nincs egyetlen termék sem.",
    addLabel: "+ Új termék",
    columns: [
      {label:"Sorrend",className:"cell-order"},
      {label:"Név",className:"cell-name"},
      {label:"Kategória"},
      {label:"Leírás",className:"cell-desc"},
      {label:"Ár (Ft)",className:"cell-price"},
      {label:"Ár utótag",className:"cell-price"},
      {label:"Allergének",className:"cell-allergens"},
      {label:"Aktív",className:"cell-checkbox"},
      {label:"",className:"cell-actions"},
    ],
    newItem: (items) => ({
      name:"Új termék", description:"", price:0,
      categoryId: categories[0]?.id || "",
      allergens:[], order: (items.length ? Math.max(...items.map(p=>p.order||0)) : 0)+1,
      active:true
    }),
    buildRow: (p, items, update, remove) => {
      const td = (...children) => el("td", {}, ...children);
      const catOptions = categories.map(c=>({value:c.id,label:c.name}));
      if (!catOptions.find(o=>o.value===p.categoryId)) catOptions.unshift({value:p.categoryId,label:p.categoryId});
      return el("tr", {className: p.active ? "" : "row-inactive"},
        td(numberCell(p.order, v=>update(p.id,{order:v}), {className:"cell-order"})),
        td(textCell(p.name, v=>update(p.id,{name:v}), {className:"cell-name"})),
        td(selectCell(p.categoryId, catOptions, v=>update(p.id,{categoryId:v}))),
        td(textCell(p.description||"", v=>update(p.id,{description:v}), {className:"cell-desc", placeholder:"Összetevők…"})),
        td(numberCell(p.price, v=>update(p.id,{price:v}), {className:"cell-price", min:"0"})),
        td(textCell(p.priceSuffix||"", v=>update(p.id,{priceSuffix:v}), {className:"cell-price", placeholder:"/adag"})),
        td(allergenCell(p.allergens, v=>update(p.id,{allergens:v}))),
        el("td",{className:"cell-checkbox"}, checkboxCell(p.active, v=>update(p.id,{active:v}))),
        el("td",{className:"cell-actions"}, deleteBtn(()=>{if(confirm(`Törlöd: "${p.name}"?`)) remove(p.id);}))
      );
    }
  });
}

// ── Categories page ──────────────────────────────────────────
function renderCategoriesPage(container) {
  collectionPage(container, "categories", "order", {
    title:"Kategóriák",
    subtitle:"A menü fő szekciói és megjelenési sorrendjük.",
    emptyMsg:"Még nincs kategória.",
    addLabel:"+ Új kategória",
    columns:[
      {label:"Sorrend",className:"cell-order"},
      {label:"Név",className:"cell-name"},
      {label:"Megjegyzés"},
      {label:"",className:"cell-actions"},
    ],
    newItem:(items)=>({name:"Új kategória",note:"",order:(items.length?Math.max(...items.map(c=>c.order||0)):0)+1}),
    buildRow:(c,_,update,remove)=>el("tr",{},
      el("td",{},numberCell(c.order,v=>update(c.id,{order:v}),{className:"cell-order"})),
      el("td",{},textCell(c.name,v=>update(c.id,{name:v}),{className:"cell-name"})),
      el("td",{},textCell(c.note||"",v=>update(c.id,{note:v}),{placeholder:"pl. 32 cm"})),
      el("td",{className:"cell-actions"},deleteBtn(()=>{if(confirm(`Törlöd: "${c.name}"?`))remove(c.id);}))
    )
  });
}

// ── Reviews page ─────────────────────────────────────────────
function renderReviewsPage(container) {
  collectionPage(container, "reviews", "order", {
    title:"Vélemények",
    subtitle:"Vendégvélemények a weboldal vélemények szekciójához.",
    emptyMsg:"Még nincs vélemény.",
    addLabel:"+ Új vélemény",
    columns:[
      {label:"Sorrend",className:"cell-order"},
      {label:"Név",className:"cell-name"},
      {label:"Szöveg",className:"cell-desc"},
      {label:"Ajánlja",className:"cell-checkbox"},
      {label:"Látható",className:"cell-checkbox"},
      {label:"",className:"cell-actions"},
    ],
    newItem:(items)=>({name:"Új vendég",text:"",recommends:true,visible:true,order:(items.length?Math.max(...items.map(r=>r.order||0)):0)+1}),
    buildRow:(r,_,update,remove)=>el("tr",{className:r.visible?"":"row-inactive"},
      el("td",{},numberCell(r.order,v=>update(r.id,{order:v}),{className:"cell-order"})),
      el("td",{},textCell(r.name,v=>update(r.id,{name:v}),{className:"cell-name"})),
      el("td",{},textCell(r.text,v=>update(r.id,{text:v}),{className:"cell-desc"})),
      el("td",{className:"cell-checkbox"},checkboxCell(r.recommends,v=>update(r.id,{recommends:v}))),
      el("td",{className:"cell-checkbox"},checkboxCell(r.visible,v=>update(r.id,{visible:v}))),
      el("td",{className:"cell-actions"},deleteBtn(()=>{if(confirm(`Törlöd: "${r.name}"?`))remove(r.id);}))
    )
  });
}

// ── Settings page ────────────────────────────────────────────
function renderSettingsPage(container) {
  container.append(el("div",{className:"page-head"},el("div",{},el("h1",{},"Beállítások"),el("p",{className:"page-sub"},"Elérhetőségek és nyitvatartás."))));

  // General settings
  container.append(el("h2",{style:{fontSize:"1rem",marginBottom:"0.75rem"}},"Elérhetőségek"));
  const genForm = el("div",{className:"form-grid"});
  const genStatus = el("span",{className:"save-status"});
  const genSaveBtn = el("button",{className:"btn btn-primary"},"Mentés");
  container.append(genForm, el("div",{className:"toolbar",style:{marginTop:"-0.5rem"}},genStatus,genSaveBtn));

  const GENERAL_FIELDS = [
    {key:"address",label:"Cím",placeholder:"Jókai Mór ltp. 9., Hajmáskér, 8192"},
    {key:"addressMapsUrl",label:"Google Maps link",placeholder:"https://maps.google.com/?q=..."},
    {key:"phone",label:"Telefonszám (hívható)",placeholder:"+36705846276"},
    {key:"phoneDisplay",label:"Telefonszám (megjelenített)",placeholder:"(70) 584 6276"},
    {key:"email",label:"Email",placeholder:"hajmaskerpizzeria@gmail.com",type:"email"},
    {key:"messengerUrl",label:"Messenger link",placeholder:"https://m.me/..."},
    {key:"heroPhotoUrl",label:"Főoldali fotó URL",placeholder:"https://…/pizza.jpg"},
  ];
  const genInputs = {};
  for (const f of GENERAL_FIELDS) {
    const inp = el("input",{id:`gen_${f.key}`,type:f.type||"text",placeholder:f.placeholder||""});
    genInputs[f.key] = inp;
    genForm.append(el("div",{className:"form-field"+(f.key==="heroPhotoUrl"?' style="grid-column:1/-1"':"")},
      el("label",{for:`gen_${f.key}`},f.label), inp));
  }

  let genData = {};
  const genUnsub = onSnapshot(doc(db,"settings","general"), snap=>{
    genData = snap.exists() ? snap.data() : {};
    for (const [k,inp] of Object.entries(genInputs)) inp.value = genData[k]||"";
  });
  unsubs.push(genUnsub);

  genSaveBtn.addEventListener("click", async ()=>{
    genStatus.className="save-status saving"; genStatus.textContent="Mentés…";
    const patch = {};
    for (const [k,inp] of Object.entries(genInputs)) patch[k]=inp.value;
    try {
      await setDoc(doc(db,"settings","general"), patch, {merge:true});
      genStatus.className="save-status saved"; genStatus.textContent="✓ Elmentve";
      setTimeout(()=>{genStatus.className="save-status";genStatus.textContent="";},1800);
    } catch(e){
      genStatus.className="save-status error"; genStatus.textContent="Hiba: "+e.message;
    }
  });

  // Hours settings
  container.append(el("h2",{style:{fontSize:"1rem",margin:"2rem 0 0.75rem"}},"Nyitvatartás"));
  const hoursGrid = el("div",{className:"form-grid",style:{gridTemplateColumns:"1fr",maxWidth:"560px"}});
  const hoursStatus = el("span",{className:"save-status"});
  const hoursSaveBtn = el("button",{className:"btn btn-primary"},"Mentés");
  container.append(hoursGrid, el("div",{className:"toolbar",style:{marginTop:"-0.5rem"}},hoursStatus,hoursSaveBtn));

  const dayInputs = {};
  for (const day of DAY_KEYS) {
    const openInp = el("input",{type:"time"});
    const closeInp = el("input",{type:"time"});
    const closedChk = el("input",{type:"checkbox"});
    dayInputs[day] = {open:openInp, close:closeInp, closed:closedChk};

    closedChk.addEventListener("change",()=>{
      openInp.style.display = closedChk.checked?"none":"";
      closeInp.style.display = closedChk.checked?"none":"";
    });

    const row = el("div",{className:"hours-row"},
      el("span",{className:"hours-day-label"},DAY_LABELS[day]),
      openInp, closeInp,
      el("label",{className:"hours-closed-toggle"},closedChk,"Zárva")
    );
    hoursGrid.append(row);
  }

  const hoursUnsub = onSnapshot(doc(db,"settings","hours"), snap=>{
    const data = snap.exists() ? snap.data() : {};
    for (const day of DAY_KEYS) {
      const d = data[day]||{};
      const {open,close,closed} = dayInputs[day];
      open.value = d.open||"";
      close.value = d.close||"";
      closed.checked = !!d.closed;
      open.style.display = d.closed?"none":"";
      close.style.display = d.closed?"none":"";
    }
  });
  unsubs.push(hoursUnsub);

  hoursSaveBtn.addEventListener("click", async ()=>{
    hoursStatus.className="save-status saving"; hoursStatus.textContent="Mentés…";
    const patch = {};
    for (const day of DAY_KEYS) {
      const {open,close,closed} = dayInputs[day];
      patch[day]={open:open.value,close:close.value,closed:closed.checked};
    }
    try {
      await setDoc(doc(db,"settings","hours"), patch, {merge:true});
      hoursStatus.className="save-status saved"; hoursStatus.textContent="✓ Elmentve";
      setTimeout(()=>{hoursStatus.className="save-status";hoursStatus.textContent="";},1800);
    } catch(e){
      hoursStatus.className="save-status error"; hoursStatus.textContent="Hiba: "+e.message;
    }
  });
}
