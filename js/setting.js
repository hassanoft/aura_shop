/* ==========================================================================
   AURA SHOP — Paramètres de la boutique
   ========================================================================== */

/** Charge les paramètres de la boutique (settings) depuis Supabase et les applique au DOM */
async function loadShopSettings() {
  try {
    const { data, error } = await supabaseClient
      .from("settings")
      .select("*")
      .eq("key", "general")
      .single();

    if (error) throw error;
    shopSettingsCache = data;
    applyShopSettings(data);
    return data;
  } catch (e) {
    console.warn("Impossible de charger les paramètres, valeurs par défaut utilisées.", e);
    shopSettingsCache = { shop_name: "AURA SHOP", whatsapp_number: DEFAULT_WHATSAPP_NUMBER, currency: "FCFA" };
    return shopSettingsCache;
  }
}

/** Applique les paramètres récupérés aux éléments de la page (nom, contact, WhatsApp, etc.) */
function applyShopSettings(settings) {
  if (!settings) return;

  document.querySelectorAll("[data-shop-name]").forEach(el => el.textContent = settings.shop_name || "AURA SHOP");
  document.querySelectorAll("[data-shop-desc]").forEach(el => el.textContent = settings.shop_description || "");
  document.querySelectorAll("[data-shop-address]").forEach(el => el.textContent = settings.address || "");
  document.querySelectorAll("[data-shop-email]").forEach(el => el.textContent = settings.email || "");

  const waFloat = document.querySelector(".wa-float");
  if (waFloat && settings.whatsapp_number) {
    waFloat.href = `https://wa.me/${settings.whatsapp_number}`;
  }

  const fbLink = document.querySelector("[data-fb-link]");
  if (fbLink && settings.facebook_url) fbLink.href = settings.facebook_url;
  const igLink = document.querySelector("[data-ig-link]");
  if (igLink && settings.instagram_url) igLink.href = settings.instagram_url;

  document.title = document.title.replace("AURA SHOP", settings.shop_name || "AURA SHOP");
}
