// src/app/(shop)/orders/[id]/page.tsx
'use client';

import { Suspense } from 'react';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StarIcon, Loader2, AlertCircle, CheckCircle2, Package, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ordersApi } from '@/features/orders/api/orders.api';
import { checkoutApi } from '@/features/checkout/api/checkout.api';

const PAYMENT_LABELS: Record<string, string> = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  cash:          'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
};

// Isolated sub-component so useSearchParams() stays inside a Suspense boundary
function ConfirmedBanner({ orderNumber }: { orderNumber: string }) {
  const searchParams = useSearchParams();
  if (searchParams.get('confirmed') !== '1') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-start gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
        className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
      >
        <CheckCircle2 className="h-6 w-6 text-green-600" />
      </motion.div>
      <div>
        <h2 className="font-bold text-green-800 text-lg leading-tight">
          Commande confirmée !
        </h2>
        <p className="text-green-700 text-sm mt-1">
          Votre commande{' '}
          <strong className="font-semibold">#{orderNumber}</strong>{' '}
          a bien été reçue. Nous vous contacterons dès qu&apos;elle sera prête.
        </p>
        <div className="flex items-center gap-1.5 mt-2.5 text-green-600 text-xs font-medium">
          <Package className="h-3.5 w-3.5" />
          Préparation en cours — livraison sous 24h à Dakar
        </div>
      </div>
    </motion.div>
  );
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { order, isLoading, error } = useOrder(params.id);

  const router = useRouter();
  const [rating, setRating]           = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRated, setIsRated]          = useState(false);
  const [isRetrying, setIsRetrying]   = useState(false);

  const handlePaymentRetry = async () => {
    if (!order) return;
    setIsRetrying(true);
    try {
      const result = await checkoutApi.initiatePayment({
        orderId: order._id,
        paymentMethod: order.paymentMethod as 'wave' | 'orange_money',
        phone: order.contactInfo.phone,
      });
      const pendingUrl = new URLSearchParams({ orderId: order._id, paymentId: result.payment._id, method: order.paymentMethod });
      if (result.nextAction) pendingUrl.set('paymentUrl', result.nextAction);
      router.push(`/payment/pending?${pendingUrl.toString()}`);
    } catch {
      toast.error('Impossible de relancer le paiement. Veuillez réessayer.');
      setIsRetrying(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!rating || !order) return;
    setIsSubmitting(true);
    try {
      await ordersApi.rateOrder(order._id, { delivery: rating, overall: rating });
      setIsRated(true);
      toast.success('Merci pour votre avis !', {
        description: `Vous avez noté la livraison : ${rating} étoile(s).`,
      });
    } catch {
      toast.error('Impossible d\'enregistrer votre note. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h2 className="text-xl font-semibold text-red-800">Commande introuvable</h2>
          <p className="text-red-700">{error ?? 'Cette commande n\'existe pas ou vous n\'y avez pas accès.'}</p>
          <Button asChild variant="outline">
            <Link href="/orders">← Retour à mes commandes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Post-checkout confirmation banner ── */}
        <Suspense>
          <ConfirmedBanner orderNumber={order.orderNumber} />
        </Suspense>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Commande <span className="text-[#001489]">#{order.orderNumber}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Tracking history */}
        <section className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">Suivi de la commande</h2>
          {order.tracking.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune mise à jour disponible.</p>
          ) : (
            <div className="space-y-4">
              {order.tracking.map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                    index === 0 ? 'bg-[#001489]' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{entry.message}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Products */}
        <section className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">Produits commandés ({totalItems} article{totalItems !== 1 ? 's' : ''})</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => {
              const imageUrl = item.product?.images?.[0]?.url ?? '/images/placeholder.jpg';
              return (
                <div key={i} className="flex gap-4 items-center">
                  {item.product && (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {item.price.toLocaleString()} FCFA
                    </p>
                  </div>
                  <p className="font-bold">{item.total.toLocaleString()} FCFA</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Delivery address */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
            <p>{order.deliveryAddress.street}</p>
            <p>
              {order.deliveryAddress.city}
              {order.deliveryAddress.region ? `, ${order.deliveryAddress.region}` : ''}
            </p>
            {order.deliveryAddress.instructions && (
              <p className="mt-2 text-sm text-gray-600">{order.deliveryAddress.instructions}</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Paiement</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode</span>
                <span className="font-medium">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{order.subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className={order.deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {order.deliveryFee === 0 ? 'Gratuite' : `${order.deliveryFee.toLocaleString()} FCFA`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>{order.total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre d&apos;articles</span>
                <span>{totalItems}</span>
              </div>
            </div>
            {(order.paymentMethod === 'wave' || order.paymentMethod === 'orange_money') &&
             (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') && (
              <div className="pt-4 border-t border-gray-200 mt-2">
                <Button
                  onClick={handlePaymentRetry}
                  disabled={isRetrying}
                  className="w-full rounded-xl font-bold text-white"
                  style={{ background: order.paymentStatus === 'failed' ? '#dc2626' : '#F9461C' }}
                >
                  {isRetrying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirection…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {order.paymentStatus === 'failed' ? 'Réessayer le paiement' : 'Payer maintenant'}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Rating — only shown for delivered orders */}
        {order.status === 'delivered' && (
          <section className="bg-white p-6 rounded-lg shadow-sm border text-center mb-8">
            <h2 className="text-lg font-semibold mb-4">Noter la livraison</h2>
            <p className="text-gray-600 mb-4">Avez-vous été satisfait par la livraison ?</p>

            <div className="flex justify-center space-x-2 mb-4">
              {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                return (
                  <StarIcon
                    key={starValue}
                    className={`w-8 h-8 cursor-pointer transition ${
                      rating >= starValue ? 'text-yellow-400' : 'text-gray-300'
                    } ${isRated ? 'cursor-default' : ''}`}
                    onClick={() => !isRated && setRating(starValue)}
                    fill={rating >= starValue ? '#facc15' : 'none'}
                  />
                );
              })}
            </div>

            {rating > 0 && !isRated && (
              <p className="text-sm mb-4">
                Vous notez : <strong>{rating} étoile{rating !== 1 ? 's' : ''}</strong>
              </p>
            )}

            {!isRated ? (
              <Button
                className="bg-[#001489] hover:bg-[#001070]"
                disabled={!rating || isSubmitting}
                onClick={handleSubmitRating}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi…
                  </span>
                ) : 'Envoyer la note'}
              </Button>
            ) : (
              <p className="text-green-600 font-medium">Merci pour votre retour !</p>
            )}
          </section>
        )}

        {/* Back button */}
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/orders">← Retour à mes commandes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
