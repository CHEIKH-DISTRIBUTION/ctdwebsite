# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce platform for **Cheikh Distribution** — a Senegalese wholesale distributor. The app is in **French**, targets Senegalese users, and integrates local mobile payment systems (Wave, Orange Money).

The repository has two independent sub-projects:
- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS
- `backend/` — Node.js + Express 5 + MongoDB + Mongoose

## Commands

### Backend (run from `backend/`)
```bash
npm run server        # Dev server with nodemon (port 5000)
npm run server:prod   # Production (node directly)
npm run seed          # Seed MongoDB with test data
```

### Frontend (run from `frontend/`)
```bash
npm run dev           # Vite dev server (port 3000)
npm run build         # TypeScript check + Vite build → dist/
npm run preview       # Preview production build
npm run lint          # ESLint
```

### Seed Credentials
After `npm run seed`, use:
- Admin: `admin@cheikhdistribution.sn` / `admin123`

## Architecture

### Request Flow
```
React (port 3000) → JWT in headers → Express API (port 5000)
  → Route → Auth/Validation middleware → Controller → MongoDB
  → JSON response: { success: boolean, message: string, data: any }
```

### Backend Structure (`backend/server/`)
- **`server.js`** — Express app bootstrap, middleware stack (Helmet, CORS, rate-limit, body-parser)
- **`config/database.js`** — MongoDB connection
- **`routes/`** — 5 route files: `auth`, `products`, `orders`, `users` (admin), `stats` (admin)
- **`controllers/`** — Business logic: `authController`, `productController`, `orderController`
- **`models/`** — Mongoose schemas: `User`, `Product`, `Order`, `Category`
- **`middleware/auth.js`** — JWT verification + role-based access (`customer` | `admin` | `delivery`)
- **`middleware/validation.js`** — Joi schemas for request validation
- **`middleware/upload.js`** — Multer config for product image uploads → `uploads/`

### Frontend Structure (`frontend/src/`)
- **`App.tsx`** — Root routing and layout
- **`pages/`** — Route-level components: `Home`, `Shop/`, `Product/`, `Cart`, `Checkout`, `Auth/`, `Dashboard/`
- **`components/`** — Organized by domain: `auth/`, `cart/`, `checkout/`, `layout/`, `product/`, `shared/`, `ui/`
- **`ui/`** — Radix UI primitives wrapped as shadcn/ui-style components
- **`hooks/`** — Custom React hooks
- **`lib/`** — Utilities/helpers
- **`types/`** — Shared TypeScript interfaces
- State managed with Context API (no Redux/Zustand)
- Path alias: `@` → `frontend/src/`

### Key Domain Concepts
- **Order lifecycle:** `pending → confirmed → preparing → ready → delivering → delivered` (8-state workflow with history tracking)
- **Payment methods:** Wave, Orange Money, cash on delivery, bank transfer — each with its own status flow
- **Roles:** `customer`, `admin`, `delivery` — enforced both in middleware and UI
- **Phone validation:** Senegalese number formats

### Environment Variables (backend `.env`)
```
NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRE
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
WAVE_API_KEY, WAVE_API_SECRET
ORANGE_MONEY_API_KEY, ORANGE_MONEY_API_SECRET
MAX_FILE_SIZE, UPLOAD_PATH, CLIENT_URL
```

JWT tokens expire after 30 days. Bcrypt uses 12 rounds. Rate limiting: 100 req/IP/15min.


## Architecture Refactor Plan (MANDATORY)

The project must be refactored before adding any new feature.

This is NOT a CRUD application.  
This is an order → payment → delivery workflow system and must follow a domain-driven structure.

No new feature must be implemented until the architecture below is in place.

---

### 1. Development Rule

❌ Do NOT add features directly in controllers  
❌ Do NOT mix business logic with Express routes  
❌ Do NOT call MongoDB models from the frontend logic mindset  
✅ All business logic must live inside UseCases

---

### 2. Target Backend Architecture

The backend must follow this structure:

```bash
src/
 ├── domain/              → Pure business entities (Order, Product, Payment...)
 ├── application/         → UseCases (CreateOrder, ConfirmPayment...)
 ├── infrastructure/      → DB, APIs, external services (Wave, SMS...)
 ├── interfaces/http/     → Express routes/controllers (thin layer only)
 └── config/
```

