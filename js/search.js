/* ==========================================================================
   AURA SHOP — Recherche instantanée (header)
   ========================================================================== */

async function performLiveSearch(term) {
  const resultsBox = document.querySelector("#search-results");
  if (!resultsBox) return;

  if (!term || term.trim().length < 2) {
    resultsBox.classList.remove("show");
    resultsBox.innerHTML = "";
    return;
  }

  const { data } = await fetchProducts({ search: term.trim(), limit: 6 });
  const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";

  if (!data || data.length === 0) {
    resultsBox.innerHTML = `<div class="search-empty">Aucun résultat pour "${escapeHTML(term)}"</div>`;
  } else {
    resultsBox.innerHTML = data.map(p => `
      <a class="search-item" href="produit.html?id=${p.id}">
        <img src="${getPublicImage(p.images && p.images[0])}" alt="${escapeHTML(p.name)}">
        <div>
          <div class="si-name">${escapeHTML(p.name)}</div>
          <div class="si-price">${formatPrice(p.price, currency)}</div>
        </div>
      </a>
    `).join("");
  }
  resultsBox.classList.add("show");
}

function initSearch() {
  const input = document.querySelector("#global-search");
  if (!input) return;
  const debounced = debounce((val) => performLiveSearch(val), 350);

  input.addEventListener("input", (e) => debounced(e.target.value));
  input.addEventListener("focus", () => { if (input.value.length >= 2) document.querySelector("#search-results")?.classList.add("show"); });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search")) {
      document.querySelector("#search-results")?.classList.remove("show");
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.location.href = `produits.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", initSearch);
