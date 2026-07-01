# 🍯 Coopérative Bab Mansour - Plateforme E-Commerce

Une application Web moderne et élégante conçue pour la **Coopérative Bab Mansour**, spécialisée dans la vente de produits traditionnels marocains faits à la main, tels que le miel pur et les huiles naturelles (huile d'argan, huile d'olive, etc.).

Cette plateforme intègre une boutique en ligne haut de gamme pour les clients ainsi qu'un espace d'administration complet pour la gestion du catalogue de la coopérative.

---

## ✨ Fonctionnalités Clés

### 🛒 Espace Boutique (Client)
*   **Vitrine Artisanale & Thématique** : Un design épuré, chaleureux et professionnel utilisant une palette de couleurs inspirée de la terre cuite (terracotta) et du miel doré.
*   **Catalogue Interactif** : Consultation simplifiée des produits par catégorie (Miels, Huiles, Divers).
*   **Panier & Commande** : Gestion dynamique du panier avec choix des déclinaisons (tailles) et formulaire de commande direct.
*   **Typographie Soignée** : Utilisation harmonieuse de polices élégantes (*Playfair Display* pour les titres et *Inter/Outfit* pour le texte).

### ⚙️ Espace Administration (Dashboard)
*   **Tableau de Bord des Produits** :
    *   Affichage en liste épurée avec aperçus en miniatures circulaires.
    *   Popup de détails ("View") moderne et centré.
    *   Formulaires d'ajout et de modification sous forme de modals centrés avec onglets interactifs (*Détails*, *Traductions*, *Variations & Tarifs*).
