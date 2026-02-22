'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { PackResponse } from '@/shared/types/pack.types';
import {
  ChevronLeft,
  Package,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS: Record<string, string> = {
  alimentaire: 'Alimentaire',
  hygiene:     'Hygiène',
  composite:   'Composite',
};

export default function PackDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const { addPack } = useCartStore();

  const [pack,     setPack]     = useState<PackResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added,    setAdded]    = useState(false);

  useEffect(() => {
    catalogApi.getPack(id)
      .then(setPack)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!pack) return;
    addPack(pack, 1);
    setAdded(true);
    toast.success('Pack ajouté au panier', { description: pack.name, duration: 2500 });
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
      </div>
    );
  }

  if (notFound || !pack) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Pack introuvable</h2>
        <Link href="/packs" className="text-sm text-[#001489] underline">
          ← Retour aux packs
        </Link>
      </div>
    );
  }

  const savings = pack.originalPrice - pack.price;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Back link */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/packs"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux packs
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — image */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-square flex items-center justify-center relative">
              {pack.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pack.image.url}
                  alt={pack.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-3xl flex items-center justify-center"
                  style={{ background: '#001489' + '12' }}
                >
                  <Package className="h-16 w-16 text-[#001489]" />
                </div>
              )}
              {pack.discount ? (
                <div className="absolute top-4 left-4 bg-[#F9461C] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                  -{pack.discount}%
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* Right — info */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Category */}
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#001489]/10 text-[#001489]">
              {CATEGORY_LABELS[pack.category] ?? pack.category}
            </span>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{pack.name}</h1>
              {pack.description && (
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{pack.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-extrabold text-[#001489]">
                  {pack.price.toLocaleString('fr-FR')} FCFA
                </span>
                {pack.originalPrice > pack.price && (
                  <span className="text-base text-gray-400 line-through pb-0.5">
                    {pack.originalPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm font-semibold text-[#F9461C] flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  Vous économisez {savings.toLocaleString('fr-FR')} FCFA
                </p>
              )}
            </div>

            {/* Items included */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {pack.items.length} produit{pack.items.length !== 1 ? 's' : ''} inclus
              </h2>
              <ul className="space-y-3">
                {pack.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                        style={{ background: '#001489' }}
                      >
                        {item.quantity}
                      </div>
                      <span className="text-gray-700 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-500 flex-shrink-0 ml-2">
                      {(item.priceAtTimeOfAddition * item.quantity).toLocaleString('fr-FR')} FCFA
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA — sticky on mobile, inline on desktop */}
            <div className="hidden lg:block">
              <Button
                onClick={handleAdd}
                className="w-full h-13 rounded-xl text-base font-bold transition-all"
                style={{
                  background:  added ? '#16a34a' : '#F9461C',
                  boxShadow:   added ? '0 4px 16px rgba(22,163,74,0.3)' : '0 4px 16px rgba(249,70,28,0.3)',
                }}
              >
                {added ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Ajouté au panier !
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ajouter au panier
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-20">
        <Button
          onClick={handleAdd}
          className="w-full h-12 rounded-xl text-base font-bold transition-all"
          style={{
            background: added ? '#16a34a' : '#F9461C',
          }}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Ajouté !
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier — {pack.price.toLocaleString('fr-FR')} FCFA
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
