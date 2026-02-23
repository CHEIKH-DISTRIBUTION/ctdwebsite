import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesApi } from '../api/favorites.api';
import type { ProductResponse } from '@/shared/types/product.types';

/**
 * Module-level generation counter.
 * Incremented before every toggle API call.
 * fetchFavorites captures the counter at start; if the counter changed while
 * the request was in flight, it means a toggle happened → don't overwrite ids.
 */
let _toggleGen = 0;

interface FavoritesState {
  /** Product IDs — persisted locally for instant isFavorite() checks */
  ids: string[];
  /** Populated products — loaded lazily for the account wishlist page */
  products: ProductResponse[];
  isLoadingProducts: boolean;

  isFavorite:     (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  clear:          () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids:               [],
      products:          [],
      isLoadingProducts: false,

      isFavorite: (productId) => get().ids.includes(productId),

      toggleFavorite: async (productId) => {
        _toggleGen++; // Invalidate any in-flight fetchFavorites
        const wasIn = get().ids.includes(productId);

        // Optimistic update
        set((s) => ({
          ids:      wasIn ? s.ids.filter((id) => id !== productId) : [...s.ids, productId],
          products: wasIn ? s.products.filter((p) => p._id !== productId) : s.products,
        }));

        try {
          const { favoriteIds } = await favoritesApi.toggleFavorite(productId);
          // Reconcile with server truth
          set({ ids: favoriteIds });
        } catch {
          // Revert optimistic update on network/server error
          set((s) => ({
            ids: wasIn
              ? [...s.ids, productId]
              : s.ids.filter((id) => id !== productId),
          }));
        }
      },

      fetchFavorites: async () => {
        set({ isLoadingProducts: true });
        const genAtStart = _toggleGen;
        try {
          const { favorites } = await favoritesApi.getFavorites();
          set((s) => ({
            products: favorites,
            isLoadingProducts: false,
            // Only overwrite ids if no toggle happened while we were fetching.
            // If a toggle fired mid-flight, the toggle's result is more up-to-date.
            ...(genAtStart === _toggleGen
              ? { ids: favorites.map((p) => p._id) }
              : {}),
          }));
        } catch {
          set({ isLoadingProducts: false });
        }
      },

      clear: () => set({ ids: [], products: [] }),
    }),
    {
      name:       'cheikh-favorites',
      partialize: (s) => ({ ids: s.ids }), // only persist IDs, not full product objects
    }
  )
);
