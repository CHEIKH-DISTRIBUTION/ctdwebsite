// src/app/(shop)/cart/page.tsx
'use client';

import { useCartStore, type CartItem, type CartPackItem } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Gift,
  Clock,
  Zap,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

// Couleurs de la palette
const COLORS = {
  primary: '#001489',   // Pantone Reflex Blue C
  secondary: '#F9461C', // Pantone 711 C
  accent: '#FFB500',    // Pantone 1235 C
};

function getProductImage(product: CartItem['product']): string {
  return (
    product.images.find((i) => i.isPrimary)?.url ??
    product.images[0]?.url ??
    '/images/placeholder.jpg'
  );
}

export default function CartPage() {
  const {
    items, packItems,
    getEstimatedTotal, updateQuantity, removeItem,
    updatePackQuantity, removePack,
    clearCart, getItemCount,
  } = useCartStore();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const total = getEstimatedTotal();
  const itemCount = getItemCount();
  const deliveryThreshold = 50000;
  const remainingForFreeDelivery = deliveryThreshold - total > 0 ? deliveryThreshold - total : 0;

  const handleRemoveItem = async (productId: string) => {
    setIsRemoving(productId);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(productId);
    setIsRemoving(null);
  };

  const handleClearCart = async () => {
    setIsRemoving('all');
    await new Promise(resolve => setTimeout(resolve, 500));
    clearCart();
    setIsRemoving(null);
  };

  if (items.length === 0 && packItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-12 text-center max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#001489] to-[#001070] rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Votre panier est vide</h1>
            <p className="text-gray-600 mb-6">Découvrez nos produits et remplissez votre panier</p>
            <Button
              asChild
              className="rounded-xl py-3 px-6 font-semibold transition-all hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Link href="/products" className="flex items-center gap-2">
                Explorer nos produits
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/products"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Continuer mes achats
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                {itemCount} article{itemCount > 1 ? 's' : ''}
              </span>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-[#f9461c] hover:text-[#d93a14] hover:bg-[#f9461c]/10 rounded-lg transition-all"
                  disabled={isRemoving === 'all'}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Vider le panier
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Mon panier
                </h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl ${
                      isRemoving === item.product._id
                        ? 'bg-[#f9461c]/10 border-[#f9461c]/20'
                        : 'bg-white border-gray-200 hover:shadow-md transition-all'
                    }`}
                  >
                    {/* Image du produit */}
                    <Link
                      href={`/products/${item.product._id}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                        <Image
                          src={getProductImage(item.product)}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    </Link>

                    {/* Détails du produit */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product._id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-[#001489] transition-colors line-clamp-2 mb-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold" style={{ color: COLORS.primary }}>
                        {item.product.price.toLocaleString()} FCFA
                      </p>

                      {/* Disponibilité */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.product.stock > 0 ? 'bg-green-500' : 'bg-[#f9461c]'
                        }`} />
                        <span className="text-xs text-gray-600">
                          {item.product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                        </span>
                      </div>
                    </div>

                    {/* Contrôles de quantité et prix */}
                    <div className="flex flex-col items-end justify-between gap-4">
                      {/* Contrôle de quantité */}
                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                        <Button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isRemoving === item.product._id}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                          variant="ghost"
                          size="icon"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 h-10 flex items-center justify-center text-sm font-medium border-x border-gray-300 bg-white">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={isRemoving === item.product._id}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                          variant="ghost"
                          size="icon"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Prix total et actions */}
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg text-gray-800">
                          {(item.product.price * item.quantity).toLocaleString()} FCFA
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={isRemoving === item.product._id}
                          className="p-2 text-[#f9461c] hover:text-[#d93a14] hover:bg-[#f9461c]/10 transition-colors rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pack items */}
              {packItems.length > 0 && (
                <>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4" style={{ color: COLORS.secondary }} />
                      Packs
                    </h2>
                    <AnimatePresence mode="popLayout">
                      {packItems.map((item: CartPackItem, index: number) => (
                        <motion.div
                          key={item.pack._id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl mb-3 ${
                            isRemoving === item.pack._id
                              ? 'bg-[#f9461c]/10 border-[#f9461c]/20'
                              : 'bg-white border-gray-200 hover:shadow-md transition-all'
                          }`}
                        >
                          {/* Pack icon */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-xl flex items-center justify-center"
                              style={{ background: `${COLORS.secondary}12` }}>
                              {item.pack.image?.url ? (
                                <Image
                                  src={item.pack.image.url}
                                  alt={item.pack.name}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover rounded-xl"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                                />
                              ) : (
                                <Package className="h-10 w-10" style={{ color: COLORS.secondary }} />
                              )}
                            </div>
                          </div>

                          {/* Pack details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                              {item.pack.name}
                            </h3>
                            {item.pack.discount ? (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold" style={{ color: COLORS.primary }}>
                                  {item.pack.price.toLocaleString()} FCFA
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {item.pack.originalPrice.toLocaleString()} FCFA
                                </span>
                                <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded"
                                  style={{ background: COLORS.secondary }}>
                                  -{item.pack.discount}%
                                </span>
                              </div>
                            ) : (
                              <p className="text-lg font-bold mb-1" style={{ color: COLORS.primary }}>
                                {item.pack.price.toLocaleString()} FCFA
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {item.pack.items.length} produit{item.pack.items.length !== 1 ? 's' : ''} inclus
                            </p>
                          </div>

                          {/* Quantity + remove */}
                          <div className="flex flex-col items-end justify-between gap-4">
                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                              <Button
                                onClick={() => updatePackQuantity(item.pack._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isRemoving === item.pack._id}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                variant="ghost"
                                size="icon"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 h-10 flex items-center justify-center text-sm font-medium border-x border-gray-300 bg-white">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() => updatePackQuantity(item.pack._id, item.quantity + 1)}
                                disabled={isRemoving === item.pack._id}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                variant="ghost"
                                size="icon"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-bold text-lg text-gray-800">
                                {(item.pack.price * item.quantity).toLocaleString()} FCFA
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePack(item.pack._id)}
                                disabled={isRemoving === item.pack._id}
                                className="p-2 text-[#f9461c] hover:text-[#d93a14] hover:bg-[#f9461c]/10 transition-colors rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Actions supplémentaires */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-[#001489] hover:text-[#001489] transition-all"
                >
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    Continuer mes achats
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl text-[#f9461c] hover:text-[#d93a14] hover:bg-[#f9461c]/10 border-[#f9461c] transition-all"
                  onClick={handleClearCart}
                  disabled={isRemoving === 'all'}
                >
                  <Trash2 className="h-4 w-4" />
                  Vider le panier
                </Button>
              </div>
            </div>

            {/* Garanties et avantages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-[#001489] to-[#001070] text-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Vos avantages exclusifs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Livraison express</div>
                    <div className="text-sm opacity-90">Sous 24h à Dakar</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Paiement sécurisé</div>
                    <div className="text-sm opacity-90">100% protégé</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Retours faciles</div>
                    <div className="text-sm opacity-90">14 jours satisfait ou remboursé</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Résumé de la commande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Résumé de la commande
              </h2>

              {/* Détails du prix */}
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span className="font-medium">{total.toLocaleString()} FCFA</span>
                </div>

                {/* Barre de progression livraison gratuite */}
                {remainingForFreeDelivery > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Plus que {remainingForFreeDelivery.toLocaleString()} FCFA pour la livraison gratuite !
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((total / deliveryThreshold) * 100, 100)}%`,
                          background: COLORS.primary,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className={remainingForFreeDelivery > 0 ? "text-gray-600" : "text-green-600 font-medium"}>
                    {remainingForFreeDelivery > 0 ? "2 000 FCFA" : "Gratuite !"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Incluses</span>
                </div>

                <hr className="my-4 border-gray-200" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total estimé</span>
                  <span style={{ color: COLORS.primary }}>
                    {total.toLocaleString()} FCFA
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  Le total définitif sera confirmé par notre équipe après validation.
                </p>
              </div>

              {/* Économies */}
              {total > 50000 && (
                <div className="bg-gradient-to-r from-[#FFB500]/20 to-[#F9461C]/20 border border-[#FFB500]/30 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2" style={{ color: COLORS.accent }}>
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Vous économisez {Math.round(total * 0.1).toLocaleString()} FCFA !
                    </span>
                  </div>
                </div>
              )}

              {/* Bouton de paiement */}
              <Button
                asChild
                className="w-full py-4 text-base font-semibold rounded-xl transition-all hover:shadow-lg mb-4 group"
                size="lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  Procéder au paiement
                  <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Sécurité */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
                <Shield className="h-3 w-3" />
                <span>Paiement 100% sécurisé avec cryptage SSL</span>
              </div>

              {/* Avantages supplémentaires */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Expédition sous 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>Support client 7j/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3 text-orange-500" />
                  <span>Retours gratuits sous 14 jours</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Mobile sticky checkout CTA ─────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Total estimé</p>
            <p className="text-lg font-extrabold" style={{ color: COLORS.secondary }}>
              {total.toLocaleString()} FCFA
            </p>
          </div>
          <Button
            asChild
            className="flex-1 max-w-xs h-11 rounded-xl text-sm font-semibold"
            style={{ background: COLORS.secondary, boxShadow: '0 4px 14px rgba(249,70,28,0.30)' }}
          >
            <Link href="/checkout" className="flex items-center justify-center gap-2">
              Commander
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind mobile CTA */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
