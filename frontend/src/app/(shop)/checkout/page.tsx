// src/app/(shop)/checkout/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Check,
  Shield,
  Truck,
  RotateCcw,
  CreditCard,
  Smartphone,
  Lock,
  AlertCircle,
  Wallet,
  ChevronRight,
  Tag,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useCheckout, type CheckoutPaymentMethod } from '@/features/checkout/hooks/useCheckout';
import { checkoutApi, type CouponValidation } from '@/features/checkout/api/checkout.api';
import { authApi } from '@/features/auth/api/auth.api';
import type { UserAddressEntry } from '@/shared/types/user.types';

/* ── Brand colours (Pantone) ── */
const PRIMARY   = '#F9461C';   // Pantone 711 C
const SECONDARY = '#001489';   // Pantone Reflex Blue C
const ACCENT    = '#FFB500';   // Pantone 1235 C

const PAYMENT_METHODS: {
  id:           CheckoutPaymentMethod;
  label:        string;
  description:  string;
  icon:         ElementType;
  bg:           string;
  instructions: string;
}[] = [
  {
    id: 'wave',
    label: 'Wave',
    description: 'Paiement mobile instantané',
    icon: Smartphone,
    bg: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    instructions: "Ouvrez l'application Wave et scannez le QR code qui s'affichera pour confirmer.",
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    description: 'Paiement par mobile money',
    icon: Smartphone,
    bg: 'linear-gradient(135deg, #ea580c, #f97316)',
    instructions: 'Vous recevrez un code USSD à composer pour confirmer votre paiement.',
  },
  {
    id: 'bank_transfer',
    label: 'Virement bancaire',
    description: 'Virement vers notre compte',
    icon: CreditCard,
    bg: `linear-gradient(135deg, ${SECONDARY}, #001070)`,
    instructions: "Les coordonnées bancaires vous seront communiquées après validation.",
  },
  {
    id: 'cash',
    label: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception',
    icon: Wallet,
    bg: 'linear-gradient(135deg, #15803d, #16a34a)',
    instructions: 'Préparez le montant exact. Le livreur vous remettra un reçu.',
  },
];

