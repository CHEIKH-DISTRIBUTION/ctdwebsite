import { httpClient } from '@/shared/api/httpClient';
import type {
  ProductResponse,
  PaginatedProducts,
  ProductListParams,
} from '@/shared/types/product.types';
import type { PackResponse, PackCategory } from '@/shared/types/pack.types';
import type { OfferResponse } from '@/shared/types/offer.types';

export const catalogApi = {
  /** GET /api/products — paginated, filterable product list */
  getProducts: (params: ProductListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page)                  qs.set('page',     String(params.page));
    if (params.limit)                 qs.set('limit',    String(params.limit));
    if (params.category)              qs.set('category', params.category);
    if (params.search)                qs.set('search',   params.search);
    if (params.minPrice !== undefined) qs.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice));
    if (params.inStock   !== undefined) qs.set('inStock',   String(params.inStock));
    if (params.featured  !== undefined) qs.set('featured',  String(params.featured));
    if (params.sort)                    qs.set('sort',       params.sort);

    const query = qs.toString();
    return httpClient.get<PaginatedProducts>(`/api/products${query ? `?${query}` : ''}`);
  },

  /** GET /api/products/:id — single product */
  getProduct: (id: string) =>
    httpClient.get<{ product: ProductResponse }>(`/api/products/${id}`),

  /** GET /api/packs/:id — single pack detail */
  getPack: (id: string) =>
    httpClient.get<PackResponse>(`/api/packs/${id}`),

  /** GET /api/packs — active packs, optional filters */
  getPacks: (params?: { category?: PackCategory; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category)            qs.set('category', params.category);
    if (params?.featured !== undefined) qs.set('featured', String(params.featured));
    const query = qs.toString();
    return httpClient.get<PackResponse[]>(`/api/packs${query ? `?${query}` : ''}`);
  },

  /** GET /api/offers — active offers (public) */
  getOffers: () =>
    httpClient.get<{ offers: OfferResponse[] }>('/api/offers')
      .then((d) => d.offers),
};
