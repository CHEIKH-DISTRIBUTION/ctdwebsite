'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-[#F9461C]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Une erreur est survenue</h1>
        <p className="text-gray-600 mb-8">
          Nous nous excusons pour ce désagrément. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F9461C] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#001489] text-[#001489] rounded-xl font-semibold hover:bg-[#001489]/5 transition-all"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
