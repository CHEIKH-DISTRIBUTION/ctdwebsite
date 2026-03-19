import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À Propos',
  description:
    'Cheikh Distribution, grossiste de confiance au Sénégal depuis Dakar. Découvrez notre mission et nos engagements.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
