'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';
import { adminApi } from '@/features/admin/api/admin.api';
import type { ProductResponse } from '@/shared/types/product.types';
import { Search, Plus, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 12;

function getProductImage(p: ProductResponse): string {
  return (
    p.images.find((i) => i.isPrimary)?.url ??
    p.images[0]?.url ??
    '/images/placeholder.jpg'
  );
}

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<ProductResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getAllProducts({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
      });
      setProducts(result.products);
      setTotalPages(result.pagination.pages);
    } catch {
      setError('Impossible de charger les produits. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Produit supprimé', { description: name });
    } catch {
      toast.error('Impossible de supprimer le produit. Réessayez.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <Button asChild style={{ background: '#F9461C' }}>
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                     focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15
                     transition-all"
        />
      </div>

      {/* States */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProducts} className="ml-auto">
            Réessayer
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg font-medium">Aucun produit trouvé</p>
          {debouncedSearch && (
            <p className="text-sm mt-1">Essayez une autre recherche.</p>
          )}
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product._id} className="flex flex-col overflow-hidden">
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  {!product.isActive && (
                    <span className="absolute top-2 right-2 bg-gray-800/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Inactif
                    </span>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug line-clamp-2">
                    {product.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-1.5 text-sm">
                  <p>
                    <span className="text-gray-500">Prix :</span>{' '}
                    <span className="font-semibold text-[#F9461C]">
                      {product.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Catégorie :</span>{' '}
                    {product.category}
                  </p>
                  <p>
                    <span className="text-gray-500">Stock :</span>{' '}
                    <span className={product.stock <= product.minStock ? 'text-red-600 font-bold' : 'font-medium'}>
                      {product.stock} unité{product.stock !== 1 ? 's' : ''}
                      {product.stock <= product.minStock && ' ⚠️'}
                    </span>
                  </p>
                  {product.sku && (
                    <p className="text-gray-400 text-xs">SKU : {product.sku}</p>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/admin/products/${product._id}`}>Modifier</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={deletingId === product._id}
                      onClick={() => handleDelete(product._id, product.name)}
                    >
                      {deletingId === product._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Supprimer'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
