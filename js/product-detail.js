/* ==========================================================================
   AURA SHOP — Page détail produit (produit.html)
   ========================================================================== */

let currentProduct = null;
let selectedQty = 1;

function renderProductDetail(product) {
  const wrap = document.querySelector("#product-detail-wrap");
  const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";
  const images = (product.images && product.images.length) ? product.images : [""];
  const outOfStock = !product.stock || product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const catName = getCategoryName(product.category_id);
  const discount = product.old_price ? Math.round(100 - (product.price / product.old_price) * 100) : 0;

  document.title = `${product.name} — AURA SHOP`;
  document.querySelector("#breadcrumb-name").textContent = product.name;

  wrap.innerHTML = `
    <div class="product-detail">
      <div class="pd-gallery">
        <div class="pd-main-img">
          <img id="pd-main-image" src="${getPublicImage(images[0])}" alt="${escapeHTML(product.name)}">
        </div>
        ${images.length > 1 ? `
        <div class="pd-thumbs">
          ${images.map((img, i) => `
            <button data-img="${getPublicImage(img)}" class="${i === 0 ? "active" : ""}">
              <img src="${getPublicImage(img)}" alt="Aperçu ${i + 1}">
            </button>`).join("")}
        </div>` : ""}
      </div>

      <div class="pd-info">
        ${catName ? `<span class="pd-cat">${escapeHTML(catName)}</span>` : ""}
        <h1>${escapeHTML(product.name)}</h1>

        <div class="pd-price-block">
          <span class="pd-price">${formatPrice(product.price, currency)}</span>
          ${product.old_price ? `<span class="pd-old-price">${formatPrice(product.old_price, currency)}</span>` : ""}
          ${discount > 0 ? `<span class="pd-save">-${discount}%</span>` : ""}
        </div>

        <div class="pd-stock ${outOfStock ? "out" : lowStock ? "low" : ""}">
          <span class="dot"></span>
          <span>${outOfStock ? "Rupture de stock" : lowStock ? `Plus que ${product.stock} en stock` : "En stock"}</span>
        </div>

        <p class="pd-desc">${escapeHTML(product.description || "Aucune description disponible pour ce produit.")}</p>

        ${!outOfStock ? `
        <div class="qty-selector">
          <button id="qty-dec" aria-label="Diminuer">−</button>
          <span id="qty-value">1</span>
          <button id="qty-inc" aria-label="Augmenter">+</button>
        </div>` : ""}

        <div class="pd-actions">
          <button class="btn btn-dark" id="pd-add-cart" ${outOfStock ? "disabled" : ""}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            ${outOfStock ? "Produit épuisé" : "Ajouter au panier"}
          </button>
          <button class="btn btn-accent" id="pd-buy-now" ${outOfStock ? "disabled" : ""}>Commander maintenant</button>
        </div>

        <div class="pd-meta">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Livraison rapide sous 24 à 72h</div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Paiement à la livraison disponible</div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.98.58 3.83 1.58 5.39L2 22l4.76-1.55A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg> Commande facile via WhatsApp</div>
        </div>
      </div>
    </div>
  `;

  // Galerie : miniatures
  wrap.querySelectorAll(".pd-thumbs button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector("#pd-main-image").src = btn.dataset.img;
      wrap.querySelectorAll(".pd-thumbs button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Sélecteur de quantité
  selectedQty = 1;
  const qtyValue = document.querySelector("#qty-value");
  document.querySelector("#qty-inc")?.addEventListener("click", () => {
    if (selectedQty < (product.stock || 99)) { selectedQty++; qtyValue.textContent = selectedQty; }
  });
  document.querySelector("#qty-dec")?.addEventListener("click", () => {
    if (selectedQty > 1) { selectedQty--; qtyValue.textContent = selectedQty; }
  });

  // Ajout au panier
  document.querySelector("#pd-add-cart")?.addEventListener("click", () => Cart.add(product, selectedQty));
  document.querySelector("#pd-buy-now")?.addEventListener("click", () => {
    Cart.add(product, selectedQty);
    Cart.open();
  });
}

async function loadRelatedProducts(product) {
  const related = await fetchRelatedProducts(product.category_id, product.id, 4);
  const section = document.querySelector("#related-section");
  if (related.length === 0) { section.style.display = "none"; return; }
  section.style.display = "block";
  renderProductGrid(document.querySelector("#related-grid"), related);
}

async function initProductDetailPage() {
  await loadShopSettings();
  await fetchCategories();
  renderFooter();

  const id = getQueryParam("id");
  if (!id) {
    document.querySelector("#product-detail-wrap").innerHTML = `<div class="empty-state"><h3>Produit introuvable</h3><p>Aucun identifiant de produit fourni.</p></div>`;
    hidePageLoader();
    return;
  }

  const product = await fetchProductById(id);
  if (!product) {
    document.querySelector("#product-detail-wrap").innerHTML = `<div class="empty-state"><h3>Produit introuvable</h3><p>Ce produit n'existe plus ou a été retiré de la boutique.</p><a href="produits.html" class="btn btn-primary" style="margin-top:16px;">Voir tous les produits</a></div>`;
    hidePageLoader();
    return;
  }

  currentProduct = product;
  renderProductDetail(product);
  incrementProductViews(product.id, product.views);
  loadRelatedProducts(product);

  initScrollUI();
  initMobileNav();
  hidePageLoader();
}

document.addEventListener("DOMContentLoaded", initProductDetailPage);
