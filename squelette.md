cheikh-distribution-frontend/
├── public/
│   ├── images/             # Logos, illustrations, produits
│   ├── icons/              # SVG ou PNG d'icônes (Wave, OM, etc.)
│   └── favicon.ico
│
├── src/
│   ├── app/                # Routes avec App Router (Next.js)
│   │   ├── (auth)/         # Pages d'authentification
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (shop)/         # Espace client
│   │   │   ├── page.tsx     # Accueil (Home)
│   │   │   ├── products/[id]/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── (admin)/        # Dashboard admin
│   │   │   ├── page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── promotions/page.tsx
│   │   │
│   │   ├── (deliverer)/    # Espace livreur
│   │   │   ├── page.tsx
│   │   │   ├── missions/page.tsx
│   │   │   └── tracking/page.tsx
│   │   │
│   │   ├── layout.tsx      # Layout global
│   │   ├── components/     # Layouts spécifiques (header, footer)
│   │   └── loading.tsx     # Écran de chargement global
│   │
│   ├── components/
│   │   ├── ui/             # Composants shadcn (button, card, input, etc.)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── UserCard.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── AddressForm.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── delivery/
│   │   │   ├── DeliveryMap.tsx
│   │   │   └── TrackingTimeline.tsx
│   │   │
│   │   └── PaymentMethodSelector.tsx
│   │
│   ├── lib/
│   │   ├── api.ts          # Axios ou fetch client
│   │   ├── utils.ts        # Fonctions helpers (formatPrice, etc.)
│   │   └── validators/     # Schémas Zod (ex: loginSchema.ts)
│   │       ├── loginSchema.ts
│   │       ├── registerSchema.ts
│   │       └── checkoutSchema.ts
│   │
│   ├── stores/
│   │   ├── cartStore.ts    # Zustand store pour le panier
│   │   ├── authStore.ts    # Zustand store pour l’auth
│   │   └── productStore.ts # Zustand store pour les produits (optionnel)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts      # Hook custom pour l’auth
│   │   ├── useCart.ts      # Pour manipuler le panier
│   │   └── useToast.ts     # Pour afficher des notifications
│   │
│   ├── types/
│   │   ├── index.ts        # Types globaux
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── CartItem.ts
│   │   └── Delivery.ts
│   │
│   ├── styles/
│   │   └── globals.css     # Contient @tailwind directives
│   │
│   └── constants/
│       └── routes.ts       # Constantes pour les chemins (ex: ADMIN_DASHBOARD = "/admin")
│
├── .gitignore
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
└── README.md