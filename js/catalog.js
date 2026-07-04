/* ==========================================================================
   AURA SHOP — Page catalogue (produits.html)
   ========================================================================== */

const PAGE_SIZE = 12;
let currentPage = 1;
let currentFilters = {};

function readFiltersFromURL() {
  return {
    categoryId: getQueryParam("cat") || "",
    search: getQueryParam("q") || "",
    featured: getQueryParam("featured") === "1",
    promo: getQueryParam("promo") === "1"
  };
}

function renderCategoryFilters(categories, selectedId) {
  const box = document.querySelector("#cat-filters");
  if (!box) return;
  const allOption = `<label class="filter-option"><input type="radio" name="cat" value="" ${!selectedId ? "checked" : ""}> Toutes les catégories</label>`;
  const options = categories.map(c => `
    <label class="filter-option">
      <input type="radio" name="cat" value="${c.id}" ${selectedId === c.id ? "checked" : ""}> ${escapeHTML(c.name)}
    </label>`).join("");
  box.innerHTML = allOption + options;
}

function renderPagination(totalCount) {
  const box = document.querySelector("#pagination");
  if (!box) return;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (totalPages <= 1) { box.innerHTML = ""; return; }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button data-page="${i}" class="${i === currentPage ? "active" : ""}">${i}</button>`;
  }
  box.innerHTML = html;
  box.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = Number(btn.dataset.page);
      loadCatalogProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function loadCatalogProducts() {
  const grid = document.querySelector("#products-grid");
  const countEl = document.querySelector("#results-count");
  const sort = document.querySelector("#sort-select")?.value || "newest";

  const options = {
    ...currentFilters,
    sort,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE
  };

  const { data, count } = await fetchProducts(options);
  renderProductGrid(grid, data);
  if (countEl) countEl.textContent = `${count} produit${count > 1 ? "s" : ""} trouvé${count > 1 ? "s" : ""}`;
  renderPagination(count);
}

function initFiltersPanel(categories) {
  renderCategoryFilters(categories, currentFilters.categoryId);

  document.querySelector("#filter-featured").checked = !!currentFilters.featured;
  document.querySelector("#filter-promo").checked = !!currentFilters.promo;
  if (currentFilters.minPrice) document.querySelector("#min-price").value = currentFilters.minPrice;
  if (currentFilters.maxPrice) document.querySelector("#max-price").value = currentFilters.maxPrice;

  document.querySelector("#apply-filters").addEventListener("click", () => {
    const selectedCat = document.querySelector('input[name="cat"]:checked')?.value || "";
    currentFilters.categoryId = selectedCat || undefined;
    currentFilters.minPrice = document.querySelector("#min-price").value || undefined;
    currentFilters.maxPrice = document.querySelector("#max-price").value || undefined;
    currentFilters.featured = document.querySelector("#filter-featured").checked || undefined;
    currentFilters.promo = document.querySelector("#filter-promo").checked || undefined;
    currentPage = 1;
    loadCatalogProducts();
    closeMobileFilters();
  });

  document.querySelector("#sort-select").addEventListener("change", () => {
    currentPage = 1;
    loadCatalogProducts();
  });
}

function openMobileFilters() {
  document.querySelector("#filters-panel")?.classList.add("open");
  document.querySelector(".filters-overlay")?.classList.add("open");
}
function closeMobileFilters() {
  document.querySelector("#filters-panel")?.classList.remove("open");
  document.querySelector(".filters-overlay")?.classList.remove("open");
}

async function initCatalogPage() {
  await loadShopSettings();
  renderFooter();

  currentFilters = readFiltersFromURL();

  const categories = await fetchCategories();
  initFiltersPanel(categories);

  // Titre dynamique selon les filtres actifs
  const titleEl = document.querySelector(".catalog-header h1");
  if (currentFilters.featured && titleEl) titleEl.textContent = "Produits vedettes";
  else if (currentFilters.promo && titleEl) titleEl.textContent = "Nos promotions";
  else if (currentFilters.search && titleEl) titleEl.textContent = `Résultats pour "${currentFilters.search}"`;
  else if (currentFilters.categoryId && titleEl) {
    const cat = categories.find(c => c.id === currentFilters.categoryId);
    if (cat) titleEl.textContent = cat.name;
  }
  if (currentFilters.search) document.querySelector("#global-search").value = currentFilters.search;

  await loadCatalogProducts();

  document.querySelector("#open-filters-mobile")?.addEventListener("click", openMobileFilters);
  document.querySelector("#close-filters-mobile")?.addEventListener("click", closeMobileFilters);
  document.querySelector(".filters-overlay")?.addEventListener("click", closeMobileFilters);

  initScrollUI();
  initMobileNav();
  hidePageLoader();
}

document.addEventListener("DOMContentLoaded", initCatalogPage);
