/* ==========================================================================
   AURA SHOP — Accès aux données (Supabase) : produits / catégories / bannières
   ========================================================================== */

let categoriesCache = [];

/** Récupère toutes les catégories actives */
async function fetchCategories() {
  if (categoriesCache.length) return categoriesCache;
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });
  if (error) { console.error(error); return []; }
  categoriesCache = data || [];
  return categoriesCache;
}

/** Retrouve le nom d'une catégorie à partir de son id (utilise le cache) */
function getCategoryName(categoryId) {
  const cat = categoriesCache.find(c => c.id === categoryId);
  return cat ? cat.name : "";
}

/**
 * Récupère une liste de produits actifs avec filtres optionnels
 * options: { categoryId, search, minPrice, maxPrice, featured, promo, sort, limit, offset }
 */
async function fetchProducts(options = {}) {
  let query = supabaseClient.from("products").select("*", { count: "exact" }).eq("is_active", true);

  if (options.categoryId) query = query.eq("category_id", options.categoryId);
  if (options.search) query = query.ilike("name", `%${options.search}%`);
  if (options.minPrice !== undefined && options.minPrice !== null && options.minPrice !== "") query = query.gte("price", options.minPrice);
  if (options.maxPrice !== undefined && options.maxPrice !== null && options.maxPrice !== "") query = query.lte("price", options.maxPrice);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.promo) query = query.eq("is_promo", true);

  switch (options.sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "name_asc": query = query.order("name", { ascending: true }); break;
    case "oldest": query = query.order("created_at", { ascending: true }); break;
    default: query = query.order("created_at", { ascending: false }); break;
  }

  if (options.limit) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) { console.error(error); return { data: [], count: 0 }; }
  return { data: data || [], count: count || 0 };
}

/** Récupère un produit par son identifiant */
async function fetchProductById(id) {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

/** Récupère des produits similaires (même catégorie, en excluant le produit courant) */
async function fetchRelatedProducts(categoryId, excludeId, limit = 4) {
  if (!categoryId) return [];
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}

/** Récupère les bannières actives, triées par position */
async function fetchBanners() {
  const { data, error } = await supabaseClient
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });
  if (error) { console.error(error); return []; }
  return data || [];
}

/** Incrémente le compteur de vues d'un produit (best-effort, silencieux en cas d'erreur) */
async function incrementProductViews(id, currentViews) {
  try {
    await supabaseClient.from("products").update({ views: (currentViews || 0) + 1 }).eq("id", id);
  } catch (e) { /* silencieux */ }
}

/* --------------------------------------------------------------------------
   RENDU DES CARTES PRODUIT
   -------------------------------------------------------------------------- */

/** Génère le HTML d'une carte produit */
function renderProductCard(product) {
  const currency = (shopSettingsCache && shopSettingsCache.currency) || "FCFA";
  const image = getPublicImage(product.images && product.images[0]);
  const outOfStock = !product.stock || product.stock <= 0;
  const catName = getCategoryName(product.category_id);

  let badges = "";
  if (product.is_promo && product.old_price) badges += `<span class="badge badge-promo">-${Math.round(100 - (product.price / product.old_price) * 100)}%</span>`;
  if (product.is_featured) badges += `<span class="badge badge-featured">Vedette</span>`;
  if (outOfStock) badges += `<span class="badge badge-outofstock">Épuisé</span>`;

  return `
    <div class="product-card reveal" data-id="${product.id}">
      <a href="produit.html?id=${product.id}" class="pc-media">
        <div class="pc-badges">${badges}</div>
        <img class="lazy" data-src="${image}" src="assets/images/placeholder.svg" alt="${escapeHTML(product.name)}">
      </a>
      <button class="pc-quick" data-quick-view="${product.id}" aria-label="Aperçu rapide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <div class="pc-body">
        ${catName ? `<span class="pc-cat">${escapeHTML(catName)}</span>` : ""}
        <a href="produit.html?id=${product.id}"><h3 class="pc-name">${escapeHTML(product.name)}</h3></a>
        <div class="pc-price-row">
          <span class="pc-price">${formatPrice(product.price, currency)}</span>
          ${product.old_price ? `<span class="pc-old-price">${formatPrice(product.old_price, currency)}</span>` : ""}
        </div>
        <button class="pc-add" data-add-cart="${product.id}" ${outOfStock ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          ${outOfStock ? "Épuisé" : "Ajouter"}
        </button>
      </div>
    </div>`;
}

/** Affiche une grille de produits dans un conteneur, avec un état vide si besoin */
function renderProductGrid(container, products) {
  if (!container) return;
  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <h3>Aucun produit trouvé</h3>
        <p>Essayez de modifier vos filtres ou votre recherche.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(renderProductCard).join("");
  initLazyLoading(container);
  initScrollReveal(container);
}

/* --------------------------------------------------------------------------
   DELEGATION : ajout au panier depuis n'importe quelle grille de produits
   -------------------------------------------------------------------------- */
document.addEventListener("click", async (e) => {
  const addBtn = e.target.closest("[data-add-cart]");
  if (addBtn && !addBtn.disabled) {
    const id = addBtn.dataset.addCart;
    const product = await fetchProductById(id);
    if (product) Cart.add(product, 1);
  }
});
