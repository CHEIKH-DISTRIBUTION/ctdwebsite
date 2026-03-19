import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questions Fréquentes',
  description:
    'Trouvez les réponses à vos questions sur les commandes, livraisons, paiements Wave et Orange Money.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
