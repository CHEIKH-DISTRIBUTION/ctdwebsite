'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders.api';
import type { OrderResponse } from '@/shared/types/order.types';

/**
 * useOrder — loads a single order by ID.
 */
export function useOrder(id: string) {
  const [order, setOrder]         = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    ordersApi
      .getOrder(id)
      .then(({ order: o }) => {
        if (!cancelled) setOrder(o);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Commande introuvable');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { order, isLoading, error };
}
