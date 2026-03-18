'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PackResponse, PackCategory } from '@/shared/types/pack.types';
import {
  Package,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Tag,
  CheckCircle2,
  Search,
  X,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Brand colours ── */
const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';

const CATEGORY_LABELS: Record<PackCategory, string> = {
  alimentaire: 'Alimentaire',
  hygiene:     'Hygiène',
  composite:   'Composite',
};

const CATEGORY_OPTIONS: { value: PackCategory | undefined; label: string }[] = [
  { value: undefined,      label: 'Tous les packs' },
  { value: 'alimentaire',  label: 'Alimentaire'    },
  { value: 'hygiene',      label: 'Hygiène'        },
  { value: 'composite',    label: 'Composite'      },
];

// ── Pack Detail Modal ───────────────────────────────────────────────────────────

function PackModal({ pack, onClose }: { pack: PackResponse; onClose: () => void }) {
  const { addPack } = useCartStore();
  const [added, setAdded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = () => {
    addPack(pack, 1);
    setAdded(true);
    toast.success('Pack ajouté au panier', { description: pack.name, duration: 2500 });
    setTimeout(() => { setAdded(false); onClose(); }, 1500);
  };

  const savings = pack.originalPrice - pack.price;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="relative">
          <div className="h-48 bg-gray-100 overflow-hidden rounded-t-2xl">
            {pack.image?.url ? (
              <Image
                src={pack.image.url}
                alt={pack.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center" style={{ background: `${SECONDARY}10` }}>
                <Package className="h-16 w-16" style={{ color: `${SECONDARY}60` }} />
              </div>
            )}
            {/* Discount badge */}
            {pack.discount ? (
              <div
                className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: PRIMARY }}
              >
                -{pack.discount}%
              </div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{pack.name}</h2>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: `${SECONDARY}10`, color: SECONDARY }}
            >
              {CATEGORY_LABELS[pack.category]}
            </span>
          </div>

          {pack.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{pack.description}</p>
          )}

          {/* Items list */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Contenu du pack ({pack.items.length} produit{pack.items.length !== 1 ? 's' : ''})
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {pack.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: i % 2 === 0 ? SECONDARY : PRIMARY }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: SECONDARY }}
                  >
                    ×{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold" style={{ color: SECONDARY }}>
                {pack.price.toLocaleString('fr-FR')} FCFA
              </span>
              {pack.discount ? (
                <span className="text-base text-gray-400 line-through pb-0.5">
                  {pack.originalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              ) : null}
            </div>
            {savings > 0 && (
              <p className="text-sm font-medium" style={{ color: PRIMARY }}>
                <Tag className="inline h-3.5 w-3.5 mr-1" />
                Vous économisez {savings.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAdd}
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: added ? '#16a34a' : PRIMARY,
              boxShadow: added ? '0 4px 12px rgba(22,163,74,0.25)' : '0 4px 12px rgba(249,70,28,0.25)',
            }}
          >
            {added ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ajouté au panier !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Pack card ──────────────────────────────────────────────────────────────────

function PackCard({ pack, onViewDetail }: { pack: PackResponse; onViewDetail: () => void }) {
  const { addPack } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addPack(pack, 1);
    setAdded(true);
    toast.success('Pack ajouté au panier', { description: pack.name, duration: 2500 });
    setTimeout(() => setAdded(false), 2000);
  };

  const savings = pack.originalPrice - pack.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
        {pack.image?.url ? (
          <Image
            src={pack.image.url}
            alt={pack.name}
            fill
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: `${SECONDARY}12` }}
          >
            <Package className="h-10 w-10" style={{ color: SECONDARY }} />
          </div>
        )}

        {/* Discount badge */}
        {pack.discount ? (
          <div
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: PRIMARY }}
          >
            -{pack.discount}%
          </div>
        ) : null}

        {/* Category badge */}
        <div
          className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm"
          style={{ color: SECONDARY }}
        >
          {CATEGORY_LABELS[pack.category]}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
          {pack.name}
        </h3>

        {pack.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {pack.description}
          </p>
        )}

        {/* Items summary */}
        <p className="text-xs text-gray-400 font-medium mb-3">
          {pack.items.length} produit{pack.items.length !== 1 ? 's' : ''} inclus
        </p>

        {/* Pricing */}
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-xl font-extrabold" style={{ color: SECONDARY }}>
              {pack.price.toLocaleString('fr-FR')} FCFA
            </span>
            {pack.discount ? (
              <span className="text-sm text-gray-400 line-through pb-0.5">
                {pack.originalPrice.toLocaleString('fr-FR')} FCFA
              </span>
            ) : null}
          </div>
          {savings > 0 && (
            <p className="text-xs font-medium mb-3" style={{ color: PRIMARY }}>
              <Tag className="inline h-3 w-3 mr-1" />
              Économisez {savings.toLocaleString('fr-FR')} FCFA
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onViewDetail}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-gray-50"
              style={{ borderColor: `${SECONDARY}40`, color: SECONDARY }}
            >
              <Eye className="h-3.5 w-3.5" />
              Détail
            </button>
            <Button
              onClick={handleAdd}
              className="flex-1 h-9 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: added ? '#16a34a' : PRIMARY,
                boxShadow: added ? '0 4px 12px rgba(22,163,74,0.2)' : '0 4px 12px rgba(249,70,28,0.2)',
              }}
            >
              {added ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ajouté !
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Ajouter
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PacksPage() {
  const [packs, setPacks]             = useState<PackResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [category, setCategory]       = useState<PackCategory | undefined>(undefined);
  const [search, setSearch]           = useState('');
  const [selectedPack, setSelectedPack] = useState<PackResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogApi.getPacks({ category });
      setPacks(data);
    } catch {
      setError('Impossible de charger les packs.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  // Client-side search filter
  const filteredPacks = search.trim()
    ? packs.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : packs;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-[#001489] text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Nos Packs</h1>
          <p className="text-blue-200 text-sm mt-1">
            Des combinaisons soigneusement sélectionnées, à prix réduit
          </p>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un pack..."
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

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => {
              const active = category === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => setCategory(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={active ? { background: SECONDARY } : undefined}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredPacks.length} pack{filteredPacks.length !== 1 ? 's' : ''}
            {search ? ` pour "${search}"` : ''}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 max-w-lg mx-auto">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={load} className="ml-auto text-sm underline">Réessayer</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredPacks.length === 0 && (
          <div className="text-center py-24">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${SECONDARY}10` }}
            >
              <Package className="h-10 w-10" style={{ color: SECONDARY }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun pack trouvé</h2>
            <p className="text-gray-500 text-sm">
              {search ? 'Essayez un autre terme de recherche.' : category ? 'Essayez une autre catégorie.' : 'Revenez bientôt, de nouveaux packs arrivent !'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredPacks.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={String(category) + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredPacks.map((pack) => (
                <PackCard
                  key={pack._id}
                  pack={pack}
                  onViewDetail={() => setSelectedPack(pack)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pack detail modal */}
      <AnimatePresence>
        {selectedPack && (
          <PackModal
            pack={selectedPack}
            onClose={() => setSelectedPack(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
