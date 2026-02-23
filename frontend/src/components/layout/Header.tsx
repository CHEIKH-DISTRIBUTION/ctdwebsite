'use client';

import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  User,
  LogOut,
  Search,
  Phone,
  Menu,
  X,
  Truck,
  Shield,
  Heart,
  ChevronDown,
  Clock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Brand colours (Pantone 711 C / Reflex Blue C / 1235 C) ── */
const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';
const ACCENT    = '#FFB500';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount  = useCartStore((state) => state.getItemCount());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const pathname   = usePathname();
  const router     = useRouter();
  const [searchQuery, setSearchQuery]   = useState('');
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  const navItems = [
    { href: '/',          label: 'Accueil' },
    { href: '/products',  label: 'Catalogue', hasDropdown: true },
    { href: '/packs',     label: 'Packs' },
    { href: '/about',     label: 'À propos' },
    { href: '/contact',   label: 'Contact' },
  ];

  const productCategories = [
    { href: '/products?category=alimentaires',  label: 'Alimentaires',  icon: ShoppingBag },
    { href: '/products?category=electromenager', label: 'Électroménager', icon: Zap },
    { href: '/products?category=hygiene',        label: 'Hygiène',        icon: Shield },
    { href: '/products?category=habillement',    label: 'Habillement',    icon: Heart },
  ];

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div
        className="text-white text-xs py-2 hidden md:block"
        style={{ background: `linear-gradient(135deg, ${SECONDARY} 0%, #001070 100%)` }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+221776490634" className="flex items-center gap-1.5 hover:text-white/80 transition-opacity">
              <Phone className="h-3.5 w-3.5" />
              +221 77 649 06 34
            </a>
            <a href="mailto:contact@cheikhdistribution.sn" className="flex items-center gap-1.5 hover:text-white/80 transition-opacity">
              <Mail className="h-3.5 w-3.5" />
              contact@cheikhdistribution.sn
            </a>
            <span className="flex items-center gap-1.5 text-white/70">
              <Clock className="h-3.5 w-3.5" />
              Lun–Dim: 8h – 20h
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              Livraison offerte dès 50 000 FCFA
            </span>
            <span className="w-px h-3 bg-white/30" />
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Paiement sécurisé
            </span>
          </div>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
        style={{ borderBottom: scrolled ? 'none' : '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="container mx-auto px-4">

          {/* ── Row 1: logo · search · actions ─────────────── */}
          <div className="flex items-center justify-between h-20 gap-6">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Cheikh Distribution"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ background: ACCENT }}
                />
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-[15px] font-bold text-gray-900 tracking-tight">
                  Cheikh Distribution
                </p>
                <p className="text-[11px] font-medium" style={{ color: PRIMARY }}>
                  Au cœur des besoins sénégalais
                </p>
              </div>
            </Link>

            {/* Search bar – desktop */}
            <div className="flex-1 max-w-2xl hidden lg:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des produits, marques, catégories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 px-5 pr-12 rounded-full border border-gray-200 bg-gray-50
                             text-sm placeholder-gray-400
                             focus:bg-white focus:border-[#F9461C] focus:outline-none
                             focus:ring-2 focus:ring-[rgba(249,70,28,0.15)]
                             transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: PRIMARY }}
                  aria-label="Rechercher"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Auth – desktop */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl
                             hover:bg-gray-50 transition-colors group"
                  aria-label="Administration"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #001489, #000D57)' }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-none">Admin</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Dashboard</p>
                  </div>
                </Link>
              )}

              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl
                             hover:bg-gray-50 transition-colors group"
                  aria-label="Mon compte"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${SECONDARY}, #001070)` }}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? <User className="h-4 w-4" />}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Mon compte</p>
                  </div>
                </Link>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="rounded-full text-gray-700">
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full shadow-sm"
                    style={{ background: SECONDARY }}
                  >
                    <Link href="/register">S&apos;inscrire</Link>
                  </Button>
                </div>
              )}

              {/* Cart */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                aria-label="Ouvrir le panier"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
                  <AnimatePresence mode="popLayout">
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full
                                   text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                        style={{ background: PRIMARY }}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none">Panier</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{itemCount} article{itemCount !== 1 ? 's' : ''}</p>
                </div>
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen
                  ? <X    className="h-5 w-5 text-gray-700" />
                  : <Menu className="h-5 w-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {isSearchOpen && (
            <div className="lg:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full py-3 px-5 pr-12 rounded-full border border-gray-200 bg-gray-50
                             text-sm focus:border-[#F9461C] focus:outline-none focus:ring-2
                             focus:ring-[rgba(249,70,28,0.15)] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white"
                  style={{ background: PRIMARY }}
                  aria-label="Rechercher"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ── Nav bar – desktop ────────────────────────────── */}
          <nav
            className="hidden md:flex items-center justify-center gap-1 py-3 border-t"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={isActive ? { color: SECONDARY, background: `${SECONDARY}10` } : {}}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Active underline */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
                      style={{ background: PRIMARY }}
                    />
                  )}

                  {/* Catalogue dropdown */}
                  {item.hasDropdown && (
                    <div
                      className="absolute top-full left-0 w-64 bg-white rounded-2xl p-3 z-50
                                 opacity-0 invisible translate-y-1
                                 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                                 transition-all duration-200"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.07)' }}
                    >
                      <div className="space-y-1">
                        {productCategories.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group/cat"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${SECONDARY}12` }}
                            >
                              <cat.icon className="h-4 w-4" style={{ color: SECONDARY }} />
                            </div>
                            <span className="text-sm text-gray-700 group-hover/cat:text-gray-900 font-medium">
                              {cat.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <Link
                          href="/products"
                          className="flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                          style={{ color: PRIMARY }}
                        >
                          Voir tout le catalogue
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Mobile menu ──────────────────────────────────────── */}
        <div
          className={`md:hidden bg-white overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Main nav */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={isActive ? { color: SECONDARY, background: `${SECONDARY}10` } : {}}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full" style={{ background: PRIMARY }} />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Category sub-links */}
            <div className="pl-4 space-y-1">
              {productCategories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex items-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Auth actions */}
            <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ background: `linear-gradient(135deg, ${SECONDARY}, #001070)` }}
                    >
                      {user?.name?.charAt(0).toUpperCase() ?? <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrateur' : 'Compte client'}</p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
                      style={{ color: SECONDARY }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" /> Mon compte
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); router.push('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-red-50"
                    style={{ color: '#DC2626' }}
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full rounded-xl" style={{ background: PRIMARY }}>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4" /> Connexion
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      S&apos;inscrire
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Contact info */}
            <div className="pt-4 space-y-2.5 text-sm text-gray-500" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <a href="tel:+221776490634" className="flex items-center gap-2.5 hover:text-gray-700 transition-colors">
                <Phone className="h-3.5 w-3.5" /> +221 77 649 06 34
              </a>
              <a href="mailto:contact@cheikhdistribution.sn" className="flex items-center gap-2.5 hover:text-gray-700 transition-colors">
                <Mail className="h-3.5 w-3.5" /> contact@cheikhdistribution.sn
              </a>
              <span className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5" /> Lun–Dim: 8h – 20h
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
