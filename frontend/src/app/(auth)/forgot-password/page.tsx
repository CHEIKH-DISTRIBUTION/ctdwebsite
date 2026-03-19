'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Label }   from '@/components/ui/label';
import { toast }   from 'sonner';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { TurnstileWidget } from '@/features/auth/components/TurnstileWidget';
import { httpClient } from '@/shared/api/httpClient';

const PRIMARY = '#001489';

export default function ForgotPasswordPage() {
  const [email,          setEmail]          = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [sent,           setSent]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error('Veuillez compléter la vérification de sécurité');
      return;
    }
    setLoading(true);
    try {
      await httpClient.post('/api/auth/forgot-password', {
        email,
        'cf-turnstile-response': turnstileToken,
      });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

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

        {sent ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: '#dcfce7' }}
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Email envoyé !</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez
              un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-gray-400 text-xs mt-3">Vérifiez aussi votre dossier spam.</p>
            <Button
              asChild
              className="mt-6 w-full rounded-xl font-semibold"
              style={{ background: PRIMARY }}
            >
              <Link href="/login">Retour à la connexion</Link>
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
                  <Mail className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Mot de passe oublié ?</h1>
              <p className="text-gray-500 text-sm">
                Saisissez votre email et nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Adresse email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-3 border-gray-300 focus:border-[#001489]"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <TurnstileWidget onToken={setTurnstileToken} />

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold rounded-xl"
                disabled={loading || !turnstileToken}
                style={{ background: PRIMARY }}
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Envoi en cours...
                  </span>
                ) : 'Envoyer le lien'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>Le lien expire dans 10 minutes</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
