'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin.api';
import type { OrderResponse, OrderStatus } from '@/shared/types/order.types';

type Filters = { status?: OrderStatus; startDate?: string; endDate?: string };
type Pagination = { current: number; pages: number; total: number; limit: number };

/**
 * useAdminOrders — admin order list with status filter and date range.
 */
export function useAdminOrders(initialLimit = 20) {
  const [orders, setOrders]         = useState<OrderResponse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [filters, setFilters]       = useState<Filters>({});

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getAllOrders({ page, limit: initialLimit, ...filters });
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement commandes');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus, message?: string) => {
      await adminApi.updateOrderStatus(orderId, status, message);
      await fetchOrders();
    },
    [fetchOrders]
  );

  return {
    orders, pagination, isLoading, error,
    page, filters, setPage,
    setFilters: (f: Partial<Filters>) => { setPage(1); setFilters((prev) => ({ ...prev, ...f })); },
    updateStatus,
    refetch: fetchOrders,
  };
}
