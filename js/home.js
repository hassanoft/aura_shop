/* ==========================================================================
   AURA SHOP — Page d'accueil
   ========================================================================== */

function renderBannerSlider(banners) {
  const wrap = document.querySelector("#banner-slider-wrap");
  if (!wrap) return;
  if (!banners || banners.length === 0) { wrap.innerHTML = ""; return; }

  wrap.innerHTML = `
    <div class="banner-slider reveal">
      ${banners.map((b, i) => `
        <div class="banner-slide ${i === 0 ? "active" : ""}" data-index="${i}">
          <img src="${getPublicImage(b.image_url)}" alt="${escapeHTML(b.title || "Bannière")}">
          <div class="bs-content">
            ${b.title ? `<h3>${escapeHTML(b.title)}</h3>` : ""}
            ${b.subtitle ? `<p>${escapeHTML(b.subtitle)}</p>` : ""}
            ${b.link_url ? `<a href="${escapeHTML(b.link_url)}" class="btn btn-primary">${escapeHTML(b.button_text || "Découvrir")}</a>` : ""}
          </div>
        </div>
      `).join("")}
      ${banners.length > 1 ? `<div class="banner-dots">${banners.map((_, i) => `<button data-dot="${i}" class="${i === 0 ? "active" : ""}"></button>`).join("")}</div>` : ""}
    </div>`;

  if (banners.length > 1) {
    let current = 0;
    const slides = wrap.querySelectorAll(".banner-slide");
    const dots = wrap.querySelectorAll(".banner-dots button");
    const goTo = (idx) => {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = idx;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    };
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
    setInterval(() => goTo((current + 1) % slides.length), 5000);
  }
}

function renderCategoriesGrid(categories) {
  const grid = document.querySelector("#categories-grid");
  if (!grid) return;
  if (!categories || categories.length === 0) {
    grid.innerHTML = `<p style="color:var(--gray-500);grid-column:1/-1;">Aucune catégorie disponible pour le moment.</p>`;
    return;
  }
  grid.innerHTML = categories.map(cat => `
    <a href="produits.html?cat=${cat.id}" class="cat-card reveal">
      <div class="cat-ico">
        ${cat.image_url ? `<img src="${cat.image_url}" alt="${escapeHTML(cat.name)}">` : `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--primary)"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`}
      </div>
      <span>${escapeHTML(cat.name)}</span>
    </a>
  `).join("");
  initScrollReveal(grid);
}

function renderHeroHighlight(product) {
  const card = document.querySelector("#hero-highlight-card");
  if (!card || !product) return;
  const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";
  card.innerHTML = `
    <img src="${getPublicImage(product.images && product.images[0])}" alt="${escapeHTML(product.name)}">
    <div class="hc-name">${escapeHTML(product.name)}</div>
    <div class="hc-price">${formatPrice(product.price, currency)}</div>
  `;
}

async function initHomePage() {
  await loadShopSettings();
  renderFooter();

  const [categories, banners, featuredRes, newRes] = await Promise.all([
    fetchCategories(),
    fetchBanners(),
    fetchProducts({ featured: true, limit: 8 }),
    fetchProducts({ limit: 8 })
  ]);

  renderCategoriesGrid(categories);
  renderBannerSlider(banners);
  renderProductGrid(document.querySelector("#featured-grid"), featuredRes.data.length ? featuredRes.data : newRes.data.slice(0, 4));
  renderProductGrid(document.querySelector("#new-grid"), newRes.data);

  if (newRes.data.length) renderHeroHighlight(newRes.data[0]);

  initScrollUI();
  initMobileNav();
  hidePageLoader();
}

document.addEventListener("DOMContentLoaded", initHomePage);
