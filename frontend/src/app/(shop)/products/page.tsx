// src/app/(shop)/products/page.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductCategory, ProductListParams } from '@/shared/types/product.types';
import {
  Grid,
  List,
  Search,
  X,
  Sparkles,
  ShoppingCart,
  Heart,
  Zap,
  Award,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Categories must match the ProductCategory enum from the backend model
const mainCategories: { label: string; value: ProductCategory | null; icon: React.ElementType }[] = [
  { label: 'Tous',          value: null,               icon: Sparkles   },
  { label: 'Alimentaire',   value: 'Alimentaire',       icon: ShoppingCart },
  { label: 'Électroménager', value: 'Électroménager',   icon: Zap        },
  { label: 'Hygiène',       value: 'Hygiène',           icon: Award      },
  { label: 'Vêtements',     value: 'Vêtements',         icon: Heart      },
];

const priceRanges = [
  { label: 'Tous les prix',        min: undefined, max: undefined },
  { label: '< 5 000',             min: 0,         max: 5000     },
  { label: '5 000 – 10 000',      min: 5000,      max: 10000    },
  { label: '10 000 – 20 000',     min: 10000,     max: 20000    },
  { label: '> 20 000',            min: 20000,     max: undefined },
];

const sortOptions: { label: string; value: ProductListParams['sort'] }[] = [
  { label: 'Plus populaires',  value: 'rating'     },
  { label: 'Nouveautés',       value: 'newest'     },
  { label: 'Prix croissant',   value: 'price_asc'  },
  { label: 'Prix décroissant', value: 'price_desc' },
];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [priceOpen, setPriceOpen] = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);

  const {
    products,
    pagination,
    isLoading,
    error,
    page,
    filters,
    setPage,
    updateFilter,
    clearFilters,
  } = useCatalog(12);

  // Close price dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCategory = filters.category ?? null;

  const handleCategoryClick = (value: ProductCategory | null) => {
    updateFilter('category', value ?? undefined);
  };

  const handlePriceRange = (index: number) => {
    setPriceRangeIndex(index);
    const { min, max } = priceRanges[index];
    updateFilter('minPrice', min === 0 ? 0 : min);
    updateFilter('maxPrice', max);
    setPriceOpen(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setPriceRangeIndex(0);
  };

  const hasActiveFilters =
    !!filters.category ||
    filters.inStock ||
    priceRangeIndex !== 0 ||
    !!filters.search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-[#001489] text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Notre Catalogue</h1>
          <p className="text-blue-200 text-sm mt-1">
            Découvrez tous nos produits de qualité
          </p>
        </div>
      </div>

      {/* ── Search + filters bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 pr-10 border-gray-200 rounded-xl h-10 focus:border-[#001489] focus:ring-[#001489]/20"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category chips */}
            {mainCategories.map((cat) => {
              const active = activeCategory === cat.value;
              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#001489] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

            {/* Price dropdown */}
            <div className="relative" ref={priceRef}>
              <button
                onClick={() => setPriceOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  priceRangeIndex !== 0
                    ? 'border-[#001489] text-[#001489] bg-[#001489]/5'
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {priceRanges[priceRangeIndex].label}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {priceOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRange(idx)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        priceRangeIndex === idx ? 'font-semibold text-[#001489]' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* In stock toggle */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-all select-none">
              <input
                type="checkbox"
                checked={!!filters.inStock}
                onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                className="rounded text-[#001489] focus:ring-[#001489] w-3.5 h-3.5"
              />
              En stock
            </label>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-[#F9461C] hover:bg-[#F9461C]/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Effacer
              </button>
            )}

            {/* Spacer + sort + view */}
            <div className="ml-auto flex items-center gap-2">
              <select
                title="Trier par"
                value={filters.sort ?? 'rating'}
                onChange={(e) => updateFilter('sort', e.target.value as ProductListParams['sort'])}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#001489] text-gray-700"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#001489] shadow-sm' : 'text-gray-500'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#001489] shadow-sm' : 'text-gray-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 py-6">
        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          {!isLoading && (
            <span>{pagination?.total ?? 0} produit{(pagination?.total ?? 0) !== 1 ? 's' : ''} trouvé{(pagination?.total ?? 0) !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={handleClearFilters} className="ml-auto text-sm underline hover:no-underline">
              Réessayer
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
          </div>
        )}

        {/* Products */}
        {!isLoading && !error && (
          <>
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm p-12 text-center"
              >
                <Search className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou votre recherche</p>
                <Button onClick={handleClearFilters} className="bg-[#001489] hover:bg-[#001070] px-6">
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8'
                      : 'space-y-4 mb-8'
                  }
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <ProductCard product={product} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mb-8">
                    <Button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Précédent
                    </Button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        onClick={() => setPage(p)}
                        variant={page === p ? 'default' : 'outline'}
                        size="sm"
                        className={`w-9 h-9 p-0 ${
                          page === p ? 'bg-[#001489] text-white' : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {p}
                      </Button>
                    ))}

                    <Button
                      onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                      disabled={page === pagination.pages}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Suivant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
