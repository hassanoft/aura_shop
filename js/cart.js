/* ==========================================================================
   AURA SHOP — Module Panier
   Stockage local (localStorage) + rendu du drawer + commande WhatsApp
   ========================================================================== */

const CART_KEY = "aura_shop_cart";
let shopSettingsCache = null; // rempli par settings.js -> loadShopSettings()

const Cart = {
  /** Lit le panier depuis le localStorage */
  get() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Erreur lecture panier :", e);
      return [];
    }
  },

  /** Sauvegarde le panier dans le localStorage */
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    Cart.render();
  },

  /** Ajoute un produit au panier (ou augmente la quantité s'il existe déjà) */
  add(product, qty = 1) {
    const items = Cart.get();
    const existing = items.find(i => i.id === product.id);
    const maxStock = product.stock ?? 9999;

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, maxStock);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: (product.images && product.images[0]) || "",
        stock: maxStock,
        qty: Math.min(qty, maxStock)
      });
    }
    Cart.save(items);
    showToast(`${product.name} ajouté au panier`, "success");
  },

  /** Modifie la quantité d'un article (delta = +1 ou -1) */
  updateQty(id, delta) {
    const items = Cart.get();
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      Cart.remove(id);
      return;
    }
    if (item.stock && item.qty > item.stock) item.qty = item.stock;
    Cart.save(items);
  },

  /** Supprime un article du panier */
  remove(id) {
    const items = Cart.get().filter(i => i.id !== id);
    Cart.save(items);
    showToast("Produit retiré du panier", "info");
  },

  /** Vide entièrement le panier */
  clear() {
    localStorage.removeItem(CART_KEY);
    Cart.updateBadge();
    Cart.render();
  },

  /** Nombre total d'articles (somme des quantités) */
  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },

  /** Montant total du panier */
  total() {
    return Cart.get().reduce((sum, i) => sum + i.qty * i.price, 0);
  },

  /** Met à jour le badge numérique sur l'icône panier */
  updateBadge() {
    const badges = document.querySelectorAll(".cart-badge");
    const count = Cart.count();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? "flex" : "none";
    });
  },

  /** Ouvre le tiroir panier */
  open() {
    document.querySelector(".cart-drawer")?.classList.add("open");
    document.querySelector(".cart-overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
    Cart.render();
  },

  /** Ferme le tiroir panier */
  close() {
    document.querySelector(".cart-drawer")?.classList.remove("open");
    document.querySelector(".cart-overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  },

  /** Affiche le contenu du panier dans le drawer */
  render() {
    const container = document.querySelector(".cart-items");
    const footer = document.querySelector(".cart-footer");
    if (!container) return;

    const items = Cart.get();
    const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Votre panier est vide</p>
        </div>`;
      if (footer) footer.style.display = "none";
      return;
    }

    if (footer) footer.style.display = "block";

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${getPublicImage(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
        <div class="ci-info">
          <div class="ci-name">${escapeHTML(item.name)}</div>
          <div class="ci-price">${formatPrice(item.price, currency)} / unité</div>
          <div class="ci-bottom">
            <div class="ci-qty">
              <button aria-label="Diminuer" data-action="dec" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button aria-label="Augmenter" data-action="inc" data-id="${item.id}">+</button>
            </div>
            <div class="ci-subtotal">${formatPrice(item.price * item.qty, currency)}</div>
          </div>
        </div>
        <button class="ci-remove" data-action="remove" data-id="${item.id}" aria-label="Supprimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
        </button>
      </div>
    `).join("");

    const totalItemsEl = document.querySelector("#cart-total-items");
    const totalPriceEl = document.querySelector("#cart-total-price");
    if (totalItemsEl) totalItemsEl.textContent = Cart.count();
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(Cart.total(), currency);
  },

  /** Construit le message WhatsApp formaté et ouvre WhatsApp */
  sendToWhatsApp(customer) {
    const items = Cart.get();
    if (items.length === 0) return;

    const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";
    const waNumber = (shopSettingsCache && shopSettingsCache.whatsapp_number) || DEFAULT_WHATSAPP_NUMBER;

    let msg = "🛒 Nouvelle commande\n\n";
    msg += "👋 Bonjour, je souhaite commander les articles suivants :\n\n";
    msg += "━━━━━━━━━━━━━━\n\n";

    items.forEach(item => {
      msg += `📦 ${item.name}\n`;
      msg += `💰 ${formatPrice(item.price, currency)}\n`;
      msg += `📦 Quantité : ${item.qty}\n`;
      msg += `💵 Sous-total : ${formatPrice(item.price * item.qty, currency)}\n\n`;
      msg += "━━━━━━━━━━━━━━\n\n";
    });

    msg += "🧾 Récapitulatif\n\n";
    msg += `🛍️ Nombre total d'articles : ${Cart.count()}\n`;
    msg += `💵 Total à payer : ${formatPrice(Cart.total(), currency)}\n\n`;
    msg += "━━━━━━━━━━━━━━\n\n";
    msg += `👤 Nom : ${customer.name}\n`;
    msg += `📞 Téléphone : ${customer.phone}\n`;
    msg += `📍 Adresse : ${customer.address}\n`;
    if (customer.gps) {
      msg += `🗺️ Position GPS : https://maps.google.com/?q=${customer.gps.lat},${customer.gps.lng}\n`;
    }
    msg += `📝 Commentaire : ${customer.comment || "Aucun"}\n\n`;
    msg += "Merci.";

    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${waNumber}?text=${encoded}`;
    window.open(url, "_blank");
  }
};

/* --------------------------------------------------------------------------
   VALIDATION DES CHAMPS DU FORMULAIRE DE COMMANDE
   -------------------------------------------------------------------------- */

/** Vérifie que le nom saisi contient bien un nom ET un prénom (2 mots minimum) */
function isValidFullName(name) {
  const cleaned = name.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(" ").filter(Boolean);
  const onlyLetters = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/;
  return parts.length >= 2 && parts.every(p => p.length >= 2 && onlyLetters.test(p));
}

/** Vérifie que le numéro de téléphone respecte un format ivoirien valide (10 chiffres commençant par 0, avec préfixe +225 optionnel) */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s.\-()]/g, "");
  return /^(\+225|00225)?0\d{9}$/.test(cleaned);
}

/* --------------------------------------------------------------------------
   CAPTURE DE LA POSITION GPS (obligatoire pour la livraison)
   -------------------------------------------------------------------------- */
let capturedGPS = null;

function captureGPSLocation() {
  const btn = document.querySelector("#capture-gps-btn");
  const status = document.querySelector("#gps-status");
  if (!btn || !status) return;

  if (!("geolocation" in navigator)) {
    status.className = "gps-status error";
    status.textContent = "La géolocalisation n'est pas prise en charge par votre navigateur.";
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Localisation en cours...';
  status.className = "gps-status";
  status.textContent = "";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      capturedGPS = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) };
      document.querySelector("#cf-lat").value = capturedGPS.lat;
      document.querySelector("#cf-lng").value = capturedGPS.lng;

      status.className = "gps-status success";
      status.innerHTML = `Position GPS capturée avec succès
        <a href="https://maps.google.com/?q=${capturedGPS.lat},${capturedGPS.lng}" target="_blank" rel="noopener">Voir sur la carte</a>`;

      document.querySelector("#gps-group")?.classList.remove("invalid");
      btn.disabled = false;
      btn.textContent = "Actualiser ma position GPS";
    },
    () => {
      status.className = "gps-status error";
      status.textContent = "Impossible d'obtenir votre position. Autorisez la géolocalisation puis réessayez.";
      btn.disabled = false;
      btn.textContent = "Partager ma position GPS";
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

/* --------------------------------------------------------------------------
   Initialisation des évènements du panier (drawer + checkout)
   -------------------------------------------------------------------------- */
function initCart() {
  Cart.updateBadge();
  Cart.render();

  // Ouverture / fermeture du drawer
  document.querySelectorAll("[data-open-cart]").forEach(btn => btn.addEventListener("click", Cart.open));
  document.querySelector(".cart-close")?.addEventListener("click", Cart.close);
  document.querySelector(".cart-overlay")?.addEventListener("click", Cart.close);

  // Délégation d'évènements sur les articles du panier (+ / - / suppression)
  document.querySelector(".cart-items")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "inc") Cart.updateQty(id, 1);
    if (action === "dec") Cart.updateQty(id, -1);
    if (action === "remove") Cart.remove(id);
  });

  // Ouverture de la modale de commande
  document.querySelector("#open-checkout")?.addEventListener("click", () => {
    if (Cart.get().length === 0) {
      showToast("Votre panier est vide", "error");
      return;
    }
    document.querySelector("#checkout-modal")?.classList.add("open");
  });

  // Fermeture de la modale
  document.querySelectorAll("[data-close-checkout]").forEach(btn => {
    btn.addEventListener("click", () => document.querySelector("#checkout-modal")?.classList.remove("open"));
  });

  // Bouton de capture GPS
  document.querySelector("#capture-gps-btn")?.addEventListener("click", captureGPSLocation);

  // Soumission du formulaire de commande
  const form = document.querySelector("#checkout-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#cf-name").value.trim();
      const phone = form.querySelector("#cf-phone").value.trim();
      const address = form.querySelector("#cf-address").value.trim();
      const comment = form.querySelector("#cf-comment").value.trim();

      let valid = true;

      const nameGroup = form.querySelector("#cf-name").closest(".form-group");
      if (!isValidFullName(name)) { nameGroup.classList.add("invalid"); valid = false; }
      else nameGroup.classList.remove("invalid");

      const phoneGroup = form.querySelector("#cf-phone").closest(".form-group");
      if (!isValidPhone(phone)) { phoneGroup.classList.add("invalid"); valid = false; }
      else phoneGroup.classList.remove("invalid");

      const addressGroup = form.querySelector("#cf-address").closest(".form-group");
      if (!address) { addressGroup.classList.add("invalid"); valid = false; }
      else addressGroup.classList.remove("invalid");

      const gpsGroup = document.querySelector("#gps-group");
      if (!capturedGPS) { gpsGroup.classList.add("invalid"); valid = false; }
      else gpsGroup.classList.remove("invalid");

      if (!valid) {
        showToast("Merci de corriger les champs signalés en rouge", "error");
        return;
      }

      Cart.sendToWhatsApp({ name, phone, address, comment, gps: capturedGPS });
      document.querySelector("#checkout-modal")?.classList.remove("open");
      showToast("Commande envoyée sur WhatsApp !", "success");
      form.reset();
      form.querySelectorAll(".form-group").forEach(g => g.classList.remove("invalid"));

      // Réinitialise l'état de la capture GPS pour une prochaine commande
      capturedGPS = null;
      const gpsStatus = document.querySelector("#gps-status");
      const gpsBtn = document.querySelector("#capture-gps-btn");
      if (gpsStatus) { gpsStatus.className = "gps-status"; gpsStatus.textContent = ""; }
      if (gpsBtn) gpsBtn.textContent = "Partager ma position GPS";
    });
  }
}

document.addEventListener("DOMContentLoaded", initCart);
