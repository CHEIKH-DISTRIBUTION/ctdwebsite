'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import type { PackResponse, PackCategory } from '@/shared/types/pack.types';
import type { ProductResponse } from '@/shared/types/product.types';
import {
  Plus,
  Loader2,
  X,
  Package,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PackCategory, string> = {
  alimentaire: 'Alimentaire',
  hygiene:     'Hygiène',
  composite:   'Composite',
};

const CATEGORY_COLORS: Record<PackCategory, { bg: string; color: string }> = {
  alimentaire: { bg: '#DCFCE7', color: '#166534' },
  hygiene:     { bg: '#DBEAFE', color: '#1E40AF' },
  composite:   { bg: '#F3E8FF', color: '#6B21A8' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type FormItem = {
  productId:   string;
  productName: string;
  quantity:    number;
  unitPrice:   number;
};

type FormState = {
  name:        string;
  description: string;
  category:    PackCategory;
  discount:    string;
  isFeatured:  boolean;
  isActive:    boolean;
  items:       FormItem[];
};

const EMPTY_FORM: FormState = {
  name: '', description: '', category: 'composite',
  discount: '', isFeatured: false, isActive: true, items: [],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPacksPage() {
  const [packs,      setPacks]      = useState<PackResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingPack, setEditingPack] = useState<PackResponse | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Product picker
  const [products,        setProducts]        = useState<ProductResponse[]>([]);
  const [productsLoaded,  setProductsLoaded]  = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch,   setProductSearch]   = useState('');

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadPacks = () => {
    setLoading(true);
    adminApi.getAllPacks()
      .then(setPacks)
      .catch(() => toast.error('Impossible de charger les packs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPacks(); }, []);

  const ensureProducts = () => {
    if (productsLoaded) return;
    setProductsLoading(true);
    adminApi.getAllProducts({ limit: 200 })
      .then((r) => { setProducts(r.products); setProductsLoaded(true); })
      .catch(() => {/* non-critical */})
      .finally(() => setProductsLoading(false));
  };

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingPack(null);
    setForm(EMPTY_FORM);
    setProductSearch('');
    setShowForm(true);
    ensureProducts();
  };

  const openEdit = (pack: PackResponse) => {
    setEditingPack(pack);
    setForm({
      name:        pack.name,
      description: pack.description ?? '',
      category:    pack.category,
      discount:    pack.discount ? String(pack.discount) : '',
      isFeatured:  pack.isFeatured,
      isActive:    pack.isActive,
      items: pack.items.map((item) => ({
        productId:   item.product?._id ?? '',
        productName: item.name,
        quantity:    item.quantity,
        unitPrice:   item.priceAtTimeOfAddition,
      })),
    });
    setProductSearch('');
    setShowForm(true);
    ensureProducts();
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) && !form.items.some((i) => i.productId === p._id)
    );
  }, [products, productSearch, form.items]);

  const addProduct = (product: ProductResponse) =>
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: product._id, productName: product.name, quantity: 1, unitPrice: product.price }],
    }));

  const removeItem = (productId: string) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }));

  const setItemQty = (productId: string, qty: number) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i),
    }));

  const originalPrice = form.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountNum   = parseFloat(form.discount) || 0;
  const finalPrice    = discountNum > 0 ? originalPrice * (1 - discountNum / 100) : originalPrice;

  // ── CRUD actions ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim())      { toast.error('Le nom est requis');               return; }
    if (form.items.length === 0) { toast.error('Ajoutez au moins un produit');     return; }
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        items:       form.items.map((i) => ({ product: i.productId, quantity: i.quantity })),
        discount:    discountNum > 0 ? discountNum : undefined,
        category:    form.category,
        isFeatured:  form.isFeatured,
        isActive:    form.isActive,
      };
      if (editingPack) {
        await adminApi.updatePack(editingPack._id, payload);
        toast.success('Pack mis à jour');
      } else {
        await adminApi.createPack(payload);
        toast.success('Pack créé');
      }
      setShowForm(false);
      loadPacks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await adminApi.deletePack(id);
      setPacks((prev) => prev.filter((p) => p._id !== id));
      toast.success('Pack supprimé');
    } catch {
      toast.error('Impossible de supprimer ce pack');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (pack: PackResponse) => {
    try {
      const updated = await adminApi.updatePack(pack._id, { isActive: !pack.isActive });
      setPacks((prev) => prev.map((p) => p._id === updated._id ? updated : p));
    } catch {
      toast.error('Impossible de modifier le statut');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? '…' : `${packs.length} pack${packs.length !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-xl text-white font-semibold" style={{ background: '#F9461C' }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau pack
        </Button>
      </div>

      {/* Pack list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : packs.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Archive className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun pack créé</p>
          <p className="text-sm mt-1">Cliquez sur &quot;Nouveau pack&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packs.map((pack) => {
            const catColor = CATEGORY_COLORS[pack.category] ?? { bg: '#F3F4F6', color: '#374151' };
            return (
              <div
                key={pack._id}
                className={`bg-white rounded-2xl border p-5 space-y-4 transition-opacity ${
                  pack.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{pack.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: catColor.bg, color: catColor.color }}
                      >
                        {CATEGORY_LABELS[pack.category]}
                      </span>
                      {pack.isFeatured && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Vedette
                        </span>
                      )}
                      {!pack.isActive && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>
                  {pack.discount ? (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#F9461C] text-white flex-shrink-0">
                      -{pack.discount}%
                    </span>
                  ) : null}
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xl font-extrabold text-[#001489]">
                    {pack.price.toLocaleString('fr-FR')} FCFA
                  </p>
                  {pack.originalPrice > pack.price && (
                    <p className="text-xs text-gray-400 line-through">
                      {pack.originalPrice.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {pack.items.length} produit{pack.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(pack)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {pack.isActive
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-gray-400" />}
                    {pack.isActive ? 'Actif' : 'Inactif'}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => openEdit(pack)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#001489] hover:bg-[#001489]/5 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pack._id)}
                    disabled={deletingId === pack._id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    {deletingId === pack._id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / edit panel ────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setShowForm(false)}
          />

          {/* Slide-in panel */}
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

            {/* Panel header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                {editingPack ? 'Modifier le pack' : 'Nouveau pack'}
              </h2>
              <button
                onClick={() => !saving && setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 px-6 py-5 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex : Pack Ménage Essentiel"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Description courte…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10"
                />
              </div>

              {/* Category + Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as PackCategory })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10"
                  >
                    <option value="composite">Composite</option>
                    <option value="alimentaire">Alimentaire</option>
                    <option value="hygiene">Hygiène</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Remise (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#001489]"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    En vedette
                  </span>
                </label>
                {editingPack && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#001489]"
                    />
                    <span className="text-sm font-medium text-gray-700">Actif</span>
                  </label>
                )}
              </div>

              {/* Items section */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Produits inclus *
                </label>

                {/* Selected items */}
                {form.items.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <Package className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                          {item.productName}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {item.unitPrice.toLocaleString('fr-FR')} FCFA
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setItemQty(item.productId, parseInt(e.target.value) || 1)}
                          className="w-14 text-center text-sm border border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:border-[#001489]"
                        />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Rechercher un produit à ajouter…"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/10"
                  />
                </div>

                {/* Filtered product list */}
                <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      {productSearch ? 'Aucun produit correspondant' : 'Tous les produits ont été ajoutés'}
                    </p>
                  ) : (
                    filteredProducts.slice(0, 20).map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addProduct(product)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-800 truncate">{product.name}</span>
                        <span className="text-xs text-gray-400 ml-2 shrink-0 flex items-center gap-1.5">
                          {product.price.toLocaleString('fr-FR')} FCFA
                          <span className="text-[#001489] font-bold text-base leading-none">+</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Price preview */}
              {form.items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Prix catalogue</span>
                    <span>{originalPrice.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {discountNum > 0 && (
                    <div className="flex justify-between text-[#F9461C]">
                      <span>Remise ({discountNum}%)</span>
                      <span>−{(originalPrice - finalPrice).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1.5 border-t border-gray-200">
                    <span style={{ color: '#001489' }}>Prix pack</span>
                    <span style={{ color: '#001489' }}>{Math.round(finalPrice).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="flex-1 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl text-white font-bold"
                style={{ background: '#F9461C' }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sauvegarde…
                  </span>
                ) : editingPack ? 'Mettre à jour' : 'Créer le pack'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
