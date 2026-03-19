'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, type CouponResponse } from '@/features/admin/api/admin.api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  Trash2,
  Percent,
  DollarSign,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons]   = useState<CouponResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCoupons();
      setCoupons(data);
    } catch {
      toast.error('Erreur lors du chargement des coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleToggle = async (coupon: CouponResponse) => {
    try {
      await adminApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(coupon.isActive ? 'Coupon désactivé' : 'Coupon activé');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    try {
      await adminApi.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Codes promo</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un coupon
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Aucun coupon</p>
          <p className="text-sm mt-1">Créez votre premier code promo pour vos clients.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Réduction</th>
                <th className="px-5 py-3">Min. commande</th>
                <th className="px-5 py-3">Utilisation</th>
                <th className="px-5 py-3">Expiration</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.endDate) < new Date();
                return (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      {coupon.description && (
                        <p className="text-xs text-gray-400 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#F9461C' }}>
                        {coupon.discountType === 'percentage' ? (
                          <><Percent className="h-3.5 w-3.5" />{coupon.discountValue}%</>
                        ) : (
                          <><DollarSign className="h-3.5 w-3.5" />{coupon.discountValue.toLocaleString('fr-FR')} FCFA</>
                        )}
                      </span>
                      {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                        <p className="text-xs text-gray-400">Max: {coupon.maxDiscount.toLocaleString('fr-FR')} FCFA</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {coupon.minOrderAmount > 0
                        ? `${coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA`
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-5 py-4">
                      <span className={isExpired ? 'text-red-500' : 'text-gray-600'}>
                        {new Date(coupon.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(coupon)} title={coupon.isActive ? 'Désactiver' : 'Activer'}>
                        {coupon.isActive ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <CreateCouponModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => { setCoupons((prev) => [c, ...prev]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ── Create Modal Component ──────────────────────────────────────────────────

function CreateCouponModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: CouponResponse) => void;
}) {
  const [code, setCode]                 = useState('');
  const [description, setDescription]   = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount]   = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [endDate, setEndDate]           = useState('');
  const [maxUses, setMaxUses]           = useState('');
  const [saving, setSaving]             = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || !endDate) {
      toast.error('Veuillez remplir les champs requis');
      return;
    }
    setSaving(true);
    try {
      const data = await adminApi.createCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minOrderAmount: Number(minOrderAmount) || 0,
        endDate: new Date(endDate).toISOString(),
        maxUses: maxUses ? Number(maxUses) : null,
      });
      toast.success('Coupon créé');
      onCreated(data);
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#001489]/20 focus:border-[#001489]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">Nouveau coupon</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: BIENVENUE10"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="10% de réduction pour les nouveaux clients"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className={inputCls}
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur * {discountType === 'percentage' ? '(%)' : '(FCFA)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min="0"
                className={inputCls}
                required
              />
            </div>
          </div>
          {discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction max. (FCFA)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Ex: 20000"
                className={inputCls}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commande min. (FCFA)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max.</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Illimité"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;expiration *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
