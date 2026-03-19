'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #FEF2F2, #F3F4F6)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div
              style={{
                width: 80,
                height: 80,
                margin: '0 auto 1.5rem',
                background: '#FEE2E2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle style={{ width: 40, height: 40, color: '#F9461C' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem' }}>
              Erreur critique
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: 1.6 }}>
              Une erreur inattendue s&apos;est produite. Veuillez recharger la page.
            </p>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#F9461C',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw style={{ width: 16, height: 16 }} />
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
