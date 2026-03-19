// src/app/layout.tsx

import './globals.css';
import { RootLayoutClient } from './RootLayoutClient';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Cheikh Distribution — Grossiste au Sénégal',
    template: '%s | Cheikh Distribution',
  },
  description:
    'Grossiste alimentaire et produits d\'hygiène au Sénégal. Commandez en gros avec livraison à Dakar. Paiement Wave, Orange Money.',
  keywords: [
    'grossiste Sénégal',
    'distribution Dakar',
    'vente en gros',
    'produits alimentaires',
    'Wave',
    'Orange Money',
  ],
  manifest: '/manifest.json',
  themeColor: '#001489',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cheikh Distri',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'Cheikh Distribution',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <GoogleAnalytics />
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}