import { initMenu } from "./menu.js";
import { initInfo } from "./info.js";

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initHeaderScrollState() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px rgba(0,0,0,0.25)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setFooterYear() {
  const node = document.getElementById("footer-year");
  if (node) node.textContent = String(new Date().getFullYear());
}

function init() {
  initMobileNav();
  initHeaderScrollState();
  setFooterYear();
  initMenu();
  initInfo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
