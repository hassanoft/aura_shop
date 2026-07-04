# AURA SHOP — Site client

Site e-commerce en HTML / CSS / JavaScript (Vanilla), connecté à Supabase.

## 🚀 Mise en route

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** dans Supabase et exécutez le script `database.sql` (fourni à la racine de la livraison). Il crée les tables `products`, `categories`, `banners`, `settings`, les relations, les politiques RLS et le bucket de stockage `aura-shop`.
3. Dans **Project Settings > API**, copiez :
   - `Project URL`
   - `anon public key`
4. Ouvrez `js/supabase-config.js` et renseignez :
   ```js
   const SUPABASE_URL = "https://VOTRE-PROJET.supabase.co";
   const SUPABASE_ANON_KEY = "VOTRE_CLE_ANON_PUBLIC";
   ```
5. Ouvrez `index.html` dans un navigateur, ou déployez le dossier tel quel sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages, cPanel...).

## 📁 Structure

```
AURA_SHOP/
├── index.html          Page d'accueil
├── produits.html        Catalogue (filtres, recherche, tri, pagination)
├── produit.html          Détail d'un produit
├── css/style.css         Design system complet
├── js/
│   ├── supabase-config.js   Connexion Supabase (à configurer)
│   ├── utils.js              Fonctions communes (toasts, lazy load, etc.)
│   ├── settings.js           Paramètres de la boutique
│   ├── products.js           Accès aux données produits/catégories
│   ├── cart.js                Panier (localStorage) + commande WhatsApp
│   ├── search.js              Recherche instantanée
│   ├── footer.js               Pied de page commun
│   ├── home.js / catalog.js / product-detail.js   Scripts de page
└── assets/images/         Logo + image de remplacement
```

## 🛒 Fonctionnement du panier

- Le panier est stocké dans `localStorage` (persistant entre les visites).
- Le bouton **Commander sur WhatsApp** ouvre `https://wa.me/<numéro>?text=<message>` avec un message pré-rempli listant tous les articles, quantités, sous-totaux et les informations du client.
- Le numéro WhatsApp utilisé est celui défini dans les **Paramètres** de l'administration (`whatsapp_number`).

## 🎨 Identité visuelle

Le logo fourni (`assets/images/logo.jpg`) est utilisé comme favicon et dans la barre de navigation. La palette est dérivée de sa couleur bleue dominante (`#2563EB`).
