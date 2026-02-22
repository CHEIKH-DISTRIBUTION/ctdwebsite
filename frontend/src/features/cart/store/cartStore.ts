'use client';

/**
 * features/cart/store/cartStore — canonical cart store.
 *
 * Supports both individual products and pre-built packs.
 * The legacy stores/cartStore.ts re-exports from here.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductResponse } from '@/shared/types/product.types';
import type { PackResponse } from '@/shared/types/pack.types';

export type CartItem = {
  product:  ProductResponse;
  quantity: number;
};

export type CartPackItem = {
  pack:     PackResponse;
  quantity: number;
};

interface CartStore {
  items:      CartItem[];
  packItems:  CartPackItem[];
  isDrawerOpen: boolean;

  // Product actions
  addItem:        (product: ProductResponse, quantity?: number) => void;
  removeItem:     (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;

  // Pack actions
  addPack:            (pack: PackResponse, quantity?: number) => void;
  removePack:         (packId: string) => void;
  updatePackQuantity: (packId: string, quantity: number) => void;

  clearCart:   () => void;
  openDrawer:  () => void;
  closeDrawer: () => void;

  // Derived — display only; pricing is confirmed by backend on order creation
  getItemCount:      () => number;
  getEstimatedTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:        [],
      packItems:    [],
      isDrawerOpen: false,

      // ── Products ───────────────────────────────────────────────────────────

      addItem: (product, quantity = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.product._id === product._id);
          if (idx > -1) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
            return { items: updated, isDrawerOpen: true };
          }
          return { items: [...state.items, { product, quantity }], isDrawerOpen: true };
        }),

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) { get().removeItem(productId); return; }
        set({
          items: get().items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          ),
        });
      },

      // ── Packs ─────────────────────────────────────────────────────────────

      addPack: (pack, quantity = 1) =>
        set((state) => {
          const idx = state.packItems.findIndex((i) => i.pack._id === pack._id);
          if (idx > -1) {
            const updated = [...state.packItems];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
            return { packItems: updated, isDrawerOpen: true };
          }
          return { packItems: [...state.packItems, { pack, quantity }], isDrawerOpen: true };
        }),

      removePack: (packId) =>
        set({ packItems: get().packItems.filter((i) => i.pack._id !== packId) }),

      updatePackQuantity: (packId, quantity) => {
        if (quantity < 1) { get().removePack(packId); return; }
        set({
          packItems: get().packItems.map((i) =>
            i.pack._id === packId ? { ...i, quantity } : i
          ),
        });
      },

      // ── Shared ────────────────────────────────────────────────────────────

      clearCart: () => set({ items: [], packItems: [] }),

      openDrawer:  () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0) +
        get().packItems.reduce((sum, i) => sum + i.quantity, 0),

      // Estimated only — backend is the source of truth for final total
      getEstimatedTotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) +
        get().packItems.reduce((sum, i) => sum + i.pack.price * i.quantity, 0),
    }),
    {
      name: 'cheikh-cart-v2',
      partialize: (state) => ({ items: state.items, packItems: state.packItems }),
    }
  )
);
