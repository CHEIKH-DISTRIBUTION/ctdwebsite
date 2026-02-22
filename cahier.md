# Cahier des charges - Plateforme e-commerce Cheikh Distribution

## Sommaire

- [Cahier des charges - Plateforme e-commerce Cheikh Distribution](#cahier-des-charges---plateforme-e-commerce-cheikh-distribution)
  - [Sommaire](#sommaire)
  - [1. Contexte et parties prenantes](#1-contexte-et-parties-prenantes)
  - [2. Objectifs fonctionnels](#2-objectifs-fonctionnels)
  - [3. Objectifs non fonctionnels](#3-objectifs-non-fonctionnels)
  - [4. User stories \& critères d’acceptation](#4-user-stories--critères-dacceptation)
    - [User Story 0](#user-story-0)
    - [User Story 1](#user-story-1)
    - [User Story 2](#user-story-2)
    - [User Story 3](#user-story-3)
  - [5. Contraintes et hypothèses](#5-contraintes-et-hypothèses)
  - [6. Validation / recette](#6-validation--recette)
  - [7. Risques identifiés](#7-risques-identifiés)
    - [7.1 Échec ou défaillance des paiements mobiles](#71-échec-ou-défaillance-des-paiements-mobiles)
    - [7.2 Problèmes de réactivité ou mauvaise gestion des livreurs](#72-problèmes-de-réactivité-ou-mauvaise-gestion-des-livreurs)
    - [7.3 Synchronisation et cohérence des stocks](#73-synchronisation-et-cohérence-des-stocks)
    - [7.4 Adresses de livraison incorrectes ou hors zone](#74-adresses-de-livraison-incorrectes-ou-hors-zone)
    - [7.5 Fraudes, commandes falsifiées et sécurité](#75-fraudes-commandes-falsifiées-et-sécurité)
    - [7.6 Risques liés à la disponibilité et performance](#76-risques-liés-à-la-disponibilité-et-performance)
    - [7.7 Risques réglementaires et conformité](#77-risques-réglementaires-et-conformité)
    - [7.8 Risques liés aux notifications (SMS/Email)](#78-risques-liés-aux-notifications-smsemail)
  - [8. Intégration des paiements](#8-intégration-des-paiements)

---

## 1. Contexte et parties prenantes

**Objet du projet :**
Développer une plateforme e-commerce web (et potentiellement mobile) pour *Cheikh Distribution*, permettant aux ménages, ONG, collectivités, entreprises et écoles de commander des produits alimentaires, électroménagers, d’hygiène, vêtements, etc., avec gestion des paiements mobiles, géolocalisation, notation des livreurs, et administration complète du catalogue et des livraisons.

**Acteurs principaux :**

* Visiteur / client non connecté
* Client connecté (ménage, ONG, entreprise…)
* Livreurs
* Gestionnaire de stock / administrateur produit
* Administrateur général (utilisateurs, offres, rapports)
* Système de paiement mobile (Wave, Orange Money, etc.)

---

## 2. Objectifs fonctionnels

| ID  | Besoin                     | Description                                                                                                           |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| F1  | Parcourir le catalogue     | Le visiteur peut naviguer et filtrer les produits par catégorie, prix, disponibilité, localisation.                   |
| F2  | Compte utilisateur         | Le client peut créer un compte, gérer ses adresses, voir ses commandes et historique.                                 |
| F3  | Panier & commande          | Le client peut ajouter/supprimer des produits, voir un résumé et valider la commande.                                 |
| F4  | Paiement mobile  & en espèces          | Paiement mobile & en espèces. Le client peut payer via Wave, Orange Money ou en espèces à la livraison (intégration sécurisée et retour d’état) .                        |
| F5  | Géolocalisation            | Le client saisit/choisit une adresse de livraison avec affichage de la zone couverte, estimation du coût et du temps. |
| F6  | Suivi de commande          | Le client suit l’état de sa commande (préparation, en cours de livraison, livré).                                     |
| F7  | Notation livreur           | Après livraison, le client peut noter et commenter le livreur.                                                        |
| F8  | Gestion des stocks         | Le gestionnaire voit les niveaux, bloque les produits en rupture, déclenche des alertes.                              |
| F9  | Gestion des utilisateurs   | L’administrateur crée, modifie, suspend des comptes clients, livreurs, gestionnaires.                                 |
| F10 | Promotions / offres        | Création de codes promo, remises ciblées, gestion de campagnes.                                                       |
| F11 | Tableau de bord des ventes | L’administrateur consulte statistiques, chiffre d’affaires, produits les plus vendus, retours.                        |
| F12 | Notifications              | Envoi d’alertes par SMS/email (confirmation commande, livraison, échec paiement).                                     |

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

### User Story 0

**En tant que** visiteur non connecté,
**Je veux** parcourir le catalogue et sauvegarder des produits dans une wishlist ou un panier temporaire,
**Afin de** préparer une commande avant de m’inscrire ou me connecter.

**Critères :**

* Je peux filtrer et voir les produits.
* Je peux ajouter des produits à un panier temporaire (persisté en session).
* Je suis redirigé vers l'inscription/connexion au moment de valider la commande.

---

### User Story 1

**En tant que** client,
**Je veux** ajouter des produits à mon panier et finaliser une commande avec paiement mobile via Wave ou Orange Money,
**Afin de** recevoir les produits chez moi.

**Critères :**

* Je peux ajouter/supprimer des articles.
* Je vois le total, la TVA et les frais de livraison.
* Je choisis entre Wave et Orange Money.
* Le système initie la transaction vers l’API du paiement mobile et attend le statut (succès / échec).
* En cas de succès : je reçois une confirmation (page + SMS/email) et la commande entre en préparation.
* En cas d’échec : un message clair s’affiche et je peux retenter ou choisir une autre méthode.
* Les tentatives échouées sont loggées pour audit.
* Une seule tentative de retry automatique en cas de timeout avant affichage d’une erreur.

---

### User Story 2

**En tant que** livreur,
**Je veux** voir les commandes à livrer avec itinéraire et état,
**Afin de** livrer efficacement.

**Critères :**

* Je reçois une notification d’une nouvelle mission.
* Je peux marquer “en cours”, “livré” ou “échec”.
* Le client voit le statut en temps réel.

---

### User Story 3

**En tant que** gestionnaire de stock,
**Je veux** voir le niveau de chaque produit et recevoir une alerte si celui-ci est bas,
**Afin de** réapprovisionner à temps.

**Critères :**

* Affichage du stock actuel.
* Seuils configurables déclenchant des alertes.
* Produit indisponible empêche l’ajout au panier.

---

## 5. Contraintes et hypothèses

* L’utilisateur dispose d’un téléphone/mobile compatible avec les paiements mobiles.
* Les services de paiement Wave et Orange Money sont disponibles et répondent (timeouts gérés).
* Les livreurs disposent d’un smartphone pour mise à jour du statut.
* La zone de livraison est définie et limitée (couverture géographique gérée).
* La politique de retour est définie séparément, les retours ne sont pas immédiats.

---

## 6. Validation / recette

**Checklist de validation avec le client pilote :**

* [ ] Catalogue de produits validé (catégories + attributs).
* [ ] Parcours complet de commande testé (ajout, paiement, confirmation).
* [ ] Intégration paiement mobile testée en sandbox et production, avec scénarios succès/échec/retry.
* [ ] Webhooks de confirmation sécurisés et idempotents.
* [ ] Gestion claire des erreurs et retours utilisateurs validée.
* [ ] Réconciliation commandes vs statuts de paiement.
* [ ] Géolocalisation et estimation des livraisons vérifiées.
* [ ] Suivi en temps réel visible pour client et livreur.
* [ ] Notation livreur fonctionnelle et stockée.
* [ ] Gestion des stocks (ruptures, alertes) validée.
* [ ] Notifications (commande, livraison, échec) reçues.
* [ ] Interface admin pour rapports et gestion utilisateurs opérationnelle.
* [ ] Tests de montée en charge et performance validés.
* [ ] Plan de formation des utilisateurs clés (administrateurs, gestionnaires, livreurs).
* [ ] Go formel du commanditaire avant mise en production.

---

## 7. Risques identifiés

### 7.1 Échec ou défaillance des paiements mobiles

* **Description :** Les systèmes Wave et Orange Money, bien que largement utilisés, peuvent subir des pannes temporaires, des délais ou des erreurs de communication (timeouts, échecs API, interruptions réseau).
* **Conséquences :**

  * Transactions non finalisées, clients frustrés, perte potentielle de chiffre d’affaires.
  * Commandes en suspens ou faussement confirmées, causant une désorganisation dans le traitement.
* **Mesures d’atténuation :**

  * Implémenter un mécanisme de retry automatique (limité à une tentative).
  * Gestion robuste des erreurs et retours utilisateurs clairs, avec possibilité de changement de méthode.
  * Logs d’audit précis pour retracer chaque tentative, identifier rapidement les incidents.
  * Tests en sandbox et production pour valider la stabilité.

---

### 7.2 Problèmes de réactivité ou mauvaise gestion des livreurs

* **Description :** Les livreurs pourraient ne pas mettre à jour les statuts à temps (retard, oubli, problèmes de réseau), ou donner des infos erronées (livraison marquée “faite” alors que non).
* **Conséquences :**

  * Le client reste dans le flou, l’expérience utilisateur se dégrade fortement.
  * Risque de conflits, litiges, voire perte de confiance dans la plateforme.
* **Mesures d’atténuation :**

  * Notifications automatiques aux livreurs pour rappel et suivi des missions.
  * Interface mobile simple et rapide à utiliser, avec faible consommation de données.
  * Mécanismes de contrôle côté admin pour détecter incohérences ou non mises à jour.
  * Formation et sensibilisation des livreurs à l’importance des statuts.

---

### 7.3 Synchronisation et cohérence des stocks

* **Description :** Lors de pics de commandes simultanées, plusieurs clients peuvent commander le même produit en rupture ou faible quantité, menant à un risque de survente (double vente).
* **Conséquences :**

  * Commandes annulées ou retardées, clients mécontents.
  * Perte de crédibilité et impact négatif sur la gestion logistique.
* **Mesures d’atténuation :**

  * Implémentation d’un mécanisme de verrouillage transactionnel ou contrôle optimiste avec validation finale du stock pour éviter la survente.
  * Mise à jour en temps réel des niveaux de stock visibles dans le catalogue.
  * Alertes automatiques pour réapprovisionnement rapide.
  * Blocage immédiat des produits en rupture.

---

### 7.4 Adresses de livraison incorrectes ou hors zone

* **Description :** Les clients peuvent saisir des adresses erronées, incomplètes ou situées en dehors de la zone gé


ographique couverte par les livreurs.

* **Conséquences :**

  * Commandes non livrées ou livrées avec retard.
  * Perte de temps et de ressources humaines.
* **Mesures d’atténuation :**

  * Validation stricte de l’adresse via géolocalisation, affichage clair des zones desservies.
  * Blocage ou avertissement à la saisie d’une adresse hors zone.
  * Possibilité de contact client pour correction avant traitement.

---

### 7.5 Fraudes, commandes falsifiées et sécurité

* **Description :** Risque que des utilisateurs malveillants tentent de passer des commandes fictives, usurper des comptes ou manipuler les paiements.
* **Conséquences :**

  * Perte financière directe, perturbation du système.
  * Atteinte à la réputation de la plateforme.
* **Mesures d’atténuation :**

  * Authentification forte, validation côté serveur de toutes les données critiques.
  * Surveillance et détection des comportements anormaux (nombre excessif de commandes, tentatives de paiements suspectes).
  * Protection contre injections, attaques CSRF, etc.
  * Validation des webhooks de paiement par signature cryptographique.

---

### 7.6 Risques liés à la disponibilité et performance

* **Description :** Pendant les pics de trafic, le système peut devenir lent, indisponible ou subir des pannes partielles.
* **Conséquences :**

  * Perte d’opportunités de ventes, frustration client.
  * Perte de confiance durable si l’incident est récurrent.
* **Mesures d’atténuation :**

  * Architecture scalable avec possibilité de montée en charge rapide.
  * Monitoring actif de la plateforme pour détecter et corriger les goulets d’étranglement.

---

### 7.7 Risques réglementaires et conformité

* **Description :** Non-respect des réglementations locales sur la protection des données (ex. : loi sénégalaise n°2008-12 relative à la protection des données personnelles), la gestion des paiements ou la livraison.
* **Conséquences :**

  * Sanctions légales, amendes.
  * Perte de confiance client et dommages réputationnels.
* **Mesures d’atténuation :**

  * Implémenter des politiques claires de confidentialité, consentement utilisateur.
  * Stockage sécurisé des données sensibles.
  * Sensibilisation des équipes sur la confidentialité et la protection des données.

---

### 7.8 Risques liés aux notifications (SMS/Email)

* **Description :** Envoi raté ou retardé des notifications importantes (confirmation de commande, livraison).
* **Conséquences :**

  * Client mal informé, risque de confusion ou mécontentement.
* **Mesures d’atténuation :**

  * Intégration robuste avec services SMS/email fiables.
  * Gestion des erreurs et tentatives de renvoi automatique.

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

