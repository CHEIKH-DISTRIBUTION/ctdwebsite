'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || !user || user.isEmailVerified !== false) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authApi.resendVerification();
      toast.success('Email de verification envoye !');
    } catch {
      toast.error("Erreur lors de l'envoi. Reessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p className="text-amber-800">
          <span className="font-semibold">Verifiez votre email</span> — Un lien de confirmation a ete envoye a{' '}
          <span className="font-medium">{user.email}</span>. Vous devez confirmer avant de commander.
        </p>
        <button
          onClick={handleResend}
          disabled={sending}
          className="shrink-0 text-amber-900 font-semibold underline underline-offset-2 hover:text-amber-700 disabled:opacity-50 disabled:no-underline"
        >
          {sending ? 'Envoi...' : 'Renvoyer le lien'}
        </button>
      </div>
    </div>
  );
}
