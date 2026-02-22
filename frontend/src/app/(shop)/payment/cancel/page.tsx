'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full space-y-5"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-amber-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement annulé</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Vous avez annulé le paiement. Votre commande est conservée — vous pouvez
            la retrouver dans votre espace et réessayer le paiement à tout moment.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {orderId && (
            <Button asChild className="bg-[#001489] hover:bg-[#001070] rounded-xl">
              <Link href={`/orders/${orderId}`} className="flex items-center gap-2">
                Voir ma commande
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Toutes mes commandes
            </Link>
          </Button>
          <Link
            href="/products"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            Continuer mes achats
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#001489]" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