Controllers must ONLY:
- validate request
- call a UseCase
- return response

---

### 3. UseCase First Strategy

Before creating an API endpoint, always create:

Example:
CreateOrder.usecase.ts

This UseCase handles:
- stock validation
- reservation
- order creation
- payment initialization

No database call is allowed outside repositories.

---

### 4. Repository Pattern Required

Domain must not depend on MongoDB.

Repositories must be implemented in:
infrastructure/repositories/

Example:
OrderRepositoryMongo.ts

---

### 5. Frontend Must Be Feature-Based (NOT Page-Based)

Frontend must be reorganized into:

```bash
src/
 ├── features/
 │    ├── catalog/
 │    ├── cart/
 │    ├── checkout/
 │    ├── delivery-tracking/
 │    └── admin/
 ├── shared/
 │    ├── ui/
 │    ├── api/
 │    └── hooks/
 └── app/
```

Pages must not contain business logic.

---

### 6. Critical Flow to Implement FIRST (MVP Refactor)

Only implement this workflow:

Create Order → Reserve Stock → Persist Order

NO payment integration yet.  
NO delivery assignment yet.

This validates architecture before complexity.

---

### 7. Why This Refactor Is Required

The previous structure was controller-driven and does not protect against:

- overselling stock
- payment inconsistencies
- delivery state corruption
- scaling issues

This refactor ensures the system can support real mobile money workflows used in Senegal.

---

### 8. Development Mindset

This project must now be treated as a logistics platform, not a simple webshop.

Always think in workflows:
Order Lifecycle → Payment Lifecycle → Delivery Lifecycle

Never think in CRUD screens.

## 9. Current Refactor Status (ALREADY IMPLEMENTED — DO NOT REVERT)

The Clean Architecture refactor has been STARTED and must be continued using the new structure.

The following backend structure already exists and is now the source of truth:
```bash
backend/src/
├── domain/
│   ├── entities/
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── repositories/
│   │   ├── IOrderRepository.js
│   │   ├── IProductRepository.js
│   │   └── IPackRepository.js
│   └── errors/
│       └── DomainError.js
│
├── application/
│   └── usecases/order/
│       └── CreateOrder.usecase.js
│
├── infrastructure/
│   └── repositories/
│       ├── OrderRepositoryMongo.js
│       ├── ProductRepositoryMongo.js
│       └── PackRepositoryMongo.js
│
└── interfaces/http/
    ├── controllers/OrderController.js
    └── routes/orders.js  → exposed under /api/v2/orders
```

---

## Migration Rule

Old `/server/` architecture is now **legacy**.

It must NOT receive new code.

Only bug fixes allowed there during migration.

All new development MUST happen inside `/src/`.

---

## 10. API Versioning Strategy

New architecture is exposed under:

```
/api/v2/*
```

v1 routes remain temporarily to avoid breaking the frontend.

Once frontend migration is complete, v1 will be removed.

DO NOT mix v1 and v2 logic.

---

## 11. Stock Protection Mechanism (Critical Business Rule)

Stock reservation is handled using an atomic MongoDB update:

$gte + $inc guard

This prevents overselling without requiring database transactions.

This logic MUST stay inside ProductRepositoryMongo and never be duplicated elsewhere.

---

## 12. Frontend Refactor Is REQUIRED Before Continuing Features

Frontend must now migrate to a feature-based architecture aligned with backend usecases.

Target structure:

```
frontend/src/
├── features/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   └── admin/
│
├── shared/
│   ├── api/        → single HTTP client
│   ├── ui/         → reusable UI components
│   ├── hooks/
│   └── types/
│
└── app/            → routing only
```

---

### Frontend Rule

Frontend must NEVER:

* compute prices
* validate stock
* create order objects manually

Frontend only sends user intent to backend UseCases.

Backend is the single source of truth.

---

## 13. First End-to-End Flow To Validate

Only this flow must be connected now:

UI Checkout → POST /api/v2/orders → CreateOrder.usecase

Do NOT implement:

* Wave integration
* Orange Money
* Delivery tracking
* Notifications

Those will come AFTER architecture validation.

---

## 14. Architectural Goal

The system is being transformed from:

"React app calling CRUD APIs"

into:

"A workflow-driven commerce platform designed for real-world logistics and mobile payments."

All future code must reinforce this separation.