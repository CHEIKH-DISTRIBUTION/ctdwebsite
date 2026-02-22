'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// Extend Window for Google Identity Services and Facebook JS SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
          renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
        };
      };
    };
    FB?: {
      init(config: Record<string, unknown>): void;
      login(cb: (r: { authResponse?: { accessToken: string } }) => void, opts: Record<string, unknown>): void;
    };
    fbAsyncInit?: () => void;
  }
}

interface SocialAuthButtonsProps {
  redirectTo?: string;
}

export function SocialAuthButtons({ redirectTo = '/' }: SocialAuthButtonsProps) {
  const { loginWithGoogle, loginWithFacebook } = useAuthStore();
  const router = useRouter();
  const googleBtnRef  = useRef<HTMLDivElement>(null);
  const googleReady   = useRef(false);

  const googleClientId  = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId   = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  // ── Google Identity Services ───────────────────────────────────────────────
  useEffect(() => {
    if (!googleClientId) return;

    const initGSI = () => {
      if (!window.google || googleReady.current) return;
      googleReady.current = true;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            await loginWithGoogle(credential);
            toast.success('Connecté avec Google !');
            router.push(redirectTo);
          } catch {
            toast.error('Erreur lors de la connexion Google');
          }
        },
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme:  'outline',
          size:   'large',
          width:  googleBtnRef.current.offsetWidth || 300,
          text:   'continue_with',
          locale: 'fr',
        });
      }
    };

    if (window.google) {
      initGSI();
    } else {
      const script = document.createElement('script');
      script.src   = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGSI;
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  // ── Facebook JS SDK ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!facebookAppId) return;

    window.fbAsyncInit = function () {
      window.FB!.init({ appId: facebookAppId, version: 'v19.0', cookie: true, xfbml: false });
    };

    if (!document.getElementById('fb-sdk')) {
      const script  = document.createElement('script');
      script.id     = 'fb-sdk';
      script.src    = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async  = true;
      document.head.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facebookAppId]);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast.error('SDK Facebook non chargé. Réessayez dans un instant.');
      return;
    }
    window.FB.login(async (response) => {
      if (response.authResponse) {
        try {
          await loginWithFacebook(response.authResponse.accessToken);
          toast.success('Connecté avec Facebook !');
          router.push(redirectTo);
        } catch {
          toast.error('Erreur lors de la connexion Facebook');
        }
      }
    }, { scope: 'email,public_profile' });
  };

  if (!googleClientId && !facebookAppId) return null;

  return (
    <div className="space-y-3">
      {googleClientId && (
        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
      )}
      {facebookAppId && (
        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Continuer avec Facebook
        </button>
      )}
    </div>
  );
}
