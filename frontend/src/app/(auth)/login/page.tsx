// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft,
  Shield,
  Truck,
  Star,
  Smartphone,
  QrCode,
  User as UserIcon
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SocialAuthButtons }  from '@/features/auth/components/SocialAuthButtons';
import { TurnstileWidget }    from '@/features/auth/components/TurnstileWidget';

// Couleurs de la palette
const COLORS = {
  primary: '#284bcc',    // Pantone Blue Reflex C
  secondary: '#f9461c',  // Pantone 711C
  accent: '#f6c700',     // Pantone 1235C
  dark: '#1d3aa3',
  light: '#a9bbff'
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [rememberMe,      setRememberMe]      = useState(false);
  const [turnstileToken,  setTurnstileToken]  = useState<string | null>(null);

  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error('Veuillez compléter la vérification de sécurité');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password, turnstileToken);
      toast.success('Content de vous revoir !', {
        description: 'Vous êtes maintenant connecté à votre compte.',
        duration: 3000,
      });
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser?.role === 'admin') {
        router.push(from?.startsWith('/admin') ? from : '/admin/dashboard');
      } else {
        router.push(from && !from.startsWith('/admin') ? from : '/');
      }
    } catch {
      toast.error('Identifiants incorrects', {
        description: 'Veuillez vérifier votre email et mot de passe.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleApiLogin = async (method: 'google' | 'facebook' | 'apple') => {
  //   toast('Cette fonctionnalité sera bientôt disponible !', {
  //     description: `Connexion via ${method.charAt(0).toUpperCase() + method.slice(1)} en cours de développement.`,
  //     duration: 3000,
  //   });
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Illustration et avantages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col justify-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Content de vous revoir !</h1>
                <p className="text-gray-600">Accédez à votre espace personnel et continuez vos achats</p>
              </div>

              {/* Avantages */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Suivi de commande</h3>
                    <p className="text-sm text-gray-600">Suivez vos commandes en temps réel</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.secondary }}
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Historique d&apos;achat</h3>
                    <p className="text-sm text-gray-600">Retrouvez tous vos achats précédents</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Avantages exclusifs</h3>
                    <p className="text-sm text-gray-600">Accédez à des offres réservées</p>
                  </div>
                </div>
              </div>

              
            </div>
          </motion.div>

          {/* Formulaire de connexion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="text-center mb-8 lg:hidden">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Lock className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Se connecter</h1>
              <p className="text-gray-600">Accédez à votre compte Cheikh Distribution</p>
            </div>

            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Link>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Adresse email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="pl-10 pr-4 py-3 border-gray-300 focus:border-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="pl-10 pr-12 py-3 border-gray-300 focus:border-blue-500"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    style={{ color: COLORS.primary }}
                  />
                  <span className="text-sm text-gray-700">Se souvenir de moi</span>
                </label>
                
                <Link 
                  href="/forgot-password" 
                  className="text-sm hover:underline"
                  style={{ color: COLORS.primary }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Cloudflare Turnstile */}
              <TurnstileWidget onToken={setTurnstileToken} />

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold rounded-xl transition-all hover:shadow-lg cursor-pointer"
                disabled={loading || !turnstileToken}
                size="lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Social login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <SocialAuthButtons redirectTo={from && !from.startsWith('/admin') ? from : '/'} />

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-center text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold hover:underline"
                  style={{ color: COLORS.primary }}
                >
                  Créer un compte
                </Link>
              </p>
            </div>

            {/* Sécurité */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Connexion sécurisée et cryptée</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}