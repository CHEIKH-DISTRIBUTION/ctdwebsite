'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { adminApi } from '@/features/admin/api/admin.api';
import type { OrderResponse, OrderStatus } from '@/shared/types/order.types';
import { AlertTriangle, Loader2, ChevronLeft, ChevronRight, Eye, Search, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

const LIMIT = 20;

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'bg-gray-100 text-gray-700',
  confirmed:  'bg-blue-100 text-blue-700',
  preparing:  'bg-amber-100 text-amber-700',
  ready:      'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-pink-100 text-pink-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<OrderResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getAllOrders({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.pages);
      setTotalOrders(result.pagination.total);
    } catch {
      setError('Impossible de charger les commandes. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Client-side search: filter by order number or customer name/phone
  const filteredOrders = search.trim()
    ? orders.filter((o) =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.phone?.includes(search)
      )
    : orders;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success('Statut mis à jour', {
        description: `→ ${STATUS_LABELS[newStatus]}`,
      });
    } catch {
      toast.error('Impossible de mettre à jour le statut. Réessayez.');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const rows = filteredOrders.map((o) => ({
      'N° Commande': o.orderNumber,
      Client: o.user?.name ?? '',
      Téléphone: o.user?.phone ?? '',
      Statut: STATUS_LABELS[o.status],
      Paiement: o.paymentMethod,
      'Sous-total': o.subtotal,
      Livraison: o.deliveryFee,
      Réduction: o.discount ?? 0,
      Total: o.total,
      Date: format(new Date(o.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
    }));

    if (rows.length === 0) { toast.error('Aucune commande à exporter'); return; }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(';'),
      ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(';')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `commandes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} commande${rows.length > 1 ? 's' : ''} exportée${rows.length > 1 ? 's' : ''}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Toutes les Commandes</h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {search ? `${filteredOrders.length} résultat${filteredOrders.length !== 1 ? 's' : ''} sur ${totalOrders}` : `${totalOrders} commande${totalOrders !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                         focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15
                         transition-all cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            {/* CSV Export */}
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={loading || filteredOrders.length === 0}>
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher par numéro, client ou téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 border-gray-200 rounded-xl h-10 focus:border-[#001489] focus:ring-[#001489]/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
            Réessayer
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg font-medium">Aucune commande trouvée</p>
          {statusFilter && (
            <p className="text-sm mt-1">
              Essayez un autre filtre ou{' '}
              <button
                onClick={() => setStatusFilter('')}
                className="underline hover:text-gray-700 transition-colors"
              >
                affichez toutes les commandes
              </button>
              .
            </p>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table (md+) ──────────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Commande</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Changer statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="hover:text-[#001489] transition-colors flex items-center gap-1 group"
                      >
                        {order.orderNumber}
                        <Eye className="h-3 w-3 text-gray-300 group-hover:text-[#001489] transition-colors" />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.user?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{order.user?.phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#F9461C]">
                      {order.total.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {format(new Date(order.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        {updatingId === order._id && (
                          <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                        )}
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                          className={`border rounded-lg py-1.5 text-xs bg-white cursor-pointer
                                     focus:outline-none focus:border-[#001489] transition-all
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     ${updatingId === order._id ? 'pl-7 pr-2' : 'px-2'}`}
                        >
                          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards (< md) ──────────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                {/* Top row: order number + date */}
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-mono text-xs font-semibold text-gray-700 hover:text-[#001489] transition-colors flex items-center gap-1 group"
                  >
                    {order.orderNumber}
                    <Eye className="h-3 w-3 text-gray-300 group-hover:text-[#001489] transition-colors" />
                  </Link>
                  <span className="text-xs text-gray-400">
                    {format(new Date(order.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}
                  </span>
                </div>

                {/* Client + total */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{order.user?.name ?? '—'}</p>
                    {order.user?.phone && (
                      <p className="text-xs text-gray-400 mt-0.5">{order.user.phone}</p>
                    )}
                  </div>
                  <span className="font-semibold text-[#F9461C] text-sm">
                    {order.total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                {/* Status badge + select */}
                <div className="flex items-center gap-2">
                  <Badge className={`${STATUS_COLORS[order.status]} text-xs`}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                  <div className="relative ml-auto">
                    {updatingId === order._id && (
                      <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                    )}
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                      className={`border rounded-lg py-1.5 text-xs bg-white cursor-pointer
                                 focus:outline-none focus:border-[#001489] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 ${updatingId === order._id ? 'pl-7 pr-2' : 'px-2'}`}
                    >
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
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
