'use client';

/**
 * useCart — public hook for cart operations.
 *
 * Components import this instead of useCartStore directly,
 * so the underlying store can change without touching every component.
 */

import { useCartStore } from '../store/cartStore';
import type { ProductResponse } from '@/shared/types/product.types';

export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getEstimatedTotal,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  } = useCartStore();

  const isInCart = (productId: string) =>
    items.some((i) => i.product._id === productId);

  const getQuantity = (productId: string) =>
    items.find((i) => i.product._id === productId)?.quantity ?? 0;

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getQuantity,
    itemCount:      getItemCount(),
    estimatedTotal: getEstimatedTotal(),
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
}
