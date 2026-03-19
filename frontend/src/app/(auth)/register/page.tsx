// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SocialAuthButtons }  from '@/features/auth/components/SocialAuthButtons';
import { TurnstileWidget }    from '@/features/auth/components/TurnstileWidget';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Shield,
  Truck,
  Star,
} from 'lucide-react';

// Couleurs de la palette
const COLORS = {
  primary: '#001489',    // Pantone Reflex Blue C
  secondary: '#F9461C',  // Pantone 711C
  accent: '#FFB500',     // Pantone 1235C
  dark: '#001070',
  light: '#a9bbff'
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword,       setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [acceptedTerms,       setAcceptedTerms]       = useState(false);
  const [turnstileToken,      setTurnstileToken]      = useState<string | null>(null);

  const { register } = useAuthStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptedTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }
    if (!turnstileToken) {
      toast.error('Veuillez compléter la vérification de sécurité');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone, undefined, turnstileToken);
      toast.success('Bienvenue chez Cheikh Distribution !', {
        description: 'Votre compte a été créé avec succès.',
        duration: 3000,
      });
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de créer le compte';
      toast.error(message, {
        description: 'Veuillez vérifier vos informations et réessayer.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Rejoignez-nous</h1>
                <p className="text-gray-600">Créez votre compte et découvrez une expérience d&apos;achat exceptionnelle</p>
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
                    <h3 className="font-semibold text-gray-800">Livraison Express</h3>
                    <p className="text-sm text-gray-600">Recevez vos produits en 24h à Dakar</p>
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
                    <h3 className="font-semibold text-gray-800">Paiement Sécurisé</h3>
                    <p className="text-sm text-gray-600">Wave, Orange Money et cartes bancaires</p>
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
                    <h3 className="font-semibold text-gray-800">Avantages Exclusifs</h3>
                    <p className="text-sm text-gray-600">Offres spéciales et promotions réservées</p>
                  </div>
                </div>
              </div>

              {/* Statistiques de confiance */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: COLORS.primary }}
                    >10K+</div>
                    <div className="text-sm text-gray-600">Clients satisfaits</div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: COLORS.primary }}
                    >24h</div>
                    <div className="text-sm text-gray-600">Livraison express</div>
                  </div>
                  <div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: COLORS.primary }}
                    >98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire d'inscription */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-200"
          >
            <div className="text-center mb-8 lg:hidden">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Créer un compte</h1>
              <p className="text-gray-600">Rejoignez la communauté Cheikh Distribution</p>
            </div>

            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Link>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Nom complet *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="pl-10 pr-4 py-3 border-gray-300 focus:border-blue-500"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Téléphone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 pr-4 py-3 border-gray-300 focus:border-blue-500"
                      placeholder="Votre numéro"
                    />
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      minLength={6}
                      className="pl-10 pr-12 py-3 border-gray-300 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Minimum 6 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirmer le mot de passe *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="pl-10 pr-12 py-3 border-gray-300 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    style={{ color: COLORS.primary }}
                  />
                  <div>
                    <p className="text-sm text-gray-800">
                      J&apos;accepte les{' '}
                      <Link 
                        href="/terms" 
                        className="hover:underline"
                        style={{ color: COLORS.primary }}
                      >
                        conditions générales
                      </Link>{' '}
                      et la{' '}
                      <Link 
                        href="/privacy" 
                        className="hover:underline"
                        style={{ color: COLORS.primary }}
                      >
                        politique de confidentialité
                      </Link>
                    </p>
                  </div>
                </label>
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
                    Création du compte...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>

            {/* Social login — only shows if Google/Facebook env vars are set */}
            {(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400">Ou continuer avec</span>
                  </div>
                </div>
                <SocialAuthButtons redirectTo="/" />
              </>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-center text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="font-semibold hover:underline"
                  style={{ color: COLORS.primary }}
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Sécurité */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Vos données sont sécurisées et confidentielles</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}