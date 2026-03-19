import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Cheikh Distribution.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
