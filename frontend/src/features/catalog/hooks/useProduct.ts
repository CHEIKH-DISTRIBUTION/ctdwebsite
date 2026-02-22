'use client';

import { useState, useEffect } from 'react';
import { catalogApi } from '../api/catalog.api';
import type { ProductResponse } from '@/shared/types/product.types';

/**
 * useProduct — loads a single product by ID.
 */
export function useProduct(id: string) {
  const [product, setProduct]   = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    catalogApi
      .getProduct(id)
      .then(({ product: p }) => {
        if (!cancelled) setProduct(p);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Produit introuvable');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, isLoading, error };
}
