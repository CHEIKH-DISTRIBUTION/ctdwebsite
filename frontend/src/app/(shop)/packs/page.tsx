'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/button';
import type { PackResponse, PackCategory } from '@/shared/types/pack.types';
import {
  Package,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Brand colours ── */
const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';
const ACCENT    = '#FFB500';

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

// ── Pack card ──────────────────────────────────────────────────────────────────

function PackCard({ pack }: { pack: PackResponse }) {
  const { addPack } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
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

        {/* Included products */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-medium mb-1.5">
            {pack.items.length} produit{pack.items.length !== 1 ? 's' : ''} inclus
          </p>
          <ul className="space-y-0.5">
            {pack.items.slice(0, 3).map((item, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                {item.name} ×{item.quantity}
              </li>
            ))}
            {pack.items.length > 3 && (
              <li className="text-xs text-gray-400 italic">
                +{pack.items.length - 3} autre{pack.items.length - 3 > 1 ? 's' : ''}…
              </li>
            )}
          </ul>
        </div>

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

          <Button
            onClick={handleAdd}
            className="w-full h-10 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: added ? '#16a34a' : PRIMARY,
              boxShadow: added ? '0 4px 12px rgba(22,163,74,0.25)' : '0 4px 12px rgba(249,70,28,0.25)',
            }}
          >
            {added ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ajouté !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PacksPage() {
  const [packs, setPacks]           = useState<PackResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [category, setCategory]     = useState<PackCategory | undefined>(undefined);

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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Nos packs</h1>
            <p className="text-gray-500 text-sm">
              Des combinaisons soigneusement sélectionnées, à prix réduit
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORY_OPTIONS.map((opt) => {
            const active = category === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => setCategory(opt.value)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={active
                  ? { background: SECONDARY, color: '#fff' }
                  : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 max-w-lg mx-auto">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={load} className="ml-auto text-sm underline">Réessayer</button>
          </div>
        )}

        {!loading && !error && packs.length === 0 && (
          <div className="text-center py-24">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${SECONDARY}10` }}
            >
              <Package className="h-10 w-10" style={{ color: SECONDARY }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun pack disponible</h2>
            <p className="text-gray-500 text-sm">
              {category
                ? 'Essayez une autre catégorie.'
                : 'Revenez bientôt, de nouveaux packs arrivent !'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && packs.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={String(category)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {packs.map((pack) => (
                <PackCard key={pack._id} pack={pack} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
