/**
 * stores/cartStore.ts — COMPATIBILITY ADAPTER (migration en cours)
 *
 * Pont temporaire pour les composants n'ayant pas encore migré vers
 * features/cart/store/cartStore (ProductCard, page produit).
 *
 * NE PAS ajouter de nouveaux consommateurs ici.
 * Importer directement depuis : @/features/cart/store/cartStore
 */
'use client';

import { useCartStore as useCanonicalCartStore } from '@/features/cart/store/cartStore';
import type { ProductResponse } from '@/shared/types/product.types';

type LegacyProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  quantity?: number;
  stock?: number;
  sku?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  discount?: number;
  originalPrice?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

function toProductResponse(p: LegacyProduct): ProductResponse {
  return {
    _id:         p.id,
    name:        p.name,
    description: p.description ?? '',
    price:       p.price,
    category:    (p.category ?? 'Alimentaire') as ProductResponse['category'],
    images:      [{ url: p.image ?? '/images/placeholder.jpg', isPrimary: true }],
    stock:       p.quantity ?? p.stock ?? 0,
    minStock:    0,
    sku:         p.sku ?? p.id,
    brand:       p.brand,
    isActive:    true,
    isFeatured:  false,
    tags:        [],
    rating:      { average: typeof p.rating === 'number' ? p.rating : 0, count: p.reviewCount ?? 0 },
    createdAt:   '',
    updatedAt:   '',
  };
}

export function useCartStore() {
  const store = useCanonicalCartStore();

  return {
    items:        store.items,
    isDrawerOpen: store.isDrawerOpen,

    addToCart: ({ product, quantity }: { product: LegacyProduct; quantity: number }) => {
      store.addItem(toProductResponse(product), quantity);
    },

    removeFromCart: (productId: string) => store.removeItem(productId),
    updateQuantity: (productId: string, quantity: number) => store.updateQuantity(productId, quantity),
    clearCart:      () => store.clearCart(),
    openDrawer:     () => store.openDrawer(),
    closeDrawer:    () => store.closeDrawer(),

    getTotal:     () => store.getEstimatedTotal(),
    getItemCount: () => store.getItemCount(),
  };
}
