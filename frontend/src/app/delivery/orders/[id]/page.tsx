'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { deliveryApi } from '@/features/delivery/api/delivery.api';
import { ordersApi } from '@/features/orders/api/orders.api';
import type { OrderResponse } from '@/shared/types/order.types';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  MapPin,
  Phone,
  Package,
  Truck,
  CheckCircle2,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête à livrer',
  delivering: 'En cours de livraison',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  refunded:   'Remboursée',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ready:      { bg: '#FEF3C7', color: '#92400E' },
  delivering: { bg: '#DBEAFE', color: '#1E40AF' },
  delivered:  { bg: '#D1FAE5', color: '#065F46' },
};

export default function DeliveryOrderDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [order,     setOrder]     = useState<OrderResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [updating,  setUpdating]  = useState(false);
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    ordersApi.getOrder(id)
      .then((d) => setOrder(d.order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (nextStatus: 'delivering' | 'delivered') => {
    if (!order) return;
    setUpdating(true);
    const message = nextStatus === 'delivering'
      ? noteInput.trim() || 'Commande récupérée — en cours de livraison'
      : noteInput.trim() || 'Commande livrée avec succès';
    try {
      const result = await deliveryApi.updateStatus(order._id, nextStatus, message);
      setOrder(result.order);
      setNoteInput('');
      toast.success(
        nextStatus === 'delivering' ? 'Statut : En cours de livraison' : 'Statut : Livrée !',
        { duration: 3000 }
      );
      if (nextStatus === 'delivered') {
        setTimeout(() => router.push('/delivery'), 1800);
      }
    } catch {
      toast.error('Impossible de mettre à jour le statut. Réessayez.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !order) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
        <p className="text-gray-700 font-semibold">Commande introuvable</p>
        <Button asChild variant="outline">
          <Link href="/delivery">← Retour</Link>
        </Button>
      </div>
    );
  }

  const sc          = STATUS_COLORS[order.status] ?? { bg: '#F3F4F6', color: '#374151' };
  const canPickUp   = order.status === 'ready';
  const canDeliver  = order.status === 'delivering';
  const totalItems  = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-5 pb-10">

      {/* ── Back + header ── */}
      <div>
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux livraisons
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: sc.bg, color: sc.color }}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Commandée le {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
        </p>
      </div>

      {/* ── Delivery address — most important info ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Adresse de livraison
        </h2>
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-800">{order.deliveryAddress.street}</p>
          <p className="text-gray-600">
            {order.deliveryAddress.city}
            {order.deliveryAddress.region ? `, ${order.deliveryAddress.region}` : ''}
          </p>
          {order.deliveryAddress.instructions && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              {order.deliveryAddress.instructions}
            </p>
          )}
        </div>
      </section>

      {/* ── Customer contact ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <User className="h-4 w-4" />
          Client
        </h2>
        <p className="font-semibold text-gray-800">{order.user?.name ?? '—'}</p>
        {order.contactInfo?.phone && (
          <a
            href={`tel:${order.contactInfo.phone}`}
            className="flex items-center gap-2 text-[#001489] font-medium hover:underline"
          >
            <Phone className="h-4 w-4" />
            {order.contactInfo.phone}
          </a>
        )}
      </section>

      {/* ── Articles ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Package className="h-4 w-4" />
          Articles ({totalItems})
        </h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-gray-400 text-xs">× {item.quantity}</p>
              </div>
              <span className="font-semibold text-gray-700">{item.total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-base pt-1 border-t border-gray-100">
          <span className="text-gray-700">Total</span>
          <span className="text-[#F9461C]">{order.total.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </section>

      {/* ── Customer note ── */}
      {order.notes?.customer && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <MessageSquare className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">Note du client</p>
            <p className="text-sm text-amber-800">{order.notes.customer}</p>
          </div>
        </section>
      )}

      {/* ── Tracking history ── */}
      {order.tracking.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historique
          </h2>
          <ol className="space-y-3">
            {[...order.tracking].reverse().map((entry, i) => {
              const ec = STATUS_COLORS[entry.status] ?? { bg: '#F3F4F6', color: '#374151' };
              return (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: ec.bg, color: ec.color }}
                  >
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </span>
                  <div>
                    {entry.message && <p className="text-gray-600">{entry.message}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(entry.timestamp), 'dd MMM à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ── Action section ── */}
      {(canPickUp || canDeliver) && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Mettre à jour
          </h2>

          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Note (optionnel)…"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                       focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10
                       placeholder-gray-300"
          />

          {canPickUp && (
            <Button
              disabled={updating}
              onClick={() => updateStatus('delivering')}
              className="w-full py-4 rounded-xl text-white font-bold text-base bg-amber-500 hover:bg-amber-600"
            >
              {updating
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <><Truck className="h-5 w-5 mr-2" />Colis récupéré — En livraison</>
              }
            </Button>
          )}

          {canDeliver && (
            <Button
              disabled={updating}
              onClick={() => updateStatus('delivered')}
              className="w-full py-4 rounded-xl text-white font-bold text-base bg-green-500 hover:bg-green-600"
            >
              {updating
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <><CheckCircle2 className="h-5 w-5 mr-2" />Commande livrée</>
              }
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
