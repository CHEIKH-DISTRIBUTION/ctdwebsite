// src/components/cards/ProductCard.tsx
'use client';

import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Heart, Check, Star } from 'lucide-react';
import { useState } from 'react';

/* ── Brand ── */
const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';
const ACCENT    = '#FFB500';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const router    = useRouter();
  const [isLiked, setIsLiked]       = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ product, quantity: 1 });
    toast.success('Produit ajouté !', {
      description: product.name,
      action: {
        label: 'Voir le panier',
        onClick: () => router.push('/cart'),
      },
      duration: 3000,
    });
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.info(!isLiked ? 'Produit ajouté aux favoris' : 'Produit retiré des favoris');
  };

  /* ── List view ── */
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="rounded-xl overflow-hidden bg-white flex transition-shadow duration-200 hover:shadow-lg"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <Link href={`/products/${product.id}`} className="w-1/3 relative flex-shrink-0 block overflow-hidden">
          <div className="relative h-full min-h-[140px] bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
          </div>
          {!product.inStock && (
            <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-red-200">
              Rupture
            </span>
          )}
        </Link>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 mb-1.5 hover:text-[#001489] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-[13px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            {/* Stars */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < (product.rating || 4) ? 'fill-[#FFB500] text-[#FFB500]' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
              <span className="text-[12px] text-gray-400 ml-1">({product.reviewCount || 24})</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div>
              <p className="text-xl font-extrabold tracking-tight" style={{ color: PRIMARY }}>
                {product.price.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-gray-500">FCFA</span>
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-[12px] text-gray-400 line-through">
                  {product.originalPrice.toLocaleString('fr-FR')} FCFA
                </p>
              )}
            </div>

            {/* Actions */}
            {product.inStock ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={toggleLike}
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:bg-red-50"
                  style={{
                    borderColor: isLiked ? PRIMARY : 'rgba(0,0,0,0.12)',
                    color: isLiked ? PRIMARY : '#9CA3AF',
                  }}
                  aria-label="Favori"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <Button size="sm" onClick={handleAddToCart} style={{ background: PRIMARY }}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>
            ) : (
              <Button size="sm" disabled variant="outline">Indisponible</Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Grid view (default) ── */
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl overflow-hidden bg-white flex flex-col group relative transition-shadow duration-200 hover:shadow-xl"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {!product.inStock && (
          <span className="bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-red-200">
            Rupture de stock
          </span>
        )}
        {product.isNew && (
          <span
            className="text-white text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: SECONDARY }}
          >
            Nouveau
          </span>
        )}
        {(product.discount ?? 0) > 0 && (
          <span className="badge-promo text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Favourite toggle */}
      <button
        onClick={toggleLike}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm
                   flex items-center justify-center shadow-sm
                   opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
        style={{ color: isLiked ? PRIMARY : '#9CA3AF', border: `1px solid ${isLiked ? PRIMARY + '40' : 'rgba(0,0,0,0.10)'}` }}
        aria-label="Favori"
      >
        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {/* Product image */}
      <Link href={`/products/${product.id}`} className="relative overflow-hidden block">
        <div className="relative h-52 bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-[1.04] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton rounded-none" />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-[14px] text-gray-800 mb-1 group-hover:text-[#001489] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="text-[12px] text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < (product.rating || 4) ? 'fill-[#FFB500] text-[#FFB500]' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
          <span className="text-[11px] text-gray-400 ml-1">({product.reviewCount || 24})</span>
        </div>

        {/* Price hierarchy */}
        <div className="mt-auto">
          <p className="text-[22px] font-extrabold tracking-tight leading-none" style={{ color: PRIMARY }}>
            {product.price.toLocaleString('fr-FR')}
            <span className="text-sm font-semibold text-gray-500 ml-1">FCFA</span>
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-[12px] text-gray-400 line-through mt-0.5">
              {product.originalPrice.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 pb-4 pt-0">
        {product.inStock ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-[0_4px_16px_rgba(249,70,28,0.30)] active:scale-[0.98]"
              style={{ background: PRIMARY }}
            >
              <ShoppingCart className="h-4 w-4" />
              Ajouter au panier
            </button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="flex-shrink-0 h-10 w-10"
              title="Voir le produit"
            >
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <button
            disabled
            className="w-full h-10 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
          >
            Produit indisponible
          </button>
        )}
      </div>
    </motion.div>
  );
}
