'use client';

/**
 * features/catalog/components/ProductCard
 *
 * Uses ProductResponse (backend-aligned type).
 * Adds to cart via useCart hook from features/cart.
 *
 * Brand colours (Pantone):
 *   PRIMARY   = #F9461C  (711 C  — tomato red)
 *   SECONDARY = #001489  (Reflex Blue C — deep navy)
 *   ACCENT    = #FFB500  (1235 C — amber gold)
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Check, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/hooks/useCart';
import { useFavorites } from '@/features/favorites';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ProductResponse } from '@/shared/types/product.types';

const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';
const ACCENT    = '#FFB500';

interface ProductCardProps {
  product:  ProductResponse;
  viewMode?: 'grid' | 'list';
}

function getPrimaryImage(product: ProductResponse): string {
  const primary = product.images.find((img) => img.isPrimary);
  return primary?.url ?? product.images[0]?.url ?? '/images/placeholder.jpg';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem, isInCart, openDrawer } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const inCart    = isInCart(product._id);
  const inStock   = product.stock > 0;
  const imageUrl  = getPrimaryImage(product);
  const liked     = isFavorite(product._id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Connectez-vous pour sauvegarder des favoris');
      router.push('/login');
      return;
    }
    await toggleFavorite(product._id);
    toast.success(liked ? 'Retiré des favoris' : 'Ajouté aux favoris', {
      description: product.name,
      duration: 2000,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Produit ajouté !', {
      description: product.name,
      action: {
        label: 'Voir le panier',
        onClick: openDrawer,
      },
      duration: 3000,
    });
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
        <Link href={`/products/${product._id}`} className="w-1/3 relative flex-shrink-0 block overflow-hidden">
          <div className="relative h-full min-h-[140px] bg-gray-100">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
            />
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
          </div>
          {!inStock && (
            <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-red-200">
              Rupture
            </span>
          )}
        </Link>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <Link href={`/products/${product._id}`}>
              <h3 className="font-semibold text-gray-900 mb-1.5 hover:text-[#001489] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-[13px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating.average)
                      ? 'fill-[#FFB500] text-[#FFB500]'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="text-[12px] text-gray-400 ml-1">({product.rating.count})</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold tracking-tight" style={{ color: PRIMARY }}>
                {product.price.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold text-gray-500">FCFA</span>
              </p>
            </div>
            {inStock ? (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-[0_4px_16px_rgba(249,70,28,0.28)] active:scale-[0.98] flex-shrink-0"
                style={{ background: inCart ? '#16A34A' : PRIMARY }}
              >
                {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                {inCart ? 'Dans le panier' : 'Ajouter'}
              </button>
            ) : (
              <button disabled className="h-9 px-4 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200 flex-shrink-0">
                Indisponible
              </button>
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
        {!inStock && (
          <span className="bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-red-200">
            Rupture de stock
          </span>
        )}
        {product.isFeatured && (
          <span
            className="text-white text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: ACCENT, color: '#1A1A1A' }}
          >
            ★ Vedette
          </span>
        )}
      </div>

      {/* Favorite button — top-right corner */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
        title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart className={`h-4 w-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </button>

      {/* Image */}
      <Link href={`/products/${product._id}`} className="relative overflow-hidden block">
        <div className="relative h-52 bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-[1.04] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
          />
          {!imageLoaded && <div className="absolute inset-0 skeleton rounded-none" />}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product._id}`}>
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
              className={`h-3 w-3 ${
                i < Math.round(product.rating.average)
                  ? 'fill-[#FFB500] text-[#FFB500]'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
          <span className="text-[11px] text-gray-400 ml-1">({product.rating.count})</span>
        </div>

        {/* Price hierarchy */}
        <div className="mt-auto">
          <p className="text-[22px] font-extrabold tracking-tight leading-none" style={{ color: PRIMARY }}>
            {product.price.toLocaleString('fr-FR')}
            <span className="text-sm font-semibold text-gray-500 ml-1">FCFA</span>
          </p>
          {/* Stock indicator */}
          {inStock && product.stock <= 10 && (
            <p className="text-[11px] font-medium mt-1" style={{ color: '#D97706' }}>
              Plus que {product.stock} en stock
            </p>
          )}
        </div>
      </div>

      {/* Action bar — always visible, full width CTA */}
      <div className="px-4 pb-4 pt-0">
        {inStock ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: inCart ? '#16A34A' : PRIMARY,
                boxShadow: inCart
                  ? '0 2px 8px rgba(22,163,74,0.25)'
                  : '0 2px 8px rgba(249,70,28,0.20)',
              }}
            >
              {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {inCart ? 'Dans le panier' : 'Ajouter au panier'}
            </button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="flex-shrink-0 h-10 w-10"
              title="Voir le produit"
            >
              <Link href={`/products/${product._id}`}>
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
