/**
 * orders.api — fetches order data from the DDD backend.
 */

import { httpClient } from '@/shared/api/httpClient';
import type { OrderResponse, PaginatedOrders, OrderStatus } from '@/shared/types/order.types';

export const ordersApi = {
  /** GET /api/v2/orders/my-orders */
  getMyOrders: (params?: { page?: number; limit?: number; status?: OrderStatus }) => {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set('page',   String(params.page));
    if (params?.limit)  qs.set('limit',  String(params.limit));
    if (params?.status) qs.set('status', params.status);

    const query = qs.toString();
    return httpClient.get<PaginatedOrders>(`/api/v2/orders/my-orders${query ? `?${query}` : ''}`);
  },

  /** GET /api/v2/orders/:id */
  getOrder: (id: string) =>
    httpClient.get<{ order: OrderResponse }>(`/api/v2/orders/${id}`),

  /** PUT /api/orders/:id/rate — rate a delivered order */
  rateOrder: (id: string, payload: { delivery: number; overall: number; comment?: string }) =>
    httpClient.put<void>(`/api/orders/${id}/rate`, payload),

  /** PUT /api/orders/:id/cancel — cancel an order (customer) */
  cancelOrder: (id: string) =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${id}/cancel`, {}),

  /** PUT /api/orders/:id/payment-method — change payment method when payment pending/failed */
  changePaymentMethod: (id: string, paymentMethod: 'wave' | 'orange_money' | 'cash' | 'bank_transfer') =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${id}/payment-method`, { paymentMethod }),
};
