/* ==========================================================================
   AURA SHOP — Footer commun (injecté en JS pour rester DRY sur toutes les pages)
   ========================================================================== */

function renderFooter() {
  const el = document.querySelector("#site-footer");
  if (!el) return;
  const year = new Date().getFullYear();

  el.innerHTML = `
    <div class="container footer-top">
      <div class="footer-brand">
        <a href="index.html" class="brand">
          <img src="assets/images/logo.jpg" alt="AURA SHOP" style="width:40px;height:40px;border-radius:10px;">
          <span data-shop-name>AURA SHOP</span>
        </a>
        <p data-shop-desc>Votre boutique en ligne de confiance. Qualité, rapidité et service client au cœur de notre engagement.</p>
        <div class="footer-social">
          <a href="#" data-fb-link target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.98A10 10 0 0 0 22 12z"/></svg></a>
          <a href="#" data-ig-link target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg></a>
          <a href="https://wa.me/2250500525480" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.98.58 3.83 1.58 5.39L2 22l4.76-1.55A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Navigation</h5>
        <ul>
          <li><a href="index.html">Accueil</a></li>
          <li><a href="produits.html">Tous les produits</a></li>
          <li><a href="produits.html?featured=1">Produits vedettes</a></li>
          <li><a href="produits.html?promo=1">Promotions</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Catégories</h5>
        <ul id="footer-categories">
          <li><a href="produits.html">Toutes les catégories</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Contact</h5>
        <ul class="footer-contact">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .95.68l1.5 4.5a1 1 0 0 1-.5 1.21l-2.1 1.05a11.05 11.05 0 0 0 5.4 5.4l1.05-2.1a1 1 0 0 1 1.21-.5l4.5 1.5a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.72 21 3 14.28 3 6V5z"/></svg>
            <span>+225 05 00 52 54 80</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span data-shop-address>Abidjan, Côte d'Ivoire</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><path d="M2 6h20v12H2z"/></svg>
            <span data-shop-email>contact@aurashop.ci</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${year} <span data-shop-name>AURA SHOP</span>. Tous droits réservés.</span>
      <span>Fait avec soin en Côte d'Ivoire 🇨🇮</span>
    </div>
  `;

  // Remplit les catégories du footer si déjà en cache, sinon les charge
  fetchCategories().then(cats => {
    const list = document.querySelector("#footer-categories");
    if (list && cats.length) {
      list.innerHTML = cats.slice(0, 5).map(c => `<li><a href="produits.html?cat=${c.id}">${escapeHTML(c.name)}</a></li>`).join("");
    }
  });

  if (shopSettingsCache) applyShopSettings(shopSettingsCache);
}
