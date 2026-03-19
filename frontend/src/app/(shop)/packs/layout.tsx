import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Packs',
  description:
    'Packs promotionnels pour revendeurs : alimentaire, hygiène, composite. Économisez en achetant en gros.',
};

export default function PacksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
