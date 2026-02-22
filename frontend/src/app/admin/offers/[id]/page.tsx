'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import { OfferForm } from '@/features/admin/components/OfferForm';
import type { OfferResponse } from '@/shared/types/offer.types';

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [offer, setOffer]             = useState<OfferResponse | null>(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminApi.getOfferById(id)
      .then(setOffer)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: Partial<OfferResponse>) => {
    setIsSubmitting(true);
    try {
      await adminApi.updateOffer(id, data);
      toast.success('Offre mise à jour');
      router.push('/admin/offers');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Offre introuvable</h2>
        <p className="text-gray-500 text-sm mb-6">Cette offre n&apos;existe pas ou a été supprimée.</p>
        <Link href="/admin/offers" className="text-sm text-[#001489] underline">
          Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/offers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux offres
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Modifier : {offer.title}</h1>
      </div>

      <OfferForm
        initialData={offer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
