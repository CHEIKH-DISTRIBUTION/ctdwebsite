'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deliveryApi } from '@/features/delivery/api/delivery.api';
import type { OrderResponse } from '@/shared/types/order.types';
import {
  Loader2,
  AlertTriangle,
  MapPin,
  Phone,
  ChevronRight,
  CheckCircle2,
  Truck,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Tab = 'ready' | 'delivering' | 'delivered';

const TAB_CONFIG: Record<Tab, { label: string; emptyLabel: string; color: string }> = {
  ready:      { label: 'À livrer',    emptyLabel: 'Aucune commande en attente',  color: '#F59E0B' },
  delivering: { label: 'En cours',    emptyLabel: 'Aucune livraison en cours',   color: '#3B82F6' },
  delivered:  { label: 'Livrées',     emptyLabel: 'Aucune livraison récente',    color: '#10B981' },
};

function OrderCard({
  order,
  onQuickAction,
  updatingId,
}: {
  order: OrderResponse;
  onQuickAction: (orderId: string, nextStatus: 'delivering' | 'delivered') => void;
  updatingId: string | null;
}) {
  const isUpdating = updatingId === order._id;
  const canPickUp  = order.status === 'ready';
  const canDeliver = order.status === 'delivering';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Top strip */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs font-semibold text-gray-500">{order.orderNumber}</p>
          <p className="font-bold text-gray-800 mt-0.5 truncate">{order.user?.name ?? '—'}</p>
        </div>
        <span className="text-base font-bold text-[#F9461C] flex-shrink-0">
          {order.total.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      {/* Address */}
      <div className="px-4 py-2 flex items-start gap-2 bg-gray-50 border-t border-gray-100">
        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600 min-w-0">
          <p className="font-medium truncate">{order.deliveryAddress.street}</p>
          <p className="text-gray-400 text-xs">
            {order.deliveryAddress.city}
            {order.deliveryAddress.region ? `, ${order.deliveryAddress.region}` : ''}
          </p>
        </div>
      </div>

      {/* Phone */}
      {order.contactInfo?.phone && (
        <div className="px-4 py-2 flex items-center gap-2 border-t border-gray-100">
          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <a
            href={`tel:${order.contactInfo.phone}`}
            className="text-sm font-medium text-[#001489] hover:underline"
          >
            {order.contactInfo.phone}
          </a>
        </div>
      )}

      {/* Date */}
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        Commandé le {format(new Date(order.createdAt), 'dd MMM à HH:mm', { locale: fr })}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        {/* Quick action button */}
        {canPickUp && (
          <Button
            size="sm"
            disabled={isUpdating}
            onClick={() => onQuickAction(order._id, 'delivering')}
            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isUpdating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><Truck className="h-4 w-4 mr-1.5" />Récupéré</>
            }
          </Button>
        )}
        {canDeliver && (
          <Button
            size="sm"
            disabled={isUpdating}
            onClick={() => onQuickAction(order._id, 'delivered')}
            className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {isUpdating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Livré</>
            }
          </Button>
        )}

        {/* Detail link */}
        <Link
          href={`/delivery/orders/${order._id}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#001489] transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
        >
          Détail <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function DeliveryPage() {
  const [tab,        setTab]        = useState<Tab>('ready');
  const [orders,     setOrders]     = useState<OrderResponse[]>([]);
  const [counts,     setCounts]     = useState({ ready: 0, delivering: 0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async (status: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deliveryApi.getOrders(status);
      setOrders(result.orders);
      setCounts(result.counts);
    } catch {
      setError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleQuickAction = async (orderId: string, nextStatus: 'delivering' | 'delivered') => {
    setUpdatingId(orderId);
    const message = nextStatus === 'delivering'
      ? 'Commande récupérée — en cours de livraison'
      : 'Commande livrée avec succès';
    try {
      await deliveryApi.updateStatus(orderId, nextStatus, message);
      toast.success(nextStatus === 'delivering' ? 'Commande récupérée !' : 'Commande livrée !');
      // Remove from current tab list immediately
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      // Refresh counts
      deliveryApi.getOrders(tab).then((r) => setCounts(r.counts)).catch(() => {});
    } catch {
      toast.error('Erreur lors de la mise à jour. Réessayez.');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabKeys = Object.keys(TAB_CONFIG) as Tab[];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
        {tabKeys.map((t) => {
          const cfg     = TAB_CONFIG[t];
          const isActive = tab === t;
          const badge   = t === 'ready' ? counts.ready : t === 'delivering' ? counts.delivering : null;

          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={isActive ? { background: cfg.color } : {}}
            >
              {cfg.label}
              {badge != null && badge > 0 && (
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={() => load(tab)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-300">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Package className="h-14 w-14 text-gray-200" />
          <p className="font-medium">{TAB_CONFIG[tab].emptyLabel}</p>
          <button
            onClick={() => load(tab)}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      )}

      {/* Order cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onQuickAction={handleQuickAction}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
