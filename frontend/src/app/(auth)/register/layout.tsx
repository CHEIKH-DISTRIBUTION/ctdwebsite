import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Inscrivez-vous sur Cheikh Distribution pour commander en gros au Sénégal.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
