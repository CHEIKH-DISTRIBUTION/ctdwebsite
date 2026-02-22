'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin.api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { ProductResponse } from '@/shared/types/product.types';

type Pagination = { current: number; pages: number; total: number; limit: number };

/**
 * useAdminProducts — admin product list with search and pagination.
 */
export function useAdminProducts(initialLimit = 20) {
  const [products, setProducts]     = useState<ProductResponse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getAllProducts({
        page,
        limit: initialLimit,
        search: debouncedSearch || undefined,
      });
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement produits');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateSearch = useCallback((q: string) => { setPage(1); setSearch(q); }, []);

  return {
    products, pagination, isLoading, error,
    page, search, setPage, updateSearch,
    refetch: fetchProducts,
  };
}
