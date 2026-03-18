'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useFavorites } from '@/features/favorites';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ProductResponse } from '@/shared/types/product.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Shield, RotateCcw, Star, Heart, Share2, Check, Plus, Minus,
  ArrowLeft, ShoppingCart, Zap, Package, Users, Award, ChevronRight, Loader2,
  MessageSquare, ChevronRight as BreadcrumbSep,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const PRIMARY   = '#001489';
const SECONDARY = '#F9461C';
const ACCENT    = '#FFB500';

function getImage(p: ProductResponse): string {
  return p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? '/images/placeholder.jpg';
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [product, setProduct]       = useState<ProductResponse | null>(null);
  const [similar, setSimilar]       = useState<ProductResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFoundState, setNotFound] = useState(false);
  const [quantity, setQuantity]     = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab]   = useState('description');

  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { product: p } = await catalogApi.getProduct(id);
        setProduct(p);
        setSelectedImage(0);

        // Fetch similar products (same category, exclude current)
        const similar = await catalogApi.getProducts({ category: p.category, limit: 5 });
        setSimilar(similar.products.filter((s) => s._id !== id).slice(0, 4));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
      </div>
    );
  }

  if (notFoundState || !product) {
    notFound();
  }

  const images = product.images.length > 0
    ? product.images
    : [{ url: '/images/placeholder.jpg', isPrimary: true }];

  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Produit ajouté !', {
      description: `${quantity} × ${product.name}`,
      action: { label: 'Voir le panier', onClick: () => router.push('/cart') },
      duration: 3000,
    });
  };

  const increment = () => setQuantity((q) => (q < product.stock ? q + 1 : q));
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const liked = product ? isFavorite(product._id) : false;

  const toggleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Connectez-vous pour sauvegarder des favoris');
      router.push('/login');
      return;
    }
    await toggleFavorite(product!._id);
    toast.success(liked ? 'Retiré des favoris' : 'Ajouté aux favoris', { duration: 2000 });
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Breadcrumb + actions */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0 flex-1">
            <Link href="/" className="hover:text-gray-800 transition-colors flex-shrink-0">Accueil</Link>
            <BreadcrumbSep className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href="/products" className="hover:text-gray-800 transition-colors flex-shrink-0">Produits</Link>
            <BreadcrumbSep className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-gray-800 font-medium truncate">{product.name}</span>
          </nav>
          <button onClick={toggleLike} className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
            <Heart className={`h-6 w-6 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          </button>
          <button onClick={shareProduct} className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
            <Share2 className="h-6 w-6 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
              {images[selectedImage]?.url ? (
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt ?? product.name}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-300" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="bg-[#001489] text-white text-sm px-3 py-1 rounded-full font-medium">
                    Coup de cœur
                  </span>
                )}
                {!inStock && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Rupture de stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all relative ${
                      selectedImage === index
                        ? 'border-[#001489] ring-2 ring-[#001489]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${PRIMARY}20`, color: PRIMARY }}>
                {product.category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${
                      i < Math.round(product.rating.average) ? 'text-[#FFB500] fill-current' : 'text-gray-300'
                    }`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.rating.count} avis)</span>
                {product.brand && (
                  <span className="text-sm text-gray-500 ml-4">Marque: {product.brand}</span>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold" style={{ color: SECONDARY }}>
                {product.price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.weight && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span>{product.weight.value} {product.weight.unit}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>Ref: {product.sku}</span>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Users className="h-4 w-4 text-gray-500" />
                <span className={product.stock <= product.minStock ? 'text-red-600 font-semibold' : ''}>
                  {product.stock} disponible{product.stock !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Quantité</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <Button onClick={decrement} variant="ghost" disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 h-12 flex items-center justify-center text-lg font-medium border-x border-gray-300 bg-white">
                    {quantity}
                  </span>
                  <Button onClick={increment} variant="ghost" disabled={quantity >= product.stock}
                    className="w-12 h-12 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {inStock ? (
                <>
                  <Button size="lg" className="flex-1 rounded-xl text-base font-semibold"
                    onClick={handleAddToCart} style={{ backgroundColor: SECONDARY }}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1 rounded-xl text-base font-semibold"
                    style={{ borderColor: PRIMARY, color: PRIMARY }}>
                    Acheter maintenant <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </>
              ) : (
                <Button size="lg" disabled className="w-full rounded-xl">
                  Rupture de stock
                </Button>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-gray-200">
              {[
                { icon: Truck, label: 'Livraison rapide', sub: 'Sous 24h à Dakar', bg: 'bg-blue-50', iconColor: PRIMARY },
                { icon: Shield, label: 'Paiement sécurisé', sub: '100% protégé', bg: 'bg-green-50', iconColor: '#28a745' },
                { icon: RotateCcw, label: 'Retours faciles', sub: '14 jours', bg: 'bg-amber-50', iconColor: '#F59E0B' },
              ].map(({ icon: Icon, label, sub, bg, iconColor }) => (
                <div key={label} className={`flex flex-col items-center gap-2 p-3 ${bg} rounded-xl text-center`}>
                  <Icon className="h-5 w-5" style={{ color: iconColor }} />
                  <div>
                    <div className="font-medium text-xs text-gray-800">{label}</div>
                    <div className="text-xs text-gray-500">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200"
        >
          <div className="border-b border-gray-200 flex space-x-8 px-6">
            {[
              { id: 'description', label: 'Description', icon: Package },
              { id: 'specifications', label: 'Spécifications', icon: Zap },
              { id: 'reviews', label: `Avis (${product.rating.count})`, icon: MessageSquare },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#001489] text-[#001489]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  <ul className="mt-4 space-y-2">
                    {[
                      'Matériaux de première qualité',
                      'Respect des normes de sécurité',
                      'Garantie constructeur incluse',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {activeTab === 'specifications' && (
                <motion.div key="specs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block text-xs mb-1">Catégorie</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    {product.brand && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block text-xs mb-1">Marque</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block text-xs mb-1">Référence SKU</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    {product.weight && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 block text-xs mb-1">Poids</span>
                        <span className="font-medium">{product.weight.value} {product.weight.unit}</span>
                      </div>
                    )}
                    {product.tags.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                        <span className="text-gray-500 block text-xs mb-2">Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {(!product.reviews || product.reviews.length === 0) ? (
                    <div className="text-center py-10">
                      <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 mb-1">Aucun avis pour ce produit.</p>
                      <p className="text-sm text-gray-400">Soyez le premier à donner votre avis !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div key={review._id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#001489] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {(typeof review.user === 'object' ? review.user.name : 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">
                                  {typeof review.user === 'object' ? review.user.name : 'Utilisateur'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-[#FFB500] fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Similar products */}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
              <Link href="/products" className="flex items-center gap-2 font-medium transition-all hover:gap-3"
                style={{ color: PRIMARY }}>
                Voir tout <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => (
                <Link key={p._id} href={`/products/${p._id}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={getImage(p)} alt={p.name} fill className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2">{p.name}</p>
                    <p className="text-base font-extrabold mt-2" style={{ color: SECONDARY }}>
                      {p.price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
