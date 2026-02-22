'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductResponse, ProductCategory } from '@/shared/types/product.types';

const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';

const CATEGORIES: ProductCategory[] = [
  'Alimentaire',
  'Hygiène',
  'Électroménager',
  'Vêtements',
];

const INPUT_CLS =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm ' +
  'focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[#001489]/15 ' +
  'transition-all placeholder-gray-300';

export type ProductFormProps = {
  initialData?: ProductResponse;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
};

export function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const isEdit = !!initialData;

  const [name, setName]           = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [price, setPrice]         = useState(initialData ? String(initialData.price) : '');
  const [category, setCategory]   = useState<ProductCategory>(initialData?.category ?? 'Alimentaire');
  const [stock, setStock]         = useState(initialData ? String(initialData.stock) : '0');
  const [minStock, setMinStock]   = useState(initialData ? String(initialData.minStock) : '5');
  const [sku, setSku]             = useState(initialData?.sku ?? '');
  const [brand, setBrand]         = useState(initialData?.brand ?? '');
  const [isActive, setIsActive]   = useState(initialData?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [tags, setTags]           = useState(initialData?.tags?.join(', ') ?? '');
  const [newFiles, setNewFiles]   = useState<File[]>([]);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setNewFiles(Array.from(files).slice(0, 5));
  };

  const clearNewFiles = () => {
    setNewFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim())        { toast.error('Le nom est requis'); return; }
    if (!description.trim()) { toast.error('La description est requise'); return; }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error('Le prix doit être un nombre positif'); return;
    }
    if (!sku.trim()) { toast.error('Le SKU est requis'); return; }

    const fd = new FormData();
    fd.append('name',        name.trim());
    fd.append('description', description.trim());
    fd.append('price',       String(parseFloat(price)));
    fd.append('category',    category);
    fd.append('stock',       String(parseInt(stock) || 0));
    fd.append('minStock',    String(parseInt(minStock) || 5));
    fd.append('sku',         sku.trim());
    if (brand.trim()) fd.append('brand', brand.trim());
    fd.append('isActive',   String(isActive));
    fd.append('isFeatured', String(isFeatured));

    tags.split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => fd.append('tags', tag));

    newFiles.forEach((file) => fd.append('images', file));

    await onSubmit(fd);
  };

  const existingImages = initialData?.images ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Informations générales ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Informations générales
        </h2>

        <Field label="Nom du produit" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="Ex : Riz Parfumé 25kg"
            required
          />
        </Field>

        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={INPUT_CLS + ' resize-none'}
            placeholder="Description du produit…"
            required
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Marque">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={INPUT_CLS}
              placeholder="Ex : Kellogg's"
            />
          </Field>
          <Field label="Catégorie" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className={INPUT_CLS}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU" required>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={INPUT_CLS}
              placeholder="Ex : RIZ-25KG-001"
              required
            />
          </Field>
          <Field label="Tags" hint="séparés par des virgules">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={INPUT_CLS}
              placeholder="riz, céréale, wholesale"
            />
          </Field>
        </div>
      </section>

      {/* ── Prix & Stock ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Prix & Stock
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Prix (FCFA)" required>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              className={INPUT_CLS}
              placeholder="0"
              required
            />
          </Field>
          <Field label="Stock" required>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min={0}
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Stock minimum">
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              min={0}
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </section>

      {/* ── Paramètres ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
          Paramètres
        </h2>
        <div className="flex flex-wrap gap-8">
          <Toggle
            label="Produit actif"
            description="Visible sur la boutique"
            checked={isActive}
            onChange={setIsActive}
          />
          <Toggle
            label="Mis en avant"
            description="Affiché en page d'accueil"
            checked={isFeatured}
            onChange={setIsFeatured}
          />
        </div>
      </section>

      {/* ── Images ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Images
        </h2>

        {/* Images existantes (mode édition, avant sélection de nouveaux fichiers) */}
        {isEdit && existingImages.length > 0 && newFiles.length === 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">
              Images actuelles — sélectionnez de nouveaux fichiers pour les remplacer
            </p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ''}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  {img.isPrimary && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                      Principale
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone de dépôt */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center
                     hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <Upload className="h-7 w-7 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {newFiles.length > 0
              ? `${newFiles.length} fichier(s) sélectionné(s) — cliquez pour changer`
              : isEdit
              ? 'Cliquez pour remplacer les images'
              : 'Cliquez pour ajouter des images'}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 5 Mo — max 5 images</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </button>

        {/* Aperçu des nouveaux fichiers */}
        {newFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {newFiles.map((file, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                    Principale
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={clearNewFiles}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-xl flex-shrink-0
                         border-2 border-dashed border-gray-200 text-gray-400
                         hover:text-red-500 hover:border-red-200 transition-colors text-xs gap-1"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
        )}
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
            'Créer le produit'
          )}
        </Button>
      </div>
    </form>
  );
}

// ── Composants internes ─────────────────────────────────────────────────────

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
        {hint && (
          <span className="text-gray-400 text-xs font-normal ml-1.5">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-[#001489]' : 'bg-gray-200'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                      transition-transform duration-200 ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                      }`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}