*   **Formulaire Produit Ergonomique (Design Côte-à-Côte)** : 
    *   Mise en page épurée sur deux colonnes (détourage d'image sur la gauche, informations textuelles et description sur la droite) pour réduire la hauteur de défilement.
    *   Tableau de variations fluide avec en-têtes fixes, évitant la répétition fastidieuse des libellés de champs.
*   **Traduction Automatique Intelligente (Smart Auto-Translate)** :
    *   Traduction à la volée en un clic des fiches produits (Nom et Description) en anglais et en arabe directement depuis l'onglet *Traductions*.
    *   Pipeline de traduction automatique côté serveur (Node.js/Express) qui complète automatiquement les champs de langue vides lors de la création ou mise à jour de produits et de catégories.
*   **Gestion Multi-Variations (Tailles & Prix)** : Gestion en base de données permettant de lier plusieurs déclinaisons de conditionnement (ex: 250g, 500g, 1L) avec des prix distincts pour un seul produit.
*   **Création Dynamique de Catégories** : Possibilité de créer des catégories personnalisées à la volée directement depuis le formulaire produit, avec traduction automatique automatique de leur nom en base de données.
*   **Détourage Intelligent des Photos (Background Remover)** : Un outil de détourage intégré basé sur le canvas HTML5. Supprimez instantanément les arrière-plans des images importées grâce à un curseur de sensibilité (tolérance) interactif.
*   **Configuration du Site (Settings)** : Modification dynamique des textes statiques du site (titres, description de l'histoire) et des bannières/images directement depuis l'interface d'administration.
*   **Suivi des Commandes & Statuts de Paiement** : 
    *   Visualisation en temps réel des commandes clients passées avec le détail des produits achetés.
    *   Option de marquer chaque commande comme "Payée" ou "Non payée" directement depuis la liste ou le menu contextuel.
    *   Onglet dédié "Clients avec Impayés" permettant de monitorer en temps réel les clients débiteurs et le montant total des impayés.
*   **Création de Commande Manuelle Optimisée** :
    *   Formulaire d'ajout rapide pour les ventes directes en magasin.
    *   Autocomplétion intelligente des informations clients (nom, prénom, téléphone, adresse) basée sur les données historiques des anciens acheteurs.
    *   Possibilité d'ajuster le prix de vente unitaire d'un produit lors de la commande avec vérification automatique d'un prix plancher (basé sur le coût d'achat de la variation) afin de prévenir la vente à perte.
*   **Gestion des Stocks & Coûts d'Achat (FIFO)** :
    *   Section d'administration dédiée à la gestion du stock et des lots d'approvisionnement.
    *   Suivi précis des approvisionnements sous forme de file d'attente FIFO (First-In-First-Out) : chaque lot possède son propre coût unitaire d'achat, sa quantité initiale et sa quantité restante.
    *   Déduction automatique des stocks par ordre chronologique lors des ventes en ligne ou en magasin.
    *   Bouton de suppression des lots récents (si aucune unité n'a encore été vendue).
    *   Barre de recherche rapide intégrée et pagination (10 produits par page) pour une réactivité optimale de l'interface.
    *   Jauge de progression graphique (barre de depletion) pour chaque lot d'approvisionnement changeant de couleur selon le niveau de stock critique.
*   **Section Statistiques Avancées** :
    *   Tableau de bord complet affichant les métriques clés (Total Produits, Catégories, Articles vendus, Chiffre d'Affaires).
    *   Calcul dynamique du **Bénéfice Net** réel en soustrayant le coût d'achat unitaire FIFO exact des prix de vente enregistrés.
    *   Exclusion automatique des commandes impayées du chiffre d'affaires et du bénéfice net pour refléter la trésorerie réelle.
    *   Filtres de période dynamiques (**Aujourd'hui**, **Ce mois-ci**, **Tout**) appliqués uniformément sur toutes les statistiques.
    *   Graphiques interactifs (Chart.js) : Répartition des revenus par catégorie (Doughnut) et Tendances de ventes avec granularité dynamique (Linéaire).
    *   Classement en temps réel : Produits les plus vendus (Top 5), les moins vendus (Top 5) et les plus consultés (Top 5).
    *   Suivi précis des visites par date grâce à une table dédiée `product_views` avec script de migration automatique des données historiques.
 
### 🗺️ Autres Pages & Expérience Utilisateur
*   **Page d'Erreur 404 Revêtue** : Une page d'erreur 404 modernisée sous forme de carte moderne avec Flexbox, des animations d'entrée fluides, un effet de zoom sur l'illustration au survol, et une localisation intégrale (Français, Anglais, Arabe) gérant parfaitement la direction de lecture RTL/LTR.

---

## 🛠️ Stack Technique

*   **Frontend** : [Angular CLI](https://github.com/angular/angular-cli) (v11) avec styles CSS sur mesure (Design Premium, icônes Google Material Symbols).
*   **Backend** : Serveur REST API sous [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/).
*   **Base de données** : [PostgreSQL](https://www.postgresql.org/) avec agrégation de données JSON native (pour le chargement imbriqué des tailles et prix).

---

## 🚀 Démarrage Rapide

### Préréquis
*   Node.js (v14+ recommandé)
*   PostgreSQL installé et en cours d'exécution

### 1. Configuration de la base de données
1. Créez une base de données PostgreSQL nommée `coop_babmansour`.
2. Les tables requises (`products`, `product_sizes`, `users`, `command`, `config`, etc.) seront initialisées automatiquement au lancement du backend ou via le script de migration.

### 2. Lancement du Serveur Backend (API)
Accédez au dossier racine du projet et démarrez le service :
```bash
# Lancement de l'API Node.js
node src/index.js
```
Le serveur backend démarre par défaut sur le port `5000` (`http://localhost:5000`).

### 3. Lancement de l'Application Frontend (Angular)
Dans un autre terminal à la racine du projet :
```bash
# Démarrage du serveur de développement Angular
npm start
```
Une fois le build terminé, ouvrez votre navigateur à l'adresse : `http://localhost:4200`.

---

## 📂 Structure du Code Source

```
├── src
│   ├── index.js                  # Point d'entrée du serveur backend Node.js/Express
│   ├── migrate.js                # Scripts de configuration de la base PostgreSQL
│   ├── styles.css                # Base du système de design (variables CSS globales)
│   ├── app
│   │   ├── app-routing.module.ts # Définition des routes frontend
│   │   ├── app.module.ts         # Module principal Angular
│   │   ├── acceuil-cont          # Section Boutique & Page d'accueil publique
│   │   ├── dashboard             # Squelette de l'espace administration
│   │   ├── products              # Gestion des produits (Tableau, Modals d'ajout/édition/détails)
│   │   ├── commands              # Suivi des commandes clients
│   │   ├── settings              # Configuration des images et textes du site
│   │   └── services              # Services Angular de communication API (DashboardService, etc.)
│   └── assets                    # Images statiques, logos et icônes
```

---

## 🎨 Système de Design (CSS Variables)
La plateforme utilise un ensemble de variables CSS unifiées dans `src/styles.css` pour assurer la cohérence graphique :
*   `--color-primary` : Amber/Miel doré (`#b45309`)
*   `--color-secondary` : Olive Verte (`#4d7c0f`)
*   `--color-terracotta` : Orange argile marocain (`#c2410c`)
*   `--font-serif` : *Playfair Display* (pour les titres)
*   `--font-sans` : *Inter* (pour le texte et les interfaces de contrôle)
