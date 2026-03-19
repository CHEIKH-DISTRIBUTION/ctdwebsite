import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contactez-nous',
  description:
    'Contactez Cheikh Distribution par téléphone, email ou visitez-nous à Dakar. Support 7j/7.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
