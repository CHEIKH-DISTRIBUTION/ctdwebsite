import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Produits',
  description:
    'Découvrez notre catalogue de produits en gros : alimentaire, hygiène, entretien. Livraison à Dakar et au Sénégal.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
