### 📄 `README.md` – Cheikh Distribution Frontend


# 🛒 Cheikh Distribution – Plateforme E-commerce (Frontend)

> **Cheikh Distribution** est une plateforme e-commerce sénégalaise permettant aux ménages, ONG, entreprises et écoles de commander des produits alimentaires, d’hygiène, électroménagers, et bien plus.  
> Ce dépôt contient le **frontend** de l'application, développé avec **React, Next.js, TypeScript, Tailwind CSS** et **shadcn/ui**.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwind-css)
![Zustand](https://img.shields.io/badge/Zustand-4-orange?logo=redux)

---

## 🎯 Fonctionnalités

- 🏠 **Page d’accueil** avec présentation de l’entreprise
- 📦 **Catalogue de produits** (filtres, recherche, catégories)
- 🛍️ **Panier persistant** (avec Zustand + localStorage)
- 💳 **Checkout sécurisé** avec choix de paiement (Wave, Orange Money, carte)
- 📍 **Géolocalisation & adresses de livraison**
- 📦 **Suivi des commandes** (statut en temps réel)
- ⭐ **Notation des livreurs** après livraison
- 📱 **Interface 100% responsive** (mobile & desktop)
- 👔 **Espaces utilisateurs** : client, livreur, administrateur

---

## 🛠️ Stack Technique

| Couche | Technologie |
|-------|-------------|
| Frontend | React 18, Next.js App Router |
| Langage | TypeScript |
| Style | Tailwind CSS |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + Radix UI |
| State Management | Zustand |
| Formulaires | React Hook Form + Zod |
| Routing | Next.js App Router |
| Icônes | Lucide React |
| Validation | Zod |
| Notifications | `sonner` (via shadcn) |

---

## 📁 Structure du projet

```
cheikh-distribution-frontend/
├── public/               # Images, logos, favicon
├── src/
│   ├── app/              # Routes (Next.js App Router)
│   ├── components/       # Composants UI réutilisables
│   ├── lib/              # Utilitaires, mocks, API
│   ├── stores/           # Zustand (panier, auth)
│   ├── types/            # Types TypeScript
│   ├── hooks/            # Hooks personnalisés
│   └── styles/           # Tailwind
├── .gitignore
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🚀 Démarrage du projet

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/ton-pseudo/cheikh-distribution-frontend.git
   cd cheikh-distribution-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

---

## 🧪 Fonctionnalités en cours / À venir

- 🔐 Authentification (login/register)
- 📱 Application mobile (React Native)
- 🌍 Intégration Google Maps / Leaflet
- 💬 Notifications (SMS/Email)
- 📊 Dashboard admin (stats, rapports)
- 🔄 Synchronisation avec backend API

---

## 📞 Contact

Développé avec ❤️ pour **Cheikh Distribution**.  
Pour toute question ou collaboration, contact :  
📧 contact@cheikhdistribution.sn  
📞 +221 77 XXX XX XX

---

## 📄 Licence

Ce projet est open source à des fins éducatives.  
Tous droits réservés © 2025 Cheikh Distribution.


---

## ✅ Que faire maintenant ?

1. **Copie ce `README.md`** dans la racine de ton projet
2. **Personnalise** :
   - L’email/téléphone
   - Le lien GitHub
   - Ajoute une capture d’écran (`screenshots/`) si tu veux
3. **Commit et pousse** sur GitHub :
   ```bash
   git add .
   git commit -m "feat: ajout README.md"
   git push origin main
   ```

