/* ==========================================================================
   AURA SHOP — Configuration Supabase
   ⚠️ Renseignez ici l'URL de votre projet Supabase et la clé publique (anon key)
   Ces deux informations se trouvent dans : Supabase Dashboard > Project Settings > API
   ========================================================================== */

const SUPABASE_URL = "https://rtakumwxgxgkatlkjlfd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZkHDlxcSS4z0PWeJRM6MaQ_7fedYW9k";

// Initialisation du client Supabase (bibliothèque chargée via CDN dans le <head>)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nom du bucket de stockage utilisé pour les images
const STORAGE_BUCKET = "aura-shop";

// Numéro WhatsApp par défaut (peut être surchargé par les paramètres de la boutique)
const DEFAULT_WHATSAPP_NUMBER = "2250500525480";