/* ── Shared input style ── */
const inputCls =
  'w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 ' +
  'bg-white transition-all duration-150 ' +
  'border-gray-200 hover:border-gray-300 ' +
  'focus:outline-none focus:border-[#F9461C] focus:ring-2 focus:ring-[rgba(249,70,28,0.12)]';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, packItems, getItemCount, getEstimatedTotal } = useCartStore();
  const {
    paymentMethod,
    deliveryAddress,
    customerNote,
    isAgreedToTerms,
    isSubmitting,
    setPaymentMethod,
    setDeliveryAddress,
    setCustomerNote,
    setIsAgreedToTerms,
    submitOrder,
  } = useCheckout();

  const [promoCode,       setPromoCode]       = useState('');
  const [promoMessage,    setPromoMessage]    = useState<string | null>(null);
  const [promoError,      setPromoError]      = useState(false);
  const [appliedCoupon,   setAppliedCoupon]   = useState<CouponValidation | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<UserAddressEntry[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('');

  const loadSavedAddresses = useCallback(async () => {
    try {
      const addrs = await authApi.getAddresses();
      setSavedAddresses(addrs);
      // Auto-select default address
      const defaultAddr = addrs.find((a) => a.isDefault);
      if (defaultAddr && !deliveryAddress.street.trim()) {
        setSelectedAddrId(defaultAddr._id);
        setDeliveryAddress({
          street: defaultAddr.street,
          city: defaultAddr.city,
          region: defaultAddr.region ?? '',
          instructions: '',
        });
      }
    } catch { /* ignore — user can type manually */ }
  }, [deliveryAddress.street, setDeliveryAddress]);

  useEffect(() => {
    if (isAuthenticated) loadSavedAddresses();
  }, [isAuthenticated, loadSavedAddresses]);

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddrId(addrId);
    if (addrId === '') {
      setDeliveryAddress({ street: '', city: '', region: '', instructions: '' });
      return;
    }
    const addr = savedAddresses.find((a) => a._id === addrId);
    if (addr) {
      setDeliveryAddress({
        street: addr.street,
        city: addr.city,
        region: addr.region ?? '',
        instructions: deliveryAddress.instructions ?? '',
      });
    }
  };

  // Redirect unauthenticated users before they fill the form
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?from=/checkout');
    }
  }, [isAuthenticated, router]);

  const itemCount          = getItemCount();
  const selectedMethodMeta = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  /* ── Auth guard (redirecting) ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: `${PRIMARY}30`, borderTopColor: PRIMARY }}
        />
      </div>
    );
  }

  /* ── Empty cart state ── */
  if (items.length === 0 && packItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-10 shadow-md text-center max-w-md w-full"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
            style={{ background: `${PRIMARY}12` }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: PRIMARY }} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Ajoutez des produits à votre panier avant de procéder au paiement.
          </p>
          <Button asChild size="lg" className="rounded-xl" style={{ background: PRIMARY }}>
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Explorer le catalogue
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Progress bar / breadcrumb ─────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-lg">
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour au panier
            </Link>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: 'Panier',   done: true  },
                { n: 2, label: 'Livraison', done: false },
                { n: 3, label: 'Paiement',  done: false },
              ].map((step, idx) => (
                <div key={step.n} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        step.done
                          ? { background: PRIMARY, color: '#fff' }
                          : idx === 1
                          ? { background: `${SECONDARY}15`, color: SECONDARY, border: `2px solid ${SECONDARY}` }
                          : { background: '#F5F5F5', color: '#A3A3A3' }
                      }
                    >
                      {step.done ? <Check className="h-3.5 w-3.5" /> : step.n}
                    </div>
                    <span
                      className="text-xs font-medium hidden sm:block"
                      style={{ color: idx === 1 ? SECONDARY : idx === 0 ? '#9CA3AF' : '#D1D5DB' }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className="w-6 h-px"
                      style={{ background: idx === 0 ? PRIMARY : '#E5E7EB' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              Sécurisé
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >

          {/* ── Left column ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Page title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
              <p className="text-sm text-gray-500 mt-1">
                {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
              </p>
            </div>

            {/* ── Delivery address ──────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${SECONDARY}12` }}
                >
                  <MapPin className="h-4 w-4" style={{ color: SECONDARY }} />
                </div>
                Adresse de livraison
              </h2>

              {/* Saved addresses dropdown */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <label htmlFor="saved-address" className="sr-only">Adresse enregistrée</label>
                    <select
                      id="saved-address"
                      value={selectedAddrId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className={inputCls + ' appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="">Saisir une nouvelle adresse</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.label} — {addr.street}, {addr.city}
                          {addr.isDefault ? ' (par défaut)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Choisissez une adresse enregistrée ou saisissez-en une nouvelle
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="addr-street" className="sr-only">Rue / Quartier</label>
                  <input
                    id="addr-street"
                    type="text"
                    placeholder="Rue / Quartier *"
                    required
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className={inputCls + (!deliveryAddress.street.trim() && isSubmitting ? ' !border-red-400 !ring-red-100' : '')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-city" className="sr-only">Ville</label>
                    <input
                      id="addr-city"
                      type="text"
                      placeholder="Ville *"
                      required
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      className={inputCls + (!deliveryAddress.city.trim() && isSubmitting ? ' !border-red-400 !ring-red-100' : '')}
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-region" className="sr-only">Région</label>
                    <input
                      id="addr-region"
                      type="text"
                      placeholder="Région"
                      value={deliveryAddress.region ?? ''}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, region: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="addr-instructions" className="sr-only">Instructions de livraison</label>
                  <input
                    id="addr-instructions"
                    type="text"
                    placeholder="Instructions de livraison (point de repère, étage…)"
                    value={deliveryAddress.instructions ?? ''}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </motion.section>

            {/* ── Payment method ────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.10 }}
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${SECONDARY}12` }}
                >
                  <CreditCard className="h-4 w-4" style={{ color: SECONDARY }} />
                </div>
                Méthode de paiement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon     = method.icon;
                  const selected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      className="p-4 rounded-xl text-left transition-all duration-150 active:scale-[0.99]"
                      style={{
                        border: selected
                          ? `2px solid ${PRIMARY}`
                          : '2px solid rgba(0,0,0,0.08)',
                        background: selected ? `${PRIMARY}08` : '#FFFFFF',
                        boxShadow: selected ? `0 0 0 1px ${PRIMARY}20` : 'none',
                      }}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: method.bg }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{method.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{method.description}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                          style={{
                            borderColor: selected ? PRIMARY : '#D1D5DB',
                            background:  selected ? PRIMARY : 'transparent',
                          }}
                        >
                          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment instructions */}
              <AnimatePresence mode="wait">
                {selectedMethodMeta && (
                  <motion.div
                    key={paymentMethod}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-4 p-4 rounded-xl flex items-start gap-3"
                      style={{ background: `${SECONDARY}08`, border: `1px solid ${SECONDARY}18` }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: SECONDARY }}
                      >
                        <selectedMethodMeta.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: SECONDARY }}>
                          {selectedMethodMeta.label}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {selectedMethodMeta.instructions}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* ── Customer note ─────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <label htmlFor="customer-note" className="text-base font-semibold text-gray-900 mb-4 block">
                Note pour le livreur <span className="text-gray-400 font-normal text-sm">(optionnel)</span>
              </label>
              <textarea
                id="customer-note"
                rows={3}
                placeholder="Instructions spéciales, point de repère, heure préférable…"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className={inputCls + ' resize-none'}
              />
            </motion.section>

            {/* ── Promo code ──────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${ACCENT}20` }}
                >
                  <Tag className="h-4 w-4" style={{ color: '#B8860B' }} />
                </div>
                Code promo
                <span className="text-xs font-normal text-gray-400">(optionnel)</span>
              </h2>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="promo-code" className="sr-only">Code promo</label>
                  <input
                    id="promo-code"
                    type="text"
                    placeholder="Entrez votre code"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoMessage(null); setPromoError(false); }}
                    disabled={!!appliedCoupon}
                    className={inputCls}
                  />
                </div>
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setPromoCode(''); setPromoMessage(null); }}
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all text-red-600 border border-red-200 hover:bg-red-50"
                  >
                    Retirer
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!promoCode.trim() || validatingPromo}
                    onClick={async () => {
                      setValidatingPromo(true);
                      setPromoMessage(null);
                      setPromoError(false);
                      try {
                        const result = await checkoutApi.validateCoupon(promoCode.trim(), getEstimatedTotal());
                        setAppliedCoupon(result);
                        setPromoMessage(
                          result.discountType === 'percentage'
                            ? `-${result.discountValue}% appliqué (${result.discount.toLocaleString('fr-FR')} FCFA)`
                            : `-${result.discount.toLocaleString('fr-FR')} FCFA appliqué`
                        );
                      } catch (err: unknown) {
                        const msg = err && typeof err === 'object' && 'message' in err
                          ? (err as { message: string }).message
                          : 'Code promo invalide';
                        setPromoMessage(msg);
                        setPromoError(true);
                      } finally {
                        setValidatingPromo(false);
                      }
                    }}
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: promoCode.trim() ? SECONDARY : '#E5E7EB',
                      color: promoCode.trim() ? '#fff' : '#9CA3AF',
                    }}
                  >
                    {validatingPromo ? '...' : 'Appliquer'}
                  </button>
                )}
              </div>
              {promoMessage && (
                <p className={`mt-2 text-xs flex items-center gap-1.5 ${promoError ? 'text-red-600' : 'text-green-600'}`}>
                  {promoError
                    ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    : <Check className="h-3.5 w-3.5 flex-shrink-0" />
                  }
                  {promoMessage}
                </p>
              )}
            </motion.section>

            {/* ── Terms ────────────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <label htmlFor="cgv" className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isAgreedToTerms}
                    onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                    className="sr-only peer"
                    id="cgv"
                  />
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#F9461C]/30"
                    style={{
                      borderColor: isAgreedToTerms ? PRIMARY : '#D1D5DB',
                      background:  isAgreedToTerms ? PRIMARY : '#FFFFFF',
                    }}
                  >
                    {isAgreedToTerms && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    J&apos;accepte les conditions générales de vente
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    En cochant cette case, vous acceptez nos{' '}
                    <Link href="/terms" className="underline hover:text-gray-700 transition-colors">
                      conditions générales
                    </Link>{' '}
                    et notre{' '}
                    <Link href="/privacy" className="underline hover:text-gray-700 transition-colors">
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                </div>
              </label>
            </motion.section>
          </div>

          {/* ── Right column: order summary ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div
              className="bg-white rounded-2xl p-6 lg:sticky lg:top-4"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-base font-semibold text-gray-900 mb-5 pb-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
              >
                Résumé de commande
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: `${SECONDARY}10`, color: SECONDARY }}
                >
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </span>
              </h2>

              {/* Items list */}
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.images.find(i => i.isPrimary)?.url ?? item.product.images[0]?.url ?? '/images/placeholder.jpg'}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                      {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                ))}

                {/* Packs */}
                {packItems.map((item) => (
                  <div key={item.pack._id} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${SECONDARY}10` }}
                    >
                      {item.pack.image?.url ? (
                        <Image
                          src={item.pack.image.url}
                          alt={item.pack.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                        />
                      ) : (
                        <svg className="h-5 w-5" style={{ color: SECONDARY }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.pack.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Pack · ×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                      {(item.pack.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon discount line */}
              {appliedCoupon && (
                <div className="flex justify-between items-center px-1 mb-3 text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Réduction ({appliedCoupon.code})
                  </span>
                  <span className="text-green-700 font-bold">
                    -{appliedCoupon.discount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}

              {/* Pricing note */}
              <div
                className="mb-5 p-3 rounded-xl text-xs text-amber-700 flex items-start gap-2"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                Le total définitif (frais de livraison inclus) sera confirmé à la validation.
              </div>

              {/* Trust markers */}
              <div className="space-y-2 mb-6">
                {[
                  { icon: Shield,    text: 'Paiement 100% sécurisé',        bg: '#EEF1FF', color: SECONDARY },
                  { icon: Truck,     text: 'Livraison en 24h à Dakar',       bg: '#F0FDF4', color: '#16A34A' },
                  { icon: RotateCcw, text: 'Retours gratuits sous 14 jours', bg: '#FFF8E6', color: '#D97706' },
                ].map(({ icon: Icon, text, bg, color }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium"
                    style={{ background: bg, color }}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              {/* ── Main CTA ─── */}
              <button
                onClick={() => submitOrder(appliedCoupon?.code)}
                disabled={isSubmitting || !isAgreedToTerms}
                className="w-full h-14 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isAgreedToTerms && !isSubmitting
                    ? `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY}E0 100%)`
                    : '#E5E7EB',
                  color: isAgreedToTerms && !isSubmitting ? '#fff' : '#9CA3AF',
                  boxShadow: isAgreedToTerms && !isSubmitting
                    ? '0 4px 16px rgba(249,70,28,0.30)'
                    : 'none',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Confirmation en cours…
                  </>
                ) : (
                  <>
                    Confirmer la commande
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Transactions chiffrées et sécurisées
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
