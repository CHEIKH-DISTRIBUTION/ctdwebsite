// src/components/cards/OrderCard.tsx
'use client';

import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Download,
  MapPin,
  CreditCard
} from 'lucide-react';
import { useState } from 'react';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        {/* En-tête de la commande */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Commande #{order.id}</h3>
            <p className="text-sm text-gray-500">Passée le {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              {getStatusIcon(order.status)}
              <span className="text-sm font-medium text-gray-700">
                {getStatusText(order.status)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Réduire' : 'Détails'}
            </Button>
          </div>
        </div>

        {/* Informations rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Articles</div>
            <div className="text-lg font-semibold text-gray-800">{order.items.length}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-lg font-semibold text-green-700">{order.total.toLocaleString()} FCFA</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Paiement</div>
            <div className="text-lg font-semibold text-gray-800">{order.paymentMethod}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Livraison</div>
            <div className="text-lg font-semibold text-gray-800">{order.shippingMethod}</div>
          </div>
        </div>

        {/* Détails expansibles */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              {/* Articles de la commande */}
              <h4 className="font-medium text-gray-800 mb-3">Articles commandés</h4>
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity} x {item.product.price.toLocaleString()} FCFA</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{(item.quantity * item.product.price).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informations de livraison et paiement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de livraison
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">{order.shippingAddress.street}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.city}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Paiement
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">{order.paymentMethod}</p>
                    <p className="text-sm text-green-600">Payé le {formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/orders/${order.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Voir les détails
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger la facture
                </Button>
                {order.status === 'delivered' && (
                  <Button size="sm" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Commander à nouveau
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}