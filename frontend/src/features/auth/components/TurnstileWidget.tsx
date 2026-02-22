'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        }
      ): string;
      reset(widgetId: string): void;
      remove(widgetId: string): void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * TurnstileWidget — Cloudflare Turnstile CAPTCHA (managed/invisible mode).
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (local dev), the widget is
 * not rendered and onToken is called immediately with a bypass value, so
 * forms submit without CAPTCHA in development.
 *
 * The server-side middleware skips verification when TURNSTILE_SECRET_KEY
 * is also unset, completing the dev-bypass flow end-to-end.
 */
export function TurnstileWidget({ onToken, theme = 'light' }: TurnstileWidgetProps) {
  const siteKey      = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string>('');

  useEffect(() => {
    // Development bypass — no site key configured
    if (!siteKey) {
      onToken('dev-bypass');
      return;
    }

    const initWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      // Remove any existing widget before re-rendering
      if (widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey:            siteKey,
        callback:           (token) => onToken(token),
        'error-callback':   () => onToken(null),
        'expired-callback': () => onToken(null),
        theme,
      });
    };

    if (window.turnstile) {
      initWidget();
    } else {
      const script  = document.createElement('script');
      script.src    = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async  = true;
      script.onload = initWidget;
      document.head.appendChild(script);

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        }
        // Only remove the script if we added it in this effect
        if (document.head.contains(script)) document.head.removeChild(script);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  // Don't render a container in dev (no site key)
  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center mt-1" />;
}
