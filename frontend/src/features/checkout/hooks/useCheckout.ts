'use client';

/**
 * useCheckout — encapsulates checkout state and the order-submission flow.
 *
 * The page component stays thin; all orchestration lives here.
 *
 * CLAUDE.md §12 rule enforced:
 *   ✅ Frontend sends user intent (product ids + quantities)
 *   ❌ Frontend does NOT compute final price (backend owns that)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { checkoutApi } from '../api/checkout.api';
import { ApiError } from '@/shared/api/httpClient';
import type { PaymentMethod, DeliveryAddress } from '@/shared/types/order.types';
import { isValidSenegalPhone } from '@/shared/utils/phone';

export type CheckoutPaymentMethod = 'wave' | 'orange_money' | 'cash' | 'bank_transfer';

export type CheckoutState = {
  paymentMethod: CheckoutPaymentMethod;
  deliveryAddress: DeliveryAddress;
  customerNote: string;
  isAgreedToTerms: boolean;
  isSubmitting: boolean;
};

export function useCheckout() {
  const router = useRouter();
  const { items, packItems, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('cash');
  const [customerNote, setCustomerNote] = useState('');
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery address seeded from the authenticated user's saved address
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street:  user?.address?.street  ?? '',
    city:    user?.address?.city    ?? 'Dakar',
    region:  '',
    postalCode: '',
    country: 'Sénégal',
  });

  const submitOrder = async (couponCode?: string) => {
    if (!isAgreedToTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return;
    }

    if (items.length === 0 && packItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour passer une commande');
      router.push('/login?from=/checkout');
      return;
    }

    // ── Client-side validation ──────────────────────────────────────────────
    if (!deliveryAddress.street.trim()) {
      toast.error('Adresse incomplète', {
        description: 'Veuillez renseigner votre rue ou quartier.',
      });
      return;
    }

    if (!deliveryAddress.city.trim()) {
      toast.error('Adresse incomplète', {
        description: 'Veuillez renseigner votre ville.',
      });
      return;
    }

    // contactInfo.phone is required by the backend schema
    if (!user.phone?.trim()) {
      toast.error('Numéro de téléphone manquant', {
        description: 'Ajoutez un téléphone dans votre profil avant de commander.',
        duration: 6000,
      });
      router.push('/account');
      return;
    }

    if (!isValidSenegalPhone(user.phone)) {
      toast.error('Numéro de téléphone invalide', {
        description: 'Veuillez entrer un numéro sénégalais valide (ex: 77 123 45 67).',
        duration: 5000,
      });
      router.push('/account');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items → backend command (product IDs + quantities only)
      // The backend computes prices — frontend never sends calculated totals
      const command = {
        products: items.map((item) => ({
          product:  item.product._id,
          quantity: item.quantity,
        })),
        packs: packItems.map((item) => ({
          pack:     item.pack._id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod as PaymentMethod,
        deliveryAddress,
        contactInfo: {
          phone: user.phone,
          email: user.email,
        },
        notes: customerNote ? { customer: customerNote } : undefined,
        ...(couponCode ? { couponCode } : {}),
      };

      const result = await checkoutApi.createOrder(command);

      // ── Mobile money — initiate payment gateway and redirect ──────────────
      if (paymentMethod === 'wave' || paymentMethod === 'orange_money') {
        toast.success('Commande créée', {
          description: `Référence : ${result.order.orderNumber}`,
          duration: 3000,
        });
        try {
          const paymentData = await checkoutApi.initiatePayment({
            orderId:       result.order._id,
            paymentMethod,
            phone:         user.phone!,
          });
          const pendingUrl = new URLSearchParams({
            orderId:   result.order._id,
            paymentId: paymentData.payment._id,
            method:    paymentMethod,
            ...(paymentData.nextAction ? { paymentUrl: paymentData.nextAction } : {}),
          });
          router.push(`/payment/pending?${pendingUrl.toString()}`);
        } catch {
          // Gateway call failed — order is created, user can pay later
          toast.warning('Commande créée — paiement non initié', {
            description: "Votre commande a bien été enregistrée. Vous pouvez payer depuis la page de votre commande.",
            duration: 6000,
          });
          router.push(`/orders/${result.order._id}?confirmed=1`);
        }
        return;
      }

      // ── Cash / bank transfer — no external payment needed ─────────────────
      // clearCart() is intentionally called on the destination page (orders/[id])
      // when confirmed=1 is detected — avoids re-render race with router.push
      toast.success('Commande créée avec succès', {
        description: `Référence : ${result.order.orderNumber}`,
        duration: 4000,
      });
      router.push(`/orders/${result.order._id}?confirmed=1`);
    } catch (error) {
      if (error instanceof ApiError) {
        // Domain errors (stock, validation) surfaced with user-friendly message
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error('Une erreur inattendue est survenue. Veuillez réessayer.', {
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    paymentMethod,
    deliveryAddress,
    customerNote,
    isAgreedToTerms,
    isSubmitting,
    // Setters
    setPaymentMethod,
    setDeliveryAddress,
    setCustomerNote,
    setIsAgreedToTerms,
    // Action
    submitOrder,
  };
}
