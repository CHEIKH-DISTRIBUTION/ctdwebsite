import { httpClient } from '@/shared/api/httpClient';
import type { PaginatedOrders, OrderStatus, OrderResponse } from '@/shared/types/order.types';
import type { PaginatedProducts, ProductResponse } from '@/shared/types/product.types';
import type { OfferResponse } from '@/shared/types/offer.types';
import type { PackResponse, PackCategory } from '@/shared/types/pack.types';
import type { UserResponse, UserRole } from '@/shared/types/user.types';

export type CouponResponse = {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  isActive: boolean;
  createdAt: string;
};

type PaginatedUsers = {
  users: UserResponse[];
  pagination: { current: number; pages: number; total: number; limit: number };
};

export const adminApi = {
  // ── Orders ────────────────────────────────────────────────────────────────

  /** GET /api/v2/orders/admin/all */
  getAllOrders: (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page)      qs.set('page',      String(params.page));
    if (params?.limit)     qs.set('limit',     String(params.limit));
    if (params?.status)    qs.set('status',    params.status);
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate)   qs.set('endDate',   params.endDate);

    const query = qs.toString();
    return httpClient.get<PaginatedOrders>(`/api/v2/orders/admin/all${query ? `?${query}` : ''}`);
  },

  /** GET /api/v2/orders/:id — detail (admin can access any order) */
  getOrderById: (id: string) =>
    httpClient.get<{ order: OrderResponse }>(`/api/v2/orders/${id}`)
      .then((d) => d.order),

  /** PUT /api/orders/:id/status */
  updateOrderStatus: (id: string, status: OrderStatus, message?: string) =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${id}/status`, { status, message }),

  // ── Products ──────────────────────────────────────────────────────────────

  /** GET /api/products — admin view (all products including inactive) */
  getAllProducts: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set('page',  String(params.page));
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);

    const query = qs.toString();
    return httpClient.get<PaginatedProducts>(`/api/products${query ? `?${query}` : ''}`);
  },

  /** GET /api/products/:id */
  getProductById: (id: string) =>
    httpClient.get<{ product: ProductResponse }>(`/api/products/${id}`)
      .then((d) => d.product),

  /** POST /api/products — multipart/form-data (includes image files) */
  createProduct: (data: FormData) =>
    httpClient.postForm<{ product: ProductResponse }>('/api/products', data)
      .then((d) => d.product),

  /** PUT /api/products/:id — multipart/form-data */
  updateProduct: (id: string, data: FormData) =>
    httpClient.putForm<{ product: ProductResponse }>(`/api/products/${id}`, data)
      .then((d) => d.product),

  /** DELETE /api/products/:id */
  deleteProduct: (id: string) =>
    httpClient.delete<{ message: string }>(`/api/products/${id}`),

  // ── Offers ────────────────────────────────────────────────────────────────

  /** GET /api/offers?all=true — admin view (active + inactive) */
  getOffers: () =>
    httpClient.get<{ offers: OfferResponse[] }>('/api/offers?all=true')
      .then((d) => d.offers),

  /** GET /api/offers/:id */
  getOfferById: (id: string) =>
    httpClient.get<{ offer: OfferResponse }>(`/api/offers/${id}`)
      .then((d) => d.offer),

  /** POST /api/offers */
  createOffer: (data: Partial<OfferResponse>) =>
    httpClient.post<{ offer: OfferResponse }>('/api/offers', data)
      .then((d) => d.offer),

  /** PUT /api/offers/:id */
  updateOffer: (id: string, data: Partial<OfferResponse>) =>
    httpClient.put<{ offer: OfferResponse }>(`/api/offers/${id}`, data)
      .then((d) => d.offer),

  /** DELETE /api/offers/:id */
  deleteOffer: (id: string) =>
    httpClient.delete<{ message: string }>(`/api/offers/${id}`),

  // ── Users ─────────────────────────────────────────────────────────────────

  /** POST /api/users — create user (admin) */
  createUser: (data: { name: string; email: string; password: string; phone?: string; role: UserRole }) =>
    httpClient.post<UserResponse>('/api/users', data),

  /** GET /api/users — admin list with pagination + filters */
  getUsers: (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.page)              qs.set('page',     String(params.page));
    if (params?.limit)             qs.set('limit',    String(params.limit));
    if (params?.role)              qs.set('role',     params.role);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    const query = qs.toString();
    return httpClient.get<PaginatedUsers>(`/api/users${query ? `?${query}` : ''}`);
  },

  /** PUT /api/users/:id/role */
  updateUserRole: (id: string, role: UserRole) =>
    httpClient.put<{ user: UserResponse }>(`/api/users/${id}/role`, { role })
      .then((d) => d.user),

  /** PUT /api/users/:id/activate */
  activateUser: (id: string) =>
    httpClient.put<{ user: UserResponse }>(`/api/users/${id}/activate`, {})
      .then((d) => d.user),

  /** PUT /api/users/:id/deactivate */
  deactivateUser: (id: string) =>
    httpClient.put<{ user: UserResponse }>(`/api/users/${id}/deactivate`, {})
      .then((d) => d.user),

  // ── Orders (extra admin actions) ──────────────────────────────────────────

  /** PUT /api/orders/:id/confirm-payment — mark bank transfer as received */
  confirmPayment: (id: string) =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${id}/confirm-payment`, {}),

  /** PUT /api/orders/:id/assign-delivery */
  assignDelivery: (id: string, deliveryPersonId: string | null) =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${id}/assign-delivery`, {
      deliveryPersonId,
    }).then((d) => d.order),

  // ── Packs ─────────────────────────────────────────────────────────────────

  /** GET /api/packs/admin/all — all non-custom packs (including inactive) */
  getAllPacks: () =>
    httpClient.get<PackResponse[]>('/api/packs/admin/all'),

  /** POST /api/packs */
  createPack: (data: {
    name: string;
    description?: string;
    items: { product: string; quantity: number }[];
    discount?: number;
    category?: PackCategory;
    isFeatured?: boolean;
  }) => httpClient.post<PackResponse>('/api/packs', data),

  /** PUT /api/packs/:id */
  updatePack: (id: string, data: Partial<{
    name: string;
    description: string;
    items: { product: string; quantity: number }[];
    discount: number;
    category: PackCategory;
    isFeatured: boolean;
    isActive: boolean;
  }>) => httpClient.put<PackResponse>(`/api/packs/${id}`, data),

  /** DELETE /api/packs/:id */
  deletePack: (id: string) =>
    httpClient.delete<{ message: string }>(`/api/packs/${id}`),

  // ── Coupons ──────────────────────────────────────────────────────────────

  /** GET /api/coupons */
  getCoupons: () =>
    httpClient.get<CouponResponse[]>('/api/coupons'),

  /** POST /api/coupons */
  createCoupon: (data: Partial<CouponResponse>) =>
    httpClient.post<CouponResponse>('/api/coupons', data),

  /** PUT /api/coupons/:id */
  updateCoupon: (id: string, data: Partial<CouponResponse>) =>
    httpClient.put<CouponResponse>(`/api/coupons/${id}`, data),

  /** DELETE /api/coupons/:id */
  deleteCoupon: (id: string) =>
    httpClient.delete<{ message: string }>(`/api/coupons/${id}`),
};
