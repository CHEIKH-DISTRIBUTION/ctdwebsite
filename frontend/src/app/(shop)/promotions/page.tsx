'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import type { OfferResponse } from '@/shared/types/offer.types';
import { Button } from '@/components/ui/button';
import { Tag, Loader2, Calendar, AlertTriangle } from 'lucide-react';

function OfferCard({ offer, index }: { offer: OfferResponse; index: number }) {
  const expiry   = new Date(offer.validUntil);
  const isExpired = expiry < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isExpired ? 'opacity-60' : 'border-gray-100'}`}
    >
      {/* Top banner */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'linear-gradient(135deg, #001489 0%, #0020b8 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight">{offer.title}</p>
            {offer.category && (
              <p className="text-white/60 text-xs mt-0.5 capitalize">{offer.category}</p>
            )}
          </div>
        </div>
        <span className="text-2xl font-black text-[#F9461C] bg-white/10 px-3 py-1 rounded-xl">
          {offer.discount}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {offer.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          {isExpired
            ? <span className="text-red-500 font-medium">Offre expirée</span>
            : <span>Valable jusqu&apos;au {expiry.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          }
        </div>

        <Button
          asChild
          className="w-full rounded-xl font-semibold text-white"
          style={{ background: isExpired ? '#9CA3AF' : '#F9461C' }}
          disabled={isExpired}
        >
          <Link href="/products">Voir les produits →</Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function PromotionsPage() {
  const [offers,  setOffers]  = useState<OfferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    catalogApi.getOffers()
      .then(setOffers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Hero */}
      <div
        className="py-14 text-center"
        style={{ background: 'linear-gradient(135deg, #001489 0%, #001070 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Offres Spéciales
          </h1>
          <p className="text-white/60 mt-3 text-base max-w-md mx-auto px-4">
            Profitez de réductions exclusives sur nos produits phares
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#001489]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="font-medium">Impossible de charger les offres.</p>
            <Button variant="outline" onClick={() => { setError(false); setLoading(true); catalogApi.getOffers().then(setOffers).catch(() => setError(true)).finally(() => setLoading(false)); }}>
              Réessayer
            </Button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-lg">Aucune offre en cours</p>
            <p className="text-sm mt-1">Revenez bientôt pour de nouvelles promotions.</p>
            <Button asChild className="mt-6 rounded-xl" style={{ background: '#001489' }}>
              <Link href="/products">Voir les produits</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer, i) => (
              <OfferCard key={offer._id} offer={offer} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && !error && (
          <div className="text-center mt-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Vous cherchez une offre sur mesure ?
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Packs personnalisés pour entreprises, ONG et écoles.
            </p>
            <Button asChild variant="outline" className="rounded-xl border-[#001489] text-[#001489] hover:bg-[#001489]/5">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
