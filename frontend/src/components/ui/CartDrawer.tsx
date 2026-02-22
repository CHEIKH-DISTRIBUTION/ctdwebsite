'use client';

/**
 * CartDrawer — slide-in cart panel from the right side.
 *
 * Reads from the feature cart store (cheikh-cart-v2).
 * Brand colours: PRIMARY #F9461C · SECONDARY #001489
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/button';

const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';

function getPrimaryImage(images: Array<{ url: string; isPrimary?: boolean }>): string {
  return images.find((img) => img.isPrimary)?.url ?? images[0]?.url ?? '/images/placeholder.jpg';
}

export function CartDrawer() {
  const {
    items,
    packItems,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    removePack,
    getEstimatedTotal,
    getItemCount,
  } = useCartStore();

  const total     = getEstimatedTotal();
  const itemCount = getItemCount();
  const remaining = Math.max(0, 50_000 - total);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: PRIMARY }} />
                Mon panier
                {itemCount > 0 && (
                  <span
                    className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ background: PRIMARY }}
                  >
                    {itemCount}
                  </span>
                )}
              </h2>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* ── Items list ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {items.length === 0 && packItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">Votre panier est vide</p>
                  <Button
                    asChild
                    className="rounded-xl text-sm"
                    style={{ background: SECONDARY }}
                    onClick={closeDrawer}
                  >
                    <Link href="/products">Découvrir nos produits</Link>
                  </Button>
                </div>
              ) : (
                <>
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const imageUrl = getPrimaryImage(item.product.images ?? []);
                    return (
                      <motion.div
                        key={item.product._id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        {/* Product image */}
                        <Link
                          href={`/products/${item.product._id}`}
                          onClick={closeDrawer}
                          className="flex-shrink-0"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shadow-sm">
                            <Image
                              src={imageUrl}
                              alt={item.product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product._id}`}
                            onClick={closeDrawer}
                          >
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight hover:text-[#001489] transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm font-extrabold mt-0.5" style={{ color: PRIMARY }}>
                            {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                                aria-label="Diminuer la quantité"
                              >
                                {item.quantity <= 1 ? (
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                ) : (
                                  <Minus className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product._id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                              aria-label="Supprimer l'article"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Pack items */}
                {packItems.length > 0 && (
                  <>
                    {items.length > 0 && (
                      <div className="border-t border-gray-100 my-1" />
                    )}
                    <AnimatePresence mode="popLayout">
                      {packItems.map((item) => (
                        <motion.div
                          key={item.pack._id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                          className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          {/* Pack icon */}
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center"
                            style={{ border: `1px solid ${SECONDARY}18` }}>
                            {item.pack.image?.url ? (
                              <Image
                                src={item.pack.image.url}
                                alt={item.pack.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                              />
                            ) : (
                              <Package className="h-6 w-6" style={{ color: SECONDARY }} />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 leading-tight">
                              {item.pack.name}
                            </h3>
                            <p className="text-sm font-extrabold mt-0.5" style={{ color: PRIMARY }}>
                              {(item.pack.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.pack.items.length} produit{item.pack.items.length !== 1 ? 's' : ''} · ×{item.quantity}
                            </p>
                            <button
                              onClick={() => removePack(item.pack._id)}
                              className="mt-1.5 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                              aria-label="Retirer le pack"
                            >
                              <Trash2 className="h-3 w-3" />
                              Retirer
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            {(items.length > 0 || packItems.length > 0) && (
              <div className="px-4 pb-5 pt-4 border-t border-gray-100 space-y-4">
                {/* Free delivery progress */}
                {remaining > 0 ? (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-blue-700 mb-1.5">
                      <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                      <p className="text-xs font-medium">
                        Plus que{' '}
                        <strong>{remaining.toLocaleString('fr-FR')} FCFA</strong>{' '}
                        pour la livraison gratuite
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((total / 50_000) * 100, 100)}%`,
                          background: SECONDARY,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-3 py-2.5">
                    <Truck className="h-4 w-4 flex-shrink-0" />
                    <p className="text-xs font-semibold">Livraison offerte !</p>
                  </div>
                )}

                {/* Estimated total */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">Total estimé</span>
                  <span className="text-xl font-extrabold tracking-tight" style={{ color: PRIMARY }}>
                    {total.toLocaleString('fr-FR')}{' '}
                    <span className="text-sm font-semibold text-gray-500">FCFA</span>
                  </span>
                </div>

                {/* CTAs */}
                <Button
                  asChild
                  className="w-full h-11 text-sm font-semibold rounded-xl"
                  style={{ background: PRIMARY, boxShadow: '0 4px 14px rgba(249,70,28,0.30)' }}
                  onClick={closeDrawer}
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Commander maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl text-sm border-gray-200 hover:border-[#001489] hover:text-[#001489] transition-colors"
                  onClick={closeDrawer}
                >
                  <Link href="/cart">Voir mon panier complet</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
