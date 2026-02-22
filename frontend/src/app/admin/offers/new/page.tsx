'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import { OfferForm } from '@/features/admin/components/OfferForm';

export default function AdminCreateOfferPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Parameters<typeof adminApi.createOffer>[0]) => {
    setIsSubmitting(true);
    try {
      await adminApi.createOffer(data);
      toast.success('Offre créée avec succès');
      router.push('/admin/offers');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de la création';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Nouvelle offre</h1>
      </div>
      <OfferForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
