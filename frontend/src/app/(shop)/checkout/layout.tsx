import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paiement',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
