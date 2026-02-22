'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Archive,
  AlertTriangle,
  Tag,
  Users,
  Truck,
  Menu,
  X,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/orders',    label: 'Commandes',        icon: ShoppingCart },
  { href: '/admin/products',  label: 'Produits',          icon: Package },
  { href: '/admin/packs',     label: 'Packs',             icon: Archive },
  { href: '/admin/stock',     label: 'Stock',             icon: AlertTriangle },
  { href: '/admin/offers',    label: 'Offres',            icon: Tag },
  { href: '/admin/users',     label: 'Utilisateurs',      icon: Users },
  { href: '/delivery',        label: 'Vue livreur',        icon: Truck },
] as const;

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/orders':    'Commandes',
  '/admin/products':  'Produits',
  '/admin/packs':     'Packs',
  '/admin/stock':     'Stock & Alertes',
  '/admin/offers':    'Offres & Promotions',
  '/admin/users':     'Utilisateurs',
};

const SIDEBAR_BG = 'linear-gradient(180deg, #001489 0%, #000D57 100%)';
const SIDEBAR_W  = 260;

// ---------------------------------------------------------------------------
// Sidebar content
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  pathname:      string;
  onNavClick?:   () => void;
  onCollapse?:   () => void; // desktop only
}

function SidebarContent({ pathname, onNavClick, onCollapse }: SidebarContentProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="flex flex-col h-full">

      {/* Logo / brand */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg shrink-0"
            style={{ background: '#F9461C' }}
          >
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base leading-tight">Cheikh</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                style={{ background: '#F9461C', color: '#fff' }}
              >
                Admin
              </span>
            </div>
            <span className="text-white/50 text-xs leading-tight">Distribution</span>
          </div>
        </div>

        {/* Desktop collapse button */}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Réduire le menu"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2">
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={[
                'flex items-center gap-3 px-4 py-2.5 rounded-r-xl text-sm font-medium',
                'transition-all duration-150 group relative',
                isActive
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/8',
              ].join(' ')}
              style={isActive ? { borderLeft: '3px solid #F9461C' } : { borderLeft: '3px solid transparent' }}
            >
              <Icon
                size={18}
                className={isActive ? 'text-white' : 'text-white/60 group-hover:text-white transition-colors duration-150'}
              />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto text-white/40" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #F9461C 0%, #c0380f 100%)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name ?? '—'}</p>
            <p className="text-white/40 text-xs truncate leading-tight">{user?.email ?? '—'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAuthenticated, fetchProfile } = useAuthStore();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [desktopOpen,  setDesktopOpen]  = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${pathname}`);
      return;
    }
    if (user && user.role !== 'admin') {
      router.replace('/');
      return;
    }
    if (isAuthenticated && !user) fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Admin';

  // Loading state
  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#001489', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: '#001489' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F7FA' }}>

      {/* ----------------------------------------------------------------- */}
      {/* Desktop sidebar — collapsible                                       */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence initial={false}>
        {desktopOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: SIDEBAR_W, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 overflow-hidden"
            style={{ background: SIDEBAR_BG }}
          >
            <div style={{ width: SIDEBAR_W, minWidth: SIDEBAR_W }}>
              <SidebarContent
                pathname={pathname}
                onCollapse={() => setDesktopOpen(false)}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* Mobile sidebar — slide-in drawer                                   */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -SIDEBAR_W }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden overflow-hidden"
              style={{ width: SIDEBAR_W, background: SIDEBAR_BG }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 z-10"
              >
                <X size={18} />
              </button>
              <SidebarContent
                pathname={pathname}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* Main area                                                           */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        className="flex flex-col flex-1 min-w-0"
        animate={{ marginLeft: desktopOpen ? SIDEBAR_W : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ marginLeft: desktopOpen ? SIDEBAR_W : 0 }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 lg:px-6 bg-white border-b border-gray-200 shadow-sm gap-3">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Desktop: show sidebar toggle when collapsed */}
          {!desktopOpen && (
            <button
              onClick={() => setDesktopOpen(true)}
              className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
              aria-label="Afficher le menu"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-bold truncate" style={{ color: '#001489' }}>
              {pageTitle}
            </h1>
          </div>

          {/* User pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800 leading-tight">{user?.name ?? ''}</span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide text-white"
              style={{ background: '#F9461C' }}
            >
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
