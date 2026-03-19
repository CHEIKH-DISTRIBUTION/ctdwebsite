'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email verifie !</h1>
          <p className="text-gray-600 mb-8">
            Votre adresse email a ete confirmee avec succes. Vous pouvez maintenant passer des commandes.
          </p>
          <Link
            href="/products"
            className="inline-block bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien invalide ou expire</h1>
          <p className="text-gray-600 mb-8">
            Ce lien de verification n&apos;est plus valide. Connectez-vous et demandez un nouveau lien depuis votre compte.
          </p>
          <Link
            href="/account"
            className="inline-block bg-brand-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Mon compte
          </Link>
        </div>
      </div>
    );
  }

  // status === 'error' or unknown
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de verification</h1>
        <p className="text-gray-600 mb-8">
          Une erreur est survenue lors de la verification. Veuillez reessayer ou contacter le support.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
