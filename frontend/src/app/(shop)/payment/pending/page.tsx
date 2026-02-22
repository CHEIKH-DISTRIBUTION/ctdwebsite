'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkoutApi } from '@/features/checkout/api/checkout.api';

const METHOD_META: Record<string, { label: string; color: string; logo: string }> = {
  wave:         { label: 'Wave',         color: '#00BCD4', logo: 'W' },
  orange_money: { label: 'Orange Money', color: '#FF6600', logo: 'OM' },
};

type PollStatus = 'waiting' | 'completed' | 'failed';

// ---------------------------------------------------------------------------
// Inner component — uses useSearchParams, must live inside Suspense
// ---------------------------------------------------------------------------
function PendingContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const orderId    = searchParams.get('orderId')    ?? '';
  const paymentId  = searchParams.get('paymentId')  ?? '';
  const paymentUrl = searchParams.get('paymentUrl') ?? '';
  const method     = searchParams.get('method')     ?? 'wave';
  const meta       = METHOD_META[method] ?? METHOD_META.wave;

  const [pollStatus, setPollStatus] = useState<PollStatus>('waiting');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    const poll = async () => {
      try {
        const payment = await checkoutApi.getPaymentStatus(paymentId);
        if (payment.status === 'completed') {
          setPollStatus('completed');
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => router.push(`/orders/${orderId}?confirmed=1`), 2000);
        } else if (payment.status === 'failed') {
          setPollStatus('failed');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // network error — keep polling
      }
    };

    // Poll immediately then every 5 s
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paymentId, orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── Waiting state ── */}
          {pollStatus === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header band */}
              <div
                className="px-6 py-5 flex items-center gap-4"
                style={{ background: meta.color }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
                  {meta.logo}
                </div>
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-widest">Paiement</p>
                  <p className="text-white font-bold text-xl">{meta.label}</p>
                </div>
              </div>

              <div className="px-6 py-8 space-y-6">
                {/* Pulsing status */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: `${meta.color}20` }}
                    >
                      <Loader2
                        className="h-8 w-8 animate-spin"
                        style={{ color: meta.color }}
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">En attente de paiement</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Complétez votre paiement {meta.label} puis revenez ici.
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <ol className="space-y-3 text-sm text-gray-600">
                  {paymentUrl ? (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: meta.color }}
                        >1</span>
                        Cliquez sur le bouton ci-dessous pour ouvrir {meta.label}
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: meta.color }}
                        >2</span>
                        Confirmez le paiement de votre commande dans l&apos;application
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: meta.color }}
                        >3</span>
                        Revenez sur cette page — elle se met à jour automatiquement
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5">
                        <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
                        Ouvrez votre application {meta.label} et autorisez le paiement
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Loader2 className="h-4 w-4 flex-shrink-0 mt-0.5 animate-spin" style={{ color: meta.color }} />
                        Cette page vérifie automatiquement toutes les 5 secondes
                      </li>
                    </>
                  )}
                </ol>

                {/* CTA — open payment URL */}
                {paymentUrl && (
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
                    style={{ background: meta.color }}
                  >
                    Payer avec {meta.label}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Vérification automatique toutes les 5 secondes…
                </div>
              </div>

              {/* Cancel */}
              <div className="px-6 pb-6 text-center">
                <Link
                  href={`/orders/${orderId}`}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
                >
                  Annuler et voir la commande
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Completed state ── */}
          {pollStatus === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">Paiement confirmé !</h2>
              <p className="text-gray-500">Redirection vers votre commande…</p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-300" />
            </motion.div>
          )}

          {/* ── Failed state ── */}
          {pollStatus === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Paiement échoué</h2>
              <p className="text-gray-500 text-sm">
                Votre commande est conservée. Vous pouvez réessayer le paiement depuis votre espace.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild className="bg-[#001489] hover:bg-[#001070]">
                  <Link href={`/orders/${orderId}`}>Voir ma commande</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/orders">Mes commandes</Link>
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — wraps the inner component in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
