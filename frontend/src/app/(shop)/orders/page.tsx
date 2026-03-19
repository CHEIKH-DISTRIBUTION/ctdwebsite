// src/app/(shop)/orders/page.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderCard } from '@/features/orders/components/OrderCard';
import type { OrderStatus } from '@/shared/types/order.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingBag,
  Search,
  ArrowLeft,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Status options aligned with the backend OrderStatus enum
const STATUS_OPTIONS: { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined,    label: 'Tous les statuts' },
  { value: 'pending',    label: 'En attente'       },
  { value: 'confirmed',  label: 'Confirmée'        },
  { value: 'preparing',  label: 'En préparation'   },
  { value: 'ready',      label: 'Prête'            },
  { value: 'delivering', label: 'En livraison'     },
  { value: 'delivered',  label: 'Livrée'           },
  { value: 'cancelled',  label: 'Annulée'          },
];

export default function OrdersPage() {
  const {
    orders,
    pagination,
    isLoading,
    error,
    page,
    statusFilter,
    setPage,
    filterByStatus,
  } = useOrders(10);

  // Empty state (no orders at all, not filtered)
  if (!isLoading && !error && orders.length === 0 && !statusFilter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-12 text-center max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Aucune commande</h1>
            <p className="text-gray-600 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
            <Button asChild className="bg-[#001489] hover:bg-[#001070]">
              <Link href="/products" className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Découvrir nos produits
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes commandes</h1>
              <p className="text-gray-600">Suivez l&apos;état de vos commandes passées</p>
            </div>
            <Button asChild variant="outline" className="border-[#001489] text-[#001489] hover:bg-blue-50">
              <Link href="/products" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continuer mes achats
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8 border"
        >
          <select
            aria-label="Filtrer par statut"
            value={statusFilter ?? ''}
            onChange={(e) => filterByStatus((e.target.value as OrderStatus) || undefined)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001489] w-full sm:w-auto"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value ?? 'all'} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {isLoading
              ? 'Chargement…'
              : `${pagination?.total ?? orders.length} commande${(pagination?.total ?? orders.length) !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
          </div>
        )}

        {/* Empty filtered state */}
        {!isLoading && !error && orders.length === 0 && statusFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border"
          >
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600 mb-4">Essayez un autre filtre</p>
            <Button onClick={() => filterByStatus(undefined)}>
              Voir toutes les commandes
            </Button>
          </motion.div>
        )}

        {/* Order list */}
        {!isLoading && !error && orders.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <OrderCard order={order} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Précédent
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPage(p)}
                    variant={page === p ? 'default' : 'outline'}
                    className={`w-10 h-10 p-0 ${page === p ? 'bg-[#001489] text-white' : ''}`}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                  disabled={page === pagination.pages}
                  variant="outline"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}

        {/* Help section */}
        {!isLoading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Besoin d&apos;aide avec une commande ?
            </h3>
            <p className="text-blue-700 mb-4">
              Notre équipe de support est là pour vous aider avec toutes vos questions.
            </p>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Contacter le support
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
