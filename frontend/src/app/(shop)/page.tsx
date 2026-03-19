// src/app/(shop)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import "../globals.css";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Star,
  ArrowRight,
  ChevronDown,
  Zap,
  Users,
  ShoppingBag,
  Heart,
  Award,
  Sparkles,
  Package,
  Tag,
  Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { httpClient } from '@/shared/api/httpClient';
import type { ProductResponse } from '@/shared/types/product.types';
import type { PackResponse } from '@/shared/types/pack.types';

type PublicStats = {
  totalProducts: number;
  totalOrders: number;
  reviews: { _id: string; rating: number; comment?: string; userName: string; createdAt: string }[];
};

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const fadeIn = (direction: string, type: 'spring' | 'tween', delay: number, duration: number): Variants => ({
  hidden: {
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { type, delay, duration },
  },
});

const staggerContainer = (staggerChildren?: number, delayChildren?: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

const textVariant = (delay: number): Variants => ({
  hidden: { y: 50, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', duration: 1.25, delay },
  },
});

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const categories = [
  { name: 'Alimentaires',   icon: <ShoppingBag className="h-4 w-4" />, color: 'from-blue-500 to-blue-600',   href: '/products?category=Alimentaire' },
  { name: 'Électroménager', icon: <Zap className="h-4 w-4" />,         color: 'from-orange-500 to-orange-600', href: '/products?category=Électroménager' },
  { name: 'Hygiène',        icon: <Sparkles className="h-4 w-4" />,    color: 'from-purple-500 to-purple-600', href: '/products?category=Hygiène' },
  { name: 'Habillement',    icon: <Heart className="h-4 w-4" />,       color: 'from-pink-500 to-pink-600',    href: '/products?category=Vêtements' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-9 w-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function PackCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: ProductResponse; index: number }) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <motion.div
      variants={fadeIn('up', 'spring', index * 0.1, 1)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
    >
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="h-16 w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#001489] text-white text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          {product.rating.count > 0 && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                <span className="text-xs font-medium ml-1">{product.rating.average.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-[#001489]">
              {product.price.toLocaleString('fr-FR')} FCFA
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F9461C] hover:bg-[#D93810] flex items-center justify-center transition-colors">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PackCard({ pack, index }: { pack: PackResponse; index: number }) {
  const savings = pack.originalPrice - pack.price;

  return (
    <motion.div
      variants={fadeIn('up', 'spring', index * 0.1, 1)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
    >
      <Link href={`/packs/${pack._id}`} className="block">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-[#001489] to-[#001070] overflow-hidden flex items-center justify-center">
          {pack.image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pack.image.url}
              alt={pack.image.alt ?? pack.name}
              className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-14 w-14 text-white/30" />
          </div>
          {pack.discount != null && pack.discount > 0 && (
            <div className="absolute top-4 right-4 bg-[#F9461C] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{pack.discount}%
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-2">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{pack.name}</h3>
          {pack.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{pack.description}</p>
          )}
          <div className="flex items-end gap-2 pt-1">
            <span className="text-xl font-bold text-[#F9461C]">
              {pack.price.toLocaleString('fr-FR')} FCFA
            </span>
            {pack.originalPrice > pack.price && (
              <span className="text-sm text-gray-400 line-through mb-0.5">
                {pack.originalPrice.toLocaleString('fr-FR')}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Économie de {savings.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [featuredPacks,    setFeaturedPacks]    = useState<PackResponse[]>([]);
  const [productsLoading,  setProductsLoading]  = useState(true);
  const [packsLoading,     setPacksLoading]     = useState(true);
  const [productsError,    setProductsError]    = useState(false);
  const [packsError,       setPacksError]       = useState(false);
  const [publicStats,      setPublicStats]      = useState<PublicStats | null>(null);

  useEffect(() => {
    httpClient.get<PublicStats>('/api/stats/public')
      .then(setPublicStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    catalogApi.getProducts({ featured: true, limit: 4, inStock: true })
      .then((res) => { setFeaturedProducts(res.products); setProductsError(false); })
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    catalogApi.getPacks({ featured: true })
      .then((res) => { setFeaturedPacks(res); setPacksError(false); })
      .catch(() => setPacksError(true))
      .finally(() => setPacksLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.1&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50" />
        </div>

        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          animate="show"
          className="container relative z-20 mx-auto px-4 text-center"
        >
          <motion.div
            variants={fadeIn('up', 'spring', 0.2, 1)}
            className="inline-flex items-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
          >
            <Award className="h-5 w-5 mr-2 text-[#FFB500]" />
            <span className="text-sm font-medium text-white">N°1 de la distribution à Dakar</span>
          </motion.div>

          <motion.h1
            variants={textVariant(0.3)}
            className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
          >
            Votre Supermarché
            <br />
            <span className="text-[#FFB500]">En Ligne</span>
          </motion.h1>

          <motion.p
            variants={textVariant(0.4)}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed"
          >
            Découvrez des produits de qualité pour répondre à tous vos besoins quotidiens.
            Livraison rapide et service personnalisé.
          </motion.p>

          <motion.div
            variants={fadeIn('up', 'spring', 0.5, 1)}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Button asChild size="lg" className="bg-white text-[#001489] hover:bg-gray-50 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[#001489]/30 group font-semibold">
              <Link href="/products" className="flex items-center">
                Commencer mes courses <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white bg-white/10 hover:bg-white hover:text-[#001489] px-8 py-6 text-lg rounded-xl transition-all duration-300 group font-semibold">
              <Link href="/about">Découvrir notre histoire</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="h-8 w-8 text-white/80" />
        </motion.div>
      </section>

      {/* ── Produits populaires ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer()}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <motion.div variants={textVariant(0.1)} className="inline-block mb-2">
                <span className="text-[#F9461C] font-semibold bg-[#F9461C]/10 px-4 py-2 rounded-full text-sm">Populaires</span>
              </motion.div>
              <motion.h2 variants={textVariant(0.2)} className="text-3xl font-bold text-gray-800">
                Produits <span className="text-[#001489]">du Moment</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeIn('up', 'spring', 0.2, 1)}>
              <Button asChild size="sm" variant="outline" className="border-[#001489] text-[#001489] hover:bg-[#001489] hover:text-white rounded-xl">
                <Link href="/products" className="flex items-center gap-1 font-semibold">
                  Tout voir <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Category filter chips */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer()}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((cat, index) => (
              <motion.div key={index} variants={fadeIn('up', 'spring', index * 0.05, 0.8)}>
                <Link
                  href={cat.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-[#001489] hover:text-[#001489] hover:bg-[#001489]/5 transition-all duration-200"
                >
                  {cat.icon}
                  {cat.name}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={fadeIn('up', 'spring', categories.length * 0.05, 0.8)}>
              <Link
                href="/packs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-[#F9461C] hover:text-[#F9461C] hover:bg-[#F9461C]/5 transition-all duration-200"
              >
                <Package className="h-4 w-4" />
                Packs
              </Link>
            </motion.div>
          </motion.div>

          {/* Products grid */}
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : productsError
                ? (
                  <div className="col-span-2 lg:col-span-4 text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-3 text-red-200" />
                    <p className="text-gray-500 mb-3">Impossible de charger les produits.</p>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
                      Réessayer
                    </Button>
                  </div>
                )
              : featuredProducts.length > 0
                ? featuredProducts.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
                : (
                  <div className="col-span-2 lg:col-span-4 text-center py-12 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p>Aucun produit en vedette pour le moment.</p>
                  </div>
                )
            }
          </motion.div>
        </div>
      </section>

      {/* ── Packs en vedette ── */}
      {(packsLoading || packsError || featuredPacks.length > 0) && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={staggerContainer()}
              className="text-center mb-16"
            >
              <motion.div variants={textVariant(0.1)} className="inline-block mb-3">
                <span className="text-[#001489] font-semibold bg-[#001489]/10 px-4 py-2 rounded-full">Offres groupées</span>
              </motion.div>
              <motion.h2 variants={textVariant(0.2)} className="text-4xl font-bold text-gray-800 mb-4">
                Packs <span className="text-[#F9461C]">en vedette</span>
              </motion.h2>
              <motion.p variants={textVariant(0.3)} className="text-gray-600 text-lg max-w-2xl mx-auto">
                Économisez plus en achetant nos packs soigneusement composés
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer()}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {packsLoading
                ? Array.from({ length: 3 }).map((_, i) => <PackCardSkeleton key={i} />)
                : packsError
                  ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-3 text-red-200" />
                      <p className="text-gray-500 mb-3">Impossible de charger les packs.</p>
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
                        Réessayer
                      </Button>
                    </div>
                  )
                  : featuredPacks.map((p, i) => <PackCard key={p._id} pack={p} index={i} />)
              }
            </motion.div>

            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="border-2 border-[#001489] text-[#001489] hover:bg-[#001489] hover:text-white px-8 py-3 rounded-xl transition-all duration-300">
                <Link href="/packs" className="flex items-center font-semibold">
                  Voir tous les packs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="py-20 bg-gradient-to-r from-[#001489] to-[#001070] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer()}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: publicStats ? `${publicStats.totalOrders.toLocaleString('fr-FR')}+` : '—', label: 'Commandes Livrées',   icon: <Users className="h-8 w-8" /> },
              { value: publicStats ? `${publicStats.totalProducts.toLocaleString('fr-FR')}+` : '—', label: 'Produits Disponibles', icon: <ShoppingBag className="h-8 w-8" /> },
              { value: '24h',  label: 'Livraison Express',    icon: <Truck className="h-8 w-8" /> },
              { value: '98%',  label: 'Satisfaction Client',  icon: <Star className="h-8 w-8" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 'spring', index * 0.1, 1)}
                className="p-6 group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-[#FFB500] mb-2">{stat.value}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
                <div className="w-16 h-0.5 bg-[#F9461C] mx-auto mt-4 group-hover:w-24 transition-all duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer()}
            className="text-center mb-16"
          >
            <motion.div variants={textVariant(0.1)} className="inline-block mb-3">
              <span className="text-[#001489] font-semibold bg-[#001489]/10 px-4 py-2 rounded-full">Témoignages</span>
            </motion.div>
            <motion.h2 variants={textVariant(0.2)} className="text-4xl font-bold text-gray-800 mb-4">
              Ce que disent nos <span className="text-[#F9461C]">clients</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {(publicStats && publicStats.reviews.length >= 3
              ? publicStats.reviews.slice(0, 3).map((r) => ({
                  name: r.userName,
                  role: 'Client vérifié',
                  content: r.comment || 'Très satisfait de mon achat !',
                  rating: r.rating,
                }))
              : [
                  { name: "Aïcha D.",   role: 'Client fidèle', content: "Service exceptionnel et livraison toujours à l'heure. Je recommande vivement !", rating: 5 },
                  { name: 'Mamadou S.', role: 'Commerçant',    content: 'Des produits de qualité et des prix compétitifs. Parfait pour mon commerce.',     rating: 5 },
                  { name: 'Sophie T.',  role: 'Particulier',   content: 'Application facile à utiliser et support client très réactif. Excellent !',         rating: 5 },
                ]
            ).map((t, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 'spring', index * 0.1, 1)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&quot;{t.content}&quot;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#001489] to-[#001070] rounded-full flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-800">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-[#001489] to-[#001070] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer()}
            className="max-w-3xl mx-auto"
          >
            <motion.h2 variants={textVariant(0.1)} className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à faire vos courses ?
            </motion.h2>
            <motion.p variants={textVariant(0.2)} className="text-xl text-blue-100 mb-10">
              Rejoignez des milliers de clients satisfaits et découvrez la meilleure expérience
              d&apos;achat en ligne au Sénégal
            </motion.p>
            <motion.div
              variants={fadeIn('up', 'spring', 0.3, 1)}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="bg-white text-[#001489] hover:bg-gray-50 px-8 py-4 text-lg rounded-xl font-semibold">
                <Link href="/products">Commencer à shopper</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-[#001489] hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-xl font-semibold">
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
