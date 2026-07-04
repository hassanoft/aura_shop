/* ==========================================================================
   AURA SHOP — Utilitaires génériques
   ========================================================================== */

/** Formate un nombre en devise (FCFA par défaut) */
function formatPrice(amount, currency = "FCFA") {
  const n = Number(amount) || 0;
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ") + " " + currency;
}

/** Echappe le HTML pour éviter les injections lors de l'affichage de texte utilisateur */
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Génère un slug URL-friendly */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Récupère l'URL publique d'une image stockée dans Supabase Storage, ou une image de remplacement */
function getPublicImage(url, fallback = "assets/images/placeholder.svg") {
  return url && url.trim() !== "" ? url : fallback;
}

/** Debounce : retarde l'exécution d'une fonction (utile pour la recherche instantanée) */
function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}

/* --------------------------------------------------------------------------
   TOASTS
   -------------------------------------------------------------------------- */
function ensureToastWrap() {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  return wrap;
}

const TOAST_ICONS = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

/** Affiche une notification toast temporaire */
function showToast(message, type = "success", duration = 2800) {
  const wrap = ensureToastWrap();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.info}<span>${escapeHTML(message)}</span>`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* --------------------------------------------------------------------------
   LAZY LOADING DES IMAGES
   -------------------------------------------------------------------------- */
function initLazyLoading(root = document) {
  const images = root.querySelectorAll("img.lazy[data-src]");
  if (!("IntersectionObserver" in window)) {
    images.forEach(img => { img.src = img.dataset.src; img.classList.add("loaded"); });
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => img.classList.add("loaded");
        obs.unobserve(img);
      }
    });
  }, { rootMargin: "150px" });
  images.forEach(img => observer.observe(img));
}

/* --------------------------------------------------------------------------
   ANIMATIONS AU SCROLL (reveal)
   -------------------------------------------------------------------------- */
function initScrollReveal(root = document) {
  const els = root.querySelectorAll(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   BOUTON RETOUR EN HAUT + HEADER AU SCROLL
   -------------------------------------------------------------------------- */
function initScrollUI() {
  const backBtn = document.querySelector(".back-to-top");
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (backBtn) backBtn.classList.toggle("show", y > 420);
    if (header) header.classList.toggle("scrolled", y > 10);
  }, { passive: true });
  if (backBtn) {
    backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

/* --------------------------------------------------------------------------
   MENU MOBILE
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".mobile-nav");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const closeBtn = document.querySelector(".mn-close");
  if (!burger || !nav || !overlay) return;
  const open = () => { nav.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; };
  const close = () => { nav.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; };
  burger.addEventListener("click", open);
  overlay.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);
}

/* --------------------------------------------------------------------------
   MASQUER LE LOADER DE PAGE
   -------------------------------------------------------------------------- */
function hidePageLoader() {
  const loader = document.querySelector(".page-loader");
  if (loader) setTimeout(() => loader.classList.add("hidden"), 250);
}

/** Récupère un paramètre de l'URL */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
