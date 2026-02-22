import { httpClient } from '@/shared/api/httpClient';
import type { OrderResponse, OrderStatus } from '@/shared/types/order.types';

type DeliveryOrdersResult = {
  orders: OrderResponse[];
  counts: { ready: number; delivering: number };
};

export const deliveryApi = {
  /** GET /api/orders/delivery — returns ready + delivering + (optionally) delivered orders */
  getOrders: (status?: 'ready' | 'delivering' | 'delivered') => {
    const qs = status ? `?status=${status}` : '';
    return httpClient.get<DeliveryOrdersResult>(`/api/orders/delivery${qs}`);
  },

  /** PUT /api/orders/:id/status — update order status (delivery role authorised) */
  updateStatus: (orderId: string, status: OrderStatus, message?: string) =>
    httpClient.put<{ order: OrderResponse }>(`/api/orders/${orderId}/status`, {
      status,
      message,
    }),
};
