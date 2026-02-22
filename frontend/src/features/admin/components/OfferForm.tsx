'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { OfferResponse } from '@/shared/types/offer.types';

const PRIMARY = '#F9461C';

const INPUT_CLS =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm ' +
  'focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15 ' +
  'transition-all placeholder-gray-300';

export type OfferFormProps = {
  initialData?: OfferResponse;
  onSubmit: (data: Partial<OfferResponse>) => Promise<void>;
  isSubmitting: boolean;
};

export function OfferForm({ initialData, onSubmit, isSubmitting }: OfferFormProps) {
  const isEdit = !!initialData;

  const toDateInput = (iso?: string) =>
    iso ? new Date(iso).toISOString().slice(0, 10) : '';

  const [title, setTitle]           = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [image, setImage]           = useState(initialData?.image ?? '');
  const [discount, setDiscount]     = useState(initialData?.discount ?? '');
  const [validUntil, setValidUntil] = useState(toDateInput(initialData?.validUntil));
  const [category, setCategory]     = useState(initialData?.category ?? '');
  const [isActive, setIsActive]     = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim())    { toast.error('Le titre est requis'); return; }
    if (!discount.trim()) { toast.error('La remise est requise'); return; }
    if (!validUntil)      { toast.error('La date de fin est requise'); return; }

    await onSubmit({
      title:       title.trim(),
      description: description.trim() || undefined,
      image:       image.trim() || undefined,
      discount:    discount.trim(),
      validUntil,
      category:    category.trim() || undefined,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Informations ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Informations
        </h2>

        <Field label="Titre" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLS}
            placeholder="Ex : Pack Ramadan -25%"
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={INPUT_CLS + ' resize-none'}
            placeholder="Détails de l'offre…"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Remise" required hint="texte libre">
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={INPUT_CLS}
              placeholder="Ex : 25%, -500 FCFA, 2+1"
              required
            />
          </Field>
          <Field label="Catégorie">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT_CLS}
              placeholder="Ex : Alimentaire"
            />
          </Field>
        </div>

        <Field label="Valable jusqu'au" required>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={INPUT_CLS}
            required
          />
        </Field>

        <Field label="Image de bannière" hint="URL">
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={INPUT_CLS}
            placeholder="https://exemple.com/image.jpg"
          />
        </Field>
      </section>

      {/* ── Paramètres ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
          Paramètres
        </h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-[#001489]' : 'bg-gray-200'}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Offre active</p>
            <p className="text-xs text-gray-500">Visible sur la boutique</p>
          </div>
        </label>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => window.history.back()}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-8 text-white"
          style={{ background: PRIMARY, boxShadow: '0 4px 12px rgba(249,70,28,0.25)' }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </span>
          ) : isEdit ? (
            'Enregistrer les modifications'
          ) : (
            "Créer l'offre"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 text-xs font-normal ml-1.5">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
