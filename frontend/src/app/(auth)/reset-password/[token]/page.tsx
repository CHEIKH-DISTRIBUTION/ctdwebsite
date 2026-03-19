'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import { useAuthStore } from '@/features/auth/store/authStore';

const PRIMARY = '#001489';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { fetchProfile } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res = await httpClient.post<{ token: string }>(
        `/api/auth/reset-password/${token}`,
        { password },
      );
      // Auto-login: store the access token + cookie, then fetch profile
      if (res.token) {
        localStorage.setItem('token', res.token);
        const maxAge = 30 * 24 * 60 * 60;
        document.cookie = `token=${res.token}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
        useAuthStore.setState({ token: res.token, isAuthenticated: true });
        await fetchProfile();
      }
      setSuccess(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Le lien est invalide ou a expiré. Demandez un nouveau lien.',
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 ' +
    'bg-white transition-all duration-150 border-gray-200 hover:border-gray-300 ' +
    'focus:outline-none focus:border-[#001489] focus:ring-2 focus:ring-[rgba(0,20,137,0.12)]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
      >
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la connexion
        </Link>

        {success ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: '#dcfce7' }}
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Mot de passe réinitialisé !
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Votre mot de passe a été modifié avec succès. Vous êtes maintenant connecté.
            </p>
            <Button
              className="w-full rounded-xl font-semibold"
              style={{ background: PRIMARY }}
              onClick={() => router.push('/')}
            >
              Aller à l&apos;accueil
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: PRIMARY }}
                >
                  <Lock className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-500 text-sm">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    required
                    minLength={6}
                    className={inputCls + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  required
                  className={inputCls}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold rounded-xl"
                disabled={loading || !password || !confirmPassword}
                style={{ background: PRIMARY }}
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Réinitialisation...
                  </span>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>Ce lien expire dans 10 minutes</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
