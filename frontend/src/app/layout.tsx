// src/app/layout.tsx

import './globals.css';
import { RootLayoutClient } from './RootLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cheikh Distribution',
  description: 'Plateforme de distribution en gros sénégalaise',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}