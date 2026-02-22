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
  Truck,
  Shield,
  Star,
  ShoppingCart,
  Heart,
  Zap,
  Award,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

// Categories must match the ProductCategory enum from the backend model
const mainCategories: { label: string; value: ProductCategory | null; icon: React.ElementType }[] = [
  { label: 'Tous les produits', value: null,               icon: Sparkles   },
  { label: 'Alimentaire',       value: 'Alimentaire',       icon: ShoppingCart },
  { label: 'Électroménager',    value: 'Électroménager',    icon: Zap        },
  { label: 'Hygiène',           value: 'Hygiène',           icon: Award      },
  { label: 'Vêtements',         value: 'Vêtements',         icon: Heart      },
];

const priceRanges = [
  { label: 'Tous les prix',          min: undefined, max: undefined },
  { label: 'Moins de 5 000 FCFA',    min: 0,         max: 5000     },
  { label: '5 000 – 10 000 FCFA',    min: 5000,      max: 10000    },
  { label: '10 000 – 20 000 FCFA',   min: 10000,     max: 20000    },
  { label: 'Plus de 20 000 FCFA',    min: 20000,     max: undefined },
];

const sortOptions: { label: string; value: ProductListParams['sort'] }[] = [
  { label: 'Plus populaires',   value: 'rating'     },
  { label: 'Nouveautés',        value: 'newest'     },
  { label: 'Prix croissant',    value: 'price_asc'  },
  { label: 'Prix décroissant',  value: 'price_desc' },
];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);

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

  const activeCategory = filters.category ?? null;

  const handleCategoryClick = (value: ProductCategory | null) => {
    updateFilter('category', value ?? undefined);
  };

  const handlePriceRange = (index: number) => {
    setPriceRangeIndex(index);
    const { min, max } = priceRanges[index];
    updateFilter('minPrice', min === 0 ? 0 : min);
    updateFilter('maxPrice', max);
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
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#284bcc] to-[#1d3aa3] text-white py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Notre Supermarché</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Découvrez tous nos produits de qualité pour répondre à vos besoins quotidiens
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="container mx-auto px-4 py-6 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {mainCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.value)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                activeCategory === cat.value
                  ? 'bg-[#284bcc] text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <cat.icon className={`h-6 w-6 mb-2 ${activeCategory === cat.value ? 'text-white' : 'text-[#284bcc]'}`} />
              <span className="font-medium text-sm text-center">{cat.label}</span>
              {pagination && activeCategory === cat.value && (
                <span className="text-xs mt-1 text-blue-100">{pagination.total} produits</span>
              )}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Filtres</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#284bcc] hover:text-[#1d3aa3] flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Fourchette de prix</h4>
                <div className="space-y-2">
                  {priceRanges.map((range, idx) => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRangeIndex === idx}
                        onChange={() => handlePriceRange(idx)}
                        className="text-[#284bcc] focus:ring-[#284bcc] mr-2"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                    className="rounded text-[#284bcc] focus:ring-[#284bcc] mr-2"
                  />
                  <span className="text-sm text-gray-700">En stock seulement</span>
                </label>
              </div>

              {/* Promo banner */}
              <div className="bg-gradient-to-r from-[#f9461c] to-[#e03c15] rounded-2xl p-4 text-white text-center">
                <h4 className="font-bold mb-2">Livraison Offerte</h4>
                <p className="text-sm opacity-90">À partir de 50 000 FCFA d&apos;achat</p>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mt-3">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="lg:w-3/4">
            {/* Products header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-gray-600">
                    {isLoading
                      ? 'Chargement…'
                      : `${pagination?.total ?? 0} produit${(pagination?.total ?? 0) !== 1 ? 's' : ''} trouvé${(pagination?.total ?? 0) !== 1 ? 's' : ''}`
                    }
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {mainCategories.find((c) => c.value === activeCategory)?.label ?? 'Tous les produits'}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  {/* View toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#284bcc] shadow-sm' : 'text-gray-500'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#284bcc] shadow-sm' : 'text-gray-500'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    title="Trier par"
                    value={filters.sort ?? 'rating'}
                    onChange={(e) => updateFilter('sort', e.target.value as ProductListParams['sort'])}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#284bcc]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-sm underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-[#284bcc]" />
              </div>
            )}

            {/* Product grid */}
            {!isLoading && !error && (
              <>
                {products.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-12 text-center"
                  >
                    <div className="text-gray-300 mb-4">
                      <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou votre recherche</p>
                    <Button onClick={handleClearFilters} className="bg-[#284bcc] hover:bg-[#1d3aa3] px-6">
                      Réinitialiser les filtres
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
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
                            className={`w-10 h-10 p-0 ${
                              page === p ? 'bg-[#284bcc] text-white' : 'border-gray-300 text-gray-700'
                            }`}
                          >
                            {p}
                          </Button>
                        ))}

                        <Button
                          onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                          disabled={page === pagination.pages}
                          variant="outline"
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

            {/* Benefits banners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-r from-[#284bcc] to-[#1d3aa3] text-white rounded-2xl p-6 flex items-center">
                <Truck className="h-8 w-8 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Livraison Rapide</h4>
                  <p className="text-sm opacity-90">Sous 24h à Dakar</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#f9461c] to-[#e03c15] text-white rounded-2xl p-6 flex items-center">
                <Shield className="h-8 w-8 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Paiement Sécurisé</h4>
                  <p className="text-sm opacity-90">Wave, Orange Money, Virement</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#f6c700] to-[#d4b000] text-white rounded-2xl p-6 flex items-center">
                <Star className="h-8 w-8 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Qualité Garantie</h4>
                  <p className="text-sm opacity-90">Produits certifiés</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
