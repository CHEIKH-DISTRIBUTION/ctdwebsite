'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpClient } from '@/shared/api/httpClient';
import { Loader2, TrendingUp, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type DashboardData = {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    periodOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  ordersByStatus: Array<{ _id: string; count: number }>;
  topProducts: Array<{ name: string; totalSold: number; revenue: number }>;
  topCategories: Array<{ _id: string; totalSold: number; revenue: number }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête',
  delivering: 'En livraison',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  refunded:   'Remboursée',
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}18` }}
          >
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.get<DashboardData>('/api/stats/dashboard');
      setData(res);
    } catch {
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm">{error ?? 'Données indisponibles.'}</p>
        <button onClick={fetchStats} className="ml-auto text-sm underline">Réessayer</button>
      </div>
    );
  }

  const { overview, ordersByStatus, topProducts, topCategories } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-0.5">Statistiques des 30 derniers jours</p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={`${overview.totalRevenue.toLocaleString('fr-FR')} FCFA`}
          sub="commandes payées"
          icon={TrendingUp}
          accent="#F9461C"
        />
        <StatCard
          title="Commandes"
          value={overview.totalOrders}
          sub={`${overview.periodOrders} sur 30 jours`}
          icon={ShoppingCart}
          accent="#001489"
        />
        <StatCard
          title="Produits actifs"
          value={overview.totalProducts}
          icon={Package}
          accent="#FFB500"
        />
        <StatCard
          title="Clients"
          value={overview.totalUsers}
          icon={Users}
          accent="#28a745"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Commandes par statut ───────────────────────────────────── */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune commande.</p>
            ) : (
              <div className="space-y-2">
                {ordersByStatus.map((s) => (
                  <div key={s._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{STATUS_LABELS[s._id] ?? s._id}</span>
                    <span className="font-semibold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Top produits ───────────────────────────────────────────── */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top produits</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune vente enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-500 w-4 flex-shrink-0">{i + 1}.</span>
                    <span className="text-gray-800 flex-1 truncate">{p.name}</span>
                    <span className="font-semibold text-[#F9461C] flex-shrink-0">{p.totalSold} vendus</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Top catégories ─────────────────────────────────────────── */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top catégories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune donnée.</p>
            ) : (
              <div className="space-y-2">
                {topCategories.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{c._id}</span>
                    <span className="font-semibold text-gray-900">
                      {c.revenue.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
