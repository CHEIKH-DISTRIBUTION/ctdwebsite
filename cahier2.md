Parfait, voici ton cahier des charges **mis à jour** avec le paiement en espèces intégré proprement et partout où il faut.

---

# Cahier des charges - Plateforme e-commerce Cheikh Distribution

## Sommaire

- [Cahier des charges - Plateforme e-commerce Cheikh Distribution](#cahier-des-charges---plateforme-e-commerce-cheikh-distribution)
  - [Sommaire](#sommaire)
  - [1. Contexte et parties prenantes](#1-contexte-et-parties-prenantes)
  - [2. Objectifs fonctionnels](#2-objectifs-fonctionnels)
  - [3. Objectifs non fonctionnels](#3-objectifs-non-fonctionnels)
  - [4. User stories \& critères d’acceptation](#4-user-stories--critères-dacceptation)
    - [User Story 1 (mise à jour pour inclure le paiement en espèces)](#user-story-1-mise-à-jour-pour-inclure-le-paiement-en-espèces)
  - [8. Intégration des paiements](#8-intégration-des-paiements)

---

## 1. Contexte et parties prenantes

**Objet du projet :**
Développer une plateforme e-commerce web (et potentiellement mobile) pour *Cheikh Distribution*, permettant aux ménages, ONG, collectivités, entreprises et écoles de commander des produits alimentaires, électroménagers, d’hygiène, vêtements, etc., avec gestion des paiements (mobiles et espèces), géolocalisation, notation des livreurs, et administration complète du catalogue et des livraisons.

**Acteurs principaux :**

* Visiteur / client non connecté
* Client connecté (ménage, ONG, entreprise…)
* Livreurs
* Gestionnaire de stock / administrateur produit
* Administrateur général (utilisateurs, offres, rapports)
* Système de paiement mobile (Wave, Orange Money, etc.)
* Encaissement espèces par livreur

---

## 2. Objectifs fonctionnels

| ID  | Besoin                       | Description                                                                                                           |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| F1  | Parcourir le catalogue       | Le visiteur peut naviguer et filtrer les produits par catégorie, prix, disponibilité, localisation.                   |
| F2  | Compte utilisateur           | Le client peut créer un compte, gérer ses adresses, voir ses commandes et historique.                                 |
| F3  | Panier & commande            | Le client peut ajouter/supprimer des produits, voir un résumé et valider la commande.                                 |
| F4  | Paiement mobile & en espèces | Le client peut payer via Wave, Orange Money, carte bancaire, ou en espèces à la livraison (Cash on Delivery).         |
| F5  | Géolocalisation              | Le client saisit/choisit une adresse de livraison avec affichage de la zone couverte, estimation du coût et du temps. |
| F6  | Suivi de commande            | Le client suit l’état de sa commande (préparation, en cours de livraison, livré).                                     |
| F7  | Notation livreur             | Après livraison, le client peut noter et commenter le livreur.                                                        |
| F8  | Gestion des stocks           | Le gestionnaire voit les niveaux, bloque les produits en rupture, déclenche des alertes.                              |
| F9  | Gestion des utilisateurs     | L’administrateur crée, modifie, suspend des comptes clients, livreurs, gestionnaires.                                 |
| F10 | Promotions / offres          | Création de codes promo, remises ciblées, gestion de campagnes.                                                       |
| F11 | Tableau de bord des ventes   | L’administrateur consulte statistiques, chiffre d’affaires, produits les plus vendus, retours.                        |
| F12 | Notifications                | Envoi d’alertes par SMS/email (confirmation commande, livraison, échec paiement).                                     |

---

## 3. Objectifs non fonctionnels

* **Sécurité :** Authentification sécurisée, validation côté serveur, protection contre fraudes sur paiements.
* **Performance :** Temps de chargement du catalogue inférieur à 2 secondes pour l’utilisateur moyen sur mobile.
* **Disponibilité :** Service opérationnel à 99 % en heures business.
* **Scalabilité :** Montée en charge facilitée pendant les pics (ex. : fin de mois, commandes groupées).
* **Résilience paiement :** Retry et rollback en cas d’échec partiel de transaction mobile.
* **Internationalisation minimale :** Formats de nombre et devise adaptables (si expansion).
* **Accessibilité & responsive :** Fonctionne bien sur smartphone bas de gamme et desktop.
* **Gestion des sessions :** Conservation temporaire des paniers et wishlists pour utilisateurs non connectés.

---

## 4. User stories & critères d’acceptation

### User Story 1 (mise à jour pour inclure le paiement en espèces)

**En tant que** client,
**Je veux** ajouter des produits à mon panier et finaliser une commande avec paiement mobile via Wave ou Orange Money, carte bancaire, ou en espèces à la livraison,
**Afin de** recevoir les produits chez moi.

**Critères :**

* Je peux ajouter/supprimer des articles.
* Je vois le total, la TVA et les frais de livraison.
* Je choisis entre Wave, Orange Money, carte bancaire ou espèces.
* Pour espèces : ma commande est validée et marquée “En attente de paiement” jusqu’à confirmation par le livreur.
* Pour paiements électroniques : le système initie la transaction et attend le statut (succès / échec).
* En cas d’échec électronique : message clair et possibilité de retenter ou changer de méthode.
* Les tentatives échouées sont loggées pour audit.
* Une seule tentative de retry automatique en cas de timeout avant erreur.

---

## 8. Intégration des paiements

* **Modes supportés :** Wave, Orange Money, Carte bancaire, Espèces à la livraison (Cash on Delivery).

* **Flux général :**

  1. Le client choisit une méthode (Wave, Orange Money, Carte bancaire, ou Espèces).
  2. Pour paiements électroniques : le backend crée une requête vers l’API de paiement (sandbox en dev).
  3. Pour espèces : la commande est enregistrée avec statut “En attente de paiement”, et confirmée par le livreur au moment de la livraison.
  4. Le service tiers (paiement électronique) renvoie un webhook avec le statut.
  5. En cas de succès (ou confirmation du livreur pour espèces), la commande passe à “Confirmée”.

* **Gestion des échecs :**

  * Timeout ou erreur réseau pour paiements électroniques : retry automatique une fois.
  * Paiement espèces refusé à la livraison : commande annulée et stock réajusté.

* **Sécurité :**

  * Validation des signatures des webhooks pour paiements électroniques.
  * Confirmation obligatoire par le livreur sur l’application mobile pour encaissement espèces.

* **Suivi & audit :**

  * Historisation de chaque tentative ou encaissement (date, heure, montant, méthode).

---

✅ Avec ça, le paiement en espèces est **officiellement intégré** dans toutes les parties clés.
Si tu veux, je peux aussi te préparer **un mini schéma de flux** pour montrer le process du cash et des paiements mobiles côte à côte, ça fait toujours bonne impression auprès d’un client.

Tu veux que je te fasse ce schéma ?
