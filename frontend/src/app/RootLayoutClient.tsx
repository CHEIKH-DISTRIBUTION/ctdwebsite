'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'sonner';
import { CartDrawer } from '@/components/ui/CartDrawer';

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { autoLogin } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    autoLogin();
    setMounted(true);
  }, [autoLogin]);

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
