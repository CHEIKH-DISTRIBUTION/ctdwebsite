'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/features/admin/api/admin.api';
import type { ProductResponse } from '@/shared/types/product.types';
import { AlertTriangle, CheckCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StockAlertsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all products (max 200) then filter client-side for low stock
      const result = await adminApi.getAllProducts({ limit: 200 });
      const low = result.products.filter((p) => p.stock <= p.minStock);
      setProducts(low);
    } catch {
      setError('Impossible de charger les données de stock.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLowStock(); }, [fetchLowStock]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock & Alertes</h1>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLowStock} className="ml-auto">
            Réessayer
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-6">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Aucune alerte de stock</p>
            <p className="text-sm text-green-600 mt-0.5">Tous les produits ont un stock suffisant.</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-800">
              {products.length} produit{products.length > 1 ? 's' : ''} en alerte de stock
            </h2>
          </div>
          <div className="divide-y divide-red-100">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-4 px-6 py-4 hover:bg-red-100/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category} · SKU: {p.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-red-600">{p.stock} unité{p.stock !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">Min: {p.minStock}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                  <Link href={`/admin/products/${p._id}`}>Modifier</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
