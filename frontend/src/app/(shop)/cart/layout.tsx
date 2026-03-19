import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Panier',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
