'use client';

import { useState, useEffect, useCallback } from 'react';
import { catalogApi } from '../api/catalog.api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { ProductResponse, ProductCategory, ProductListParams } from '@/shared/types/product.types';

type Filters = {
  category?: ProductCategory;
  search: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductListParams['sort'];
};

type Pagination = {
  current: number;
  pages: number;
  total: number;
  limit: number;
};

/**
 * useCatalog — manages the product listing page state.
 *
 * Handles fetching, filtering, searching, and pagination.
 * Pages stay thin by delegating all catalog logic here.
 */
export function useCatalog(initialLimit = 12) {
  const [products, setProducts]       = useState<ProductResponse[]>([]);
  const [pagination, setPagination]   = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [filters, setFilters]         = useState<Filters>({ search: '' });

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await catalogApi.getProducts({
        page,
        limit:    initialLimit,
        category: filters.category,
        search:   debouncedSearch || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock:  filters.inStock,
        sort:     filters.sort,
      });

      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, filters.category, debouncedSearch, filters.minPrice, filters.maxPrice, filters.inStock, filters.sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever filters change
  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setFilters({ search: '' });
  }, []);

  return {
    products,
    pagination,
    isLoading,
    error,
    page,
    filters,
    setPage,
    updateFilter,
    clearFilters,
    refetch: fetchProducts,
  };
}
