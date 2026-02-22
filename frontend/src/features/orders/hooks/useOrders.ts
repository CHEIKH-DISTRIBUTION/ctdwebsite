'use client';

import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders.api';
import type { OrderResponse, OrderStatus } from '@/shared/types/order.types';

type Pagination = { current: number; pages: number; total: number; limit: number };

/**
 * useOrders — fetches the authenticated user's order list.
 */
export function useOrders(initialLimit = 10) {
  const [orders, setOrders]         = useState<OrderResponse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ordersApi.getMyOrders({
        page,
        limit:  initialLimit,
        status: statusFilter,
      });

      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filterByStatus = useCallback((status: OrderStatus | undefined) => {
    setPage(1);
    setStatusFilter(status);
  }, []);

  return {
    orders,
    pagination,
    isLoading,
    error,
    page,
    statusFilter,
    setPage,
    filterByStatus,
    refetch: fetchOrders,
  };
}
