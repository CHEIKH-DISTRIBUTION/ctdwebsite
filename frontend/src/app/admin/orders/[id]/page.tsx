'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import type { OrderResponse, OrderStatus } from '@/shared/types/order.types';
import type { UserResponse } from '@/shared/types/user.types';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  User,
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête',
  delivering: 'En livraison',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  refunded:   'Remboursée',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  pending:    { bg: '#FEF3C7', color: '#92400E' },
  confirmed:  { bg: '#DBEAFE', color: '#1E40AF' },
  preparing:  { bg: '#E0E7FF', color: '#3730A3' },
  ready:      { bg: '#D1FAE5', color: '#065F46' },
  delivering: { bg: '#FEF9C3', color: '#713F12' },
  delivered:  { bg: '#DCFCE7', color: '#166534' },
  cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
  refunded:   { bg: '#F3F4F6', color: '#374151' },
};

const PAYMENT_LABELS: Record<string, string> = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  cash:          'Espèces',
  bank_transfer: 'Virement',
};

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready',
  'delivering', 'delivered', 'cancelled', 'refunded',
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder]                   = useState<OrderResponse | null>(null);
  const [loading, setLoading]               = useState(true);
  const [notFound, setNotFound]             = useState(false);
  const [newStatus, setNewStatus]           = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote]         = useState('');
  const [updating, setUpdating]             = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [deliveryAgents, setDeliveryAgents] = useState<UserResponse[]>([]);
  const [selectedAgent, setSelectedAgent]   = useState('');
  const [assigning, setAssigning]           = useState(false);

  useEffect(() => {
    adminApi.getOrderById(id)
      .then((o) => { setOrder(o); setNewStatus(o.status); setSelectedAgent(o.deliveryPerson?._id ?? ''); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    adminApi.getUsers({ role: 'delivery', limit: 100 })
      .then((r) => setDeliveryAgents(r.users))
      .catch(() => {/* non-critical */});
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return;
    setUpdating(true);
    try {
      const updated = await adminApi.updateOrderStatus(id, newStatus as OrderStatus, statusNote || undefined);
      setOrder(updated.order);
      setStatusNote('');
      toast.success('Statut mis à jour', { description: STATUS_LABELS[newStatus as OrderStatus] });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    setConfirmingPayment(true);
    try {
      const updated = await adminApi.confirmPayment(id);
      setOrder(updated.order);
      toast.success('Virement confirmé', { description: 'Paiement marqué comme reçu.' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la confirmation';
      toast.error(msg);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!order) return;
    setAssigning(true);
    try {
      const updated = await adminApi.assignDelivery(id, selectedAgent || null);
      setOrder(updated);
      toast.success(selectedAgent ? 'Livreur assigné' : 'Livreur retiré');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de l\'assignation';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Commande introuvable</h2>
        <Link href="/admin/orders" className="text-sm text-[#001489] underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const sc = STATUS_COLORS[order.status];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Breadcrumb + header ── */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Commande {order.orderNumber}
          </h1>
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ background: sc.bg, color: sc.color }}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Articles ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => {
                const imgUrl = item.product?.images?.[0]?.url ?? null;
                const isPack = !!item.pack;
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    {/* Thumb */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {isPack ? 'Pack · ' : ''}{item.quantity} × {item.price.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    {/* Total */}
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: PRIMARY }}>
                      {item.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{order.subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{order.deliveryFee === 0 ? 'Gratuite' : `${order.deliveryFee.toLocaleString('fr-FR')} FCFA`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span style={{ color: SECONDARY }}>Total</span>
                <span style={{ color: PRIMARY }}>{order.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </section>

          {/* Tracking timeline */}
          {order.tracking.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Historique
              </h2>
              <ol className="space-y-4">
                {[...order.tracking].reverse().map((entry, i) => {
                  const isLast = i === order.tracking.length - 1;
                  const eColors = STATUS_COLORS[entry.status] ?? { bg: '#F3F4F6', color: '#374151' };
                  return (
                    <li key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: eColors.bg }}
                        >
                          {entry.status === 'delivered' ? (
                            <CheckCircle2 className="h-4 w-4" style={{ color: eColors.color }} />
                          ) : entry.status === 'cancelled' || entry.status === 'refunded' ? (
                            <XCircle className="h-4 w-4" style={{ color: eColors.color }} />
                          ) : entry.status === 'delivering' ? (
                            <Truck className="h-4 w-4" style={{ color: eColors.color }} />
                          ) : (
                            <Clock className="h-4 w-4" style={{ color: eColors.color }} />
                          )}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: eColors.bg, color: eColors.color }}
                          >
                            {STATUS_LABELS[entry.status]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {entry.message && (
                          <p className="text-xs text-gray-500 mt-1">{entry.message}</p>
                        )}
                        {entry.updatedBy?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">par {entry.updatedBy.name}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-6">

          {/* Status update */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Changer le statut
            </h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Note (optionnel)…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15
                         placeholder-gray-300"
            />
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || !newStatus || newStatus === order.status}
              className="w-full rounded-xl text-white"
              style={{ background: PRIMARY }}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mettre à jour'}
            </Button>
          </section>

          {/* Customer */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-gray-800">{order.user?.name ?? '—'}</p>
              <p className="text-gray-500">{order.contactInfo.phone}</p>
              {order.contactInfo.email && (
                <p className="text-gray-500">{order.contactInfo.email}</p>
              )}
            </div>
          </section>

          {/* Delivery address */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Livraison
            </h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}{order.deliveryAddress.region ? `, ${order.deliveryAddress.region}` : ''}</p>
              {order.deliveryAddress.instructions && (
                <p className="text-gray-400 text-xs mt-1">{order.deliveryAddress.instructions}</p>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Paiement
            </h2>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Méthode</span>
                <span className="font-medium">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Statut</span>
                <span className={`font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.paymentStatus === 'completed' ? 'Payé' :
                   order.paymentStatus === 'pending' ? 'En attente' :
                   order.paymentStatus === 'failed' ? 'Échoué' : order.paymentStatus}
                </span>
              </div>
            </div>
            {order.paymentStatus !== 'completed' && (
              <Button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                className="w-full rounded-xl text-white text-sm"
                style={{ background: '#16a34a' }}
              >
                {confirmingPayment ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Confirmation…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmer paiement reçu
                  </span>
                )}
              </Button>
            )}
          </section>

          {/* Delivery assignment */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Livreur
            </h2>
            {order.deliveryPerson ? (
              <p className="text-sm font-semibold text-gray-800">
                {order.deliveryPerson.name}
                <span className="text-gray-400 font-normal ml-2">{order.deliveryPerson.phone}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400">Aucun livreur assigné</p>
            )}
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15"
            >
              <option value="">— Aucun —</option>
              {deliveryAgents.map((agent) => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
            <Button
              onClick={handleAssignDelivery}
              disabled={assigning || selectedAgent === (order.deliveryPerson?._id ?? '')}
              className="w-full rounded-xl text-white text-sm"
              style={{ background: SECONDARY }}
            >
              {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assigner'}
            </Button>
          </section>

          {/* Customer note */}
          {order.notes?.customer && (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">
                Note du client
              </h2>
              <p className="text-sm text-amber-800">{order.notes.customer}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
