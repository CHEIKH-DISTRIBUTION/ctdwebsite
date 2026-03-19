'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, LogOut, Package, ChevronLeft, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?from=/delivery');
      return;
    }
    if (user && user.role !== 'delivery' && user.role !== 'admin') {
      router.replace('/');
      return;
    }
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!isAuthenticated) return null;

  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: '#001489', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Back to admin — only visible for admins */}
          {user?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-[#001489] transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 shrink-0"
              title="Retour à l'administration"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {/* Brand */}
          <Link href="/delivery" className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-base"
              style={{ background: '#F9461C' }}
            >
              <Truck className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-gray-800 block leading-none">CTD Livraison</span>
              {user && (
                <span className="text-xs text-gray-500 leading-none">{user.name}</span>
              )}
            </div>
          </Link>

          {/* Nav */}
          <Link
            href="/delivery"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#001489] transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <Package className="h-4 w-4" />
            Commandes
          </Link>

          <Link
            href="/delivery/settings"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#001489] transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
