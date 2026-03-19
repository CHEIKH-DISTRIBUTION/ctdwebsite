'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFavorites } from '@/features/favorites';
import { Toaster } from 'sonner';
import { CartDrawer } from '@/components/ui/CartDrawer';

// Auth pages are always accessible regardless of role
const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

/** Wait for Zustand persist to finish rehydrating from localStorage. */
function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => {
      const unsub = useAuthStore.persist.onFinishHydration(cb);
      return () => unsub();
    },
    () => useAuthStore.persist.hasHydrated(),
    () => false, // SSR — never hydrated
  );
}

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { autoLogin, user, isAuthenticated } = useAuthStore();
  const { fetchFavorites, clear: clearFavorites } = useFavorites();
  const hydrated = useHasHydrated();
  const [profileLoaded, setProfileLoaded] = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();

  // Once hydrated, trigger autoLogin (fetches profile) then mark ready
  useEffect(() => {
    if (!hydrated) return;
    autoLogin().finally(() => setProfileLoaded(true));

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [hydrated, autoLogin]);

  // Sync favorites with server whenever authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      clearFavorites();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Detect if the current user needs a role-based redirect
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const needsRedirect = user && !isAuthPage && user.role === 'delivery' && !pathname.startsWith('/delivery');

  // Role-based redirect — fires when user profile loads or route changes.
  useEffect(() => {
    if (needsRedirect) {
      router.replace('/delivery');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRedirect]);

  // Show spinner until Zustand rehydrates AND profile resolves
  // Also keep spinner while a redirect is pending (prevents flash)
  const ready = hydrated && profileLoaded && !needsRedirect;

  if (!ready) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin"
            style={{ borderColor: '#001489', borderTopColor: 'transparent' }}
          />
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
