import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promotions',
  description:
    'Offres spéciales et promotions sur nos produits en gros. Profitez des meilleurs prix au Sénégal.',
};

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
