// src/components/layout/ProtectedRoute.tsx

'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'deliverer' | 'customer'; // Optionnel
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      // Non connecté → login
      router.push('/login');
      return;
    }

    if (requiredRole) {
      const allowed = 
        (requiredRole === 'admin' && user?.role === 'admin') ||
        (requiredRole === 'manager' && user?.role !== undefined && ['admin', 'manager'].includes(user.role)) ||
        (requiredRole === 'deliverer' && user?.role !== undefined && ['admin', 'manager', 'deliverer'].includes(user.role)) ||
        (requiredRole === 'customer' && user?.role !== undefined && ['admin', 'manager', 'customer', 'deliverer'].includes(user.role));

      if (!allowed) {
        // Rôle non autorisé → retour à l’accueil
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, requiredRole, pathname, router]);

  if (!isAuthenticated || (requiredRole && user && ![
    'admin', 'manager', 'deliverer', 'customer'
  ].includes(user.role))) {
    return null; // En attendant la redirection
  }

  return <>{children}</>;
}