import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-[#001489] mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page introuvable</h1>
        <p className="text-gray-600 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#001489] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#001489] text-[#001489] rounded-xl font-semibold hover:bg-[#001489]/5 transition-all"
          >
            <Search className="h-4 w-4" />
            Parcourir les produits
          </Link>
        </div>
      </div>
    </div>
  );
}
