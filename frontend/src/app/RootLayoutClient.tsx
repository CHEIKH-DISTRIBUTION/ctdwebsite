'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFavorites } from '@/features/favorites';
import { Toaster } from 'sonner';
import { CartDrawer } from '@/components/ui/CartDrawer';

// Auth pages are always accessible regardless of role
const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { autoLogin, user, isAuthenticated } = useAuthStore();
  const { fetchFavorites, clear: clearFavorites } = useFavorites();
  const [mounted, setMounted] = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();

  useEffect(() => {
    autoLogin();
    setMounted(true);
  }, [autoLogin]);

  // Sync favorites with server whenever authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      clearFavorites();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Role-based redirect — fires when user profile loads or route changes.
  // Delivery persons must stay in /delivery; admins can roam freely.
  useEffect(() => {
    if (!user) return;

    const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
    if (isAuthPage) return;

    if (user.role === 'delivery' && !pathname.startsWith('/delivery')) {
      router.replace('/delivery');
    }
  // pathname intentionally included so the guard re-runs on navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, pathname]);

  if (!mounted) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          Chargement...
        </div>
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      {children}
      <CartDrawer />
      <Toaster position="top-right" richColors />
    </>
  );
}
