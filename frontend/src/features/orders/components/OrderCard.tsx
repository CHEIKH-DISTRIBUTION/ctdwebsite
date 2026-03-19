'use client';

/**
 * features/orders/components/OrderCard
 *
 * Uses OrderResponse (backend-aligned type).
 * Replaces the legacy components/cards/OrderCard.tsx.
 */

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, MapPin, CreditCard, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderResponse } from '@/shared/types/order.types';

const PAYMENT_LABELS: Record<string, string> = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  cash:          'Livraison',
  bank_transfer: 'Virement',
};

interface OrderCardProps {
  order: OrderResponse;
}

export function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Commande <span className="text-[#001489]">#{order.orderNumber}</span>
            </h3>
            <p className="text-sm text-gray-500">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {expanded ? 'Réduire' : 'Détails'}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Articles</div>
            <div className="font-semibold text-gray-800 text-sm">{order.items.length}</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Total</div>
            <div className="font-semibold text-green-700 text-xs sm:text-sm">{order.total.toLocaleString()} FCFA</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg overflow-hidden">
            <div className="text-xs text-gray-500 mb-1">Paiement</div>
            <div className="font-semibold text-gray-800 text-xs truncate">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              {/* Order items */}
              <h4 className="font-medium text-gray-800 mb-3 text-sm">Articles commandés</h4>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-xs">{item.quantity} × {item.price.toLocaleString()} FCFA</p>
                    </div>
                    <p className="font-semibold text-gray-800">{item.total.toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-1 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{order.subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className={order.deliveryFee === 0 ? 'text-green-600' : ''}>
                    {order.deliveryFee === 0 ? 'Gratuite' : `${order.deliveryFee.toLocaleString()} FCFA`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>{order.total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Delivery address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de livraison
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}{order.deliveryAddress.region ? `, ${order.deliveryAddress.region}` : ''}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Paiement
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    <p>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                    <p className={`capitalize ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/orders/${order._id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Voir les détails complets
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
