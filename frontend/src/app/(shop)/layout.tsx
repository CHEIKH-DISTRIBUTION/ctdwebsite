import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmailVerificationBanner } from '@/components/ui/EmailVerificationBanner';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
