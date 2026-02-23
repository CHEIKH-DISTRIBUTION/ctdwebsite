import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesApi } from '../api/favorites.api';
import type { ProductResponse } from '@/shared/types/product.types';

interface FavoritesState {
  /** Product IDs — persisted locally for instant isFavorite() checks */
  ids: string[];
  /** Populated products — loaded lazily for the account wishlist page */
  products: ProductResponse[];
  isLoadingProducts: boolean;

  isFavorite:      (productId: string) => boolean;
  toggleFavorite:  (productId: string) => Promise<void>;
  fetchFavorites:  () => Promise<void>;
  clear:           () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids:               [],
      products:          [],
      isLoadingProducts: false,

      isFavorite: (productId) => get().ids.includes(productId),

      toggleFavorite: async (productId) => {
        // Optimistic update
        const wasIn = get().ids.includes(productId);
        set((s) => ({
          ids:      wasIn ? s.ids.filter((id) => id !== productId) : [...s.ids, productId],
          products: wasIn ? s.products.filter((p) => p._id !== productId) : s.products,
        }));

        try {
          const { favoriteIds } = await favoritesApi.toggleFavorite(productId);
          // Reconcile with server truth
          set({ ids: favoriteIds });
        } catch {
          // Revert on failure
          set((s) => ({
            ids: wasIn ? [...s.ids, productId] : s.ids.filter((id) => id !== productId),
          }));
        }
      },

      fetchFavorites: async () => {
        set({ isLoadingProducts: true });
        try {
          const { favorites } = await favoritesApi.getFavorites();
          set({
            products: favorites,
            ids:      favorites.map((p) => p._id),
          });
        } catch {
          // Silently fail — ids from localStorage are still usable
        } finally {
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
