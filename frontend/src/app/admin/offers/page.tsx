'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import type { OfferResponse } from '@/shared/types/offer.types';
import { Plus, Loader2, AlertTriangle, Tag, Calendar, Pencil, Trash2 } from 'lucide-react';

const PRIMARY = '#F9461C';

export default function AdminOffersPage() {
  const [offers, setOffers]         = useState<OfferResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getOffers();
      setOffers(data);
    } catch {
      setError('Impossible de charger les offres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer « ${title} » ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o._id !== id));
      toast.success('Offre supprimée', { description: title });
    } catch {
      toast.error("Impossible de supprimer l'offre.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Offres</h1>
        <Button asChild style={{ background: PRIMARY }}>
          <Link href="/admin/offers/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une offre
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={load} className="ml-auto">Réessayer</Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucune offre disponible</p>
          <p className="text-sm mt-1">Créez votre première offre promotionnelle.</p>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="relative h-36 bg-gray-100">
                {offer.image ? (
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Tag className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                <span
                  className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {offer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{offer.title}</h3>
                {offer.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{offer.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" style={{ color: PRIMARY }} />
                    <span className="font-semibold" style={{ color: PRIMARY }}>{offer.discount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(offer.validUntil).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                    <Link href={`/admin/offers/${offer._id}`} className="flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 rounded-xl"
                    disabled={deletingId === offer._id}
                    onClick={() => handleDelete(offer._id, offer.title)}
                  >
                    {deletingId === offer._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
