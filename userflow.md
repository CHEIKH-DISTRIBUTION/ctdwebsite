

## 1. User Flows (Parcours utilisateurs)

### **Flow 1 – Commande client**

1. **Accueil** → Navigation dans les catégories → Choix produit
2. **Page produit** → Sélection quantité → Bouton *Ajouter au panier*
3. **Panier** → Voir liste, total, frais de livraison estimés → Bouton *Commander*
4. **Connexion / Inscription** (si non connecté)
5. **Adresse de livraison** → Saisie ou sélection d’une adresse sauvegardée → Validation
6. **Paiement** → Choix méthode (Wave / Orange Money) → Confirmation paiement
7. **Page confirmation** → Numéro de commande, suivi, estimation livraison
8. **Notification** (SMS/email) envoyée

---

### **Flow 2 – Livraison (Livreur)**

1. **Connexion livreur**
2. **Tableau de bord** → Liste des commandes assignées
3. **Détails commande** → Voir adresse, itinéraire Google Maps, numéro client
4. **Mise à jour statut** : “En cours de livraison” → “Livré” ou “Échec”
5. **Fin de mission** → Envoi auto du statut au client + admin

---

### **Flow 3 – Gestion stock (Admin / Gestionnaire)**

1. **Connexion admin**
2. **Tableau de bord stock** → Liste produits avec quantité
3. **Filtre** → Afficher uniquement stocks bas ou ruptures
4. **Action** → Modifier quantité, bloquer produit en rupture
5. **Enregistrement** → Mise à jour en temps réel sur le site

---

## 2. Wireframes textuels

*(Imagine chaque bloc comme une “zone” de l’écran)*

---

### **Wireframe – Accueil**

```
[Header]
  - Logo Cheikh Distribution (à gauche)
  - Barre de recherche [🔍 Rechercher...]
  - Icônes : Compte, Panier (nombre articles)

[Menu catégories]
  - Alimentation | Électroménager | Hygiène | Vêtements | Autres

[Slider promo]
  - Image + bouton "Découvrir les offres"

[Produits populaires]
  - Carte produit : Image | Nom | Prix | Bouton "Ajouter au panier"

[Footer]
  - Liens : Contact | CGV | FAQ | Réseaux sociaux
```

---

### **Wireframe – Page produit**

```
[Image produit à gauche]   [Infos produit à droite]
- Nom du produit
- Prix
- Stock : Disponible / Indisponible
- Sélecteur quantité [+] [-]
- Bouton "Ajouter au panier"
- Description détaillée
- Avis clients (étoiles + commentaires)
```

---

### **Wireframe – Panier**

```
[Liste des articles]
  - Image produit | Nom | Prix | Quantité | Supprimer (❌)
[Résumé]
  - Sous-total
  - Frais de livraison estimés
  - Total TTC
[Actions]
  - Bouton "Continuer mes achats"
  - Bouton "Passer à la commande"
```

---

### **Wireframe – Paiement**

```
[Adresse de livraison]
  - Liste des adresses enregistrées
  - Bouton "Ajouter nouvelle adresse"

[Mode de paiement]
  - Radio button : Wave
  - Radio button : Orange Money
  - Instructions (scanner QR code ou saisir numéro)

[Résumé commande]
  - Produits + Total

[Action]
  - Bouton "Payer maintenant"
```

---

### **Wireframe – Tableau de bord admin**

```
[Menu latéral]
  - Produits
  - Commandes
  - Utilisateurs
  - Stocks
  - Statistiques

[Zone principale]
  - Graphiques ventes (CA, produits populaires)
  - Alertes : Rupture stock, paiement échoué
```


