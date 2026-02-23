import { httpClient } from '@/shared/api/httpClient';
import type { ProductResponse } from '@/shared/types/product.types';

export const favoritesApi = {
  /** GET /api/favorites — returns the user's populated favorite products */
  getFavorites: () =>
    httpClient.get<{ favorites: ProductResponse[] }>('/api/favorites'),

  /** POST /api/favorites/:id — toggles a product in/out of favorites */
  toggleFavorite: (productId: string) =>
    httpClient.post<{ isFavorite: boolean; favoriteIds: string[] }>(
      `/api/favorites/${productId}`,
      {}
    ),
};
