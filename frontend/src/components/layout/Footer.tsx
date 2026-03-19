// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  ArrowRight,
} from 'lucide-react';

/* ── Brand colours ── */
const PRIMARY   = '#F9461C';  // Pantone 711 C
const SECONDARY = '#001489';  // Pantone Reflex Blue C
const ACCENT    = '#FFB500';  // Pantone 1235 C

export function Footer() {
  const currentYear = new Date().getFullYear();

  const infoLinks = [
    { href: '/about',    label: 'À propos de nous' },
    { href: '/contact',  label: 'Contactez-nous' },
    { href: '/faq',      label: 'FAQ' },
    { href: '/terms',    label: 'Conditions générales' },
    { href: '/privacy',  label: 'Confidentialité' },
  ];

  const serviceLinks = [
    { href: '/products', label: 'Nos produits' },
    { href: '/packs',    label: 'Packs & Offres' },
    { href: '/orders',   label: 'Suivi de commande' },
    { href: '/account',  label: 'Mon compte' },
  ];

  return (
    <footer className="bg-[#0D1117] text-white mt-20">

      {/* ── Trust bar ────────────────────────────────────────── */}
      <div
        className="border-b border-white/10"
        style={{ background: `linear-gradient(135deg, ${SECONDARY}CC, #001070CC)` }}
      >
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            {[
              { icon: Truck,    text: 'Livraison offerte dès 50 000 FCFA' },
              { icon: Shield,   text: 'Paiement 100 % sécurisé' },
              { icon: CreditCard, text: 'Wave · Orange Money · Espèces' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2.5 text-white/85">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${PRIMARY}25` }}
                >
                  <Icon className="h-4 w-4" style={{ color: PRIMARY }} />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Cheikh Distribution"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <div className="leading-tight">
                <p className="text-base font-bold text-white">Cheikh Distribution</p>
                <p className="text-xs" style={{ color: PRIMARY }}>Au cœur des besoins sénégalais</p>
              </div>
            </Link>

            <p className="text-[13px] text-white/60 leading-relaxed mb-6 max-w-xs">
              Votre partenaire de confiance pour tous vos besoins quotidiens.
              Des produits de qualité, une livraison rapide.
            </p>

            {/* Socials */}
            <div className="flex gap-2">
              {[
                { icon: Facebook,  color: '#1877F2', href: '#', label: 'Facebook' },
                { icon: Twitter,   color: '#1DA1F2', href: '#', label: 'Twitter' },
                { icon: Instagram, color: PRIMARY,   href: '#', label: 'Instagram' },
                { icon: Youtube,   color: '#FF0000', href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, color, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/8 hover:bg-white/15 transition-colors"
                  aria-label={`Suivez-nous sur ${label}`}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </a>
              ))}
            </div>
          </div>

          {/* Information links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">
              Informations
            </h3>
            <ul className="space-y-2.5">
              {infoLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors group"
                  >
                    <ArrowRight
                      className="h-3 w-3 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                      style={{ color: PRIMARY }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service client links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">
              Service Client
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors group"
                  >
                    <ArrowRight
                      className="h-3 w-3 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                      style={{ color: PRIMARY }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: SECONDARY }} />
                <span className="text-[13px] text-white/60">272, Holding Baobab — Mbao gare</span>
              </div>
              <a href="tel:+221776490634" className="flex items-center gap-3 group">
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: SECONDARY }} />
                <span className="text-[13px] text-white/60 group-hover:text-white transition-colors">
                  +221 77 649 06 34
                </span>
              </a>
              <a href="mailto:contact@cheikhdistribution.sn" className="flex items-center gap-3 group">
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: SECONDARY }} />
                <span className="text-[13px] text-white/60 group-hover:text-white transition-colors">
                  contact@cheikhdistribution.sn
                </span>
              </a>
            </div>

            {/* Payment icons */}
            <div className="mt-6 pt-6 border-t border-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-3">
                Paiements acceptés
              </p>
              <div className="flex gap-2">
                {[
                  { icon: CreditCard, label: 'Carte' },
                  { icon: Shield,     label: 'Sécurisé' },
                  { icon: Truck,      label: 'Livraison' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="px-3 py-2 rounded-lg bg-white/8 flex items-center gap-1.5 text-xs text-white/50"
                    title={label}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-white/35">
              &copy; {currentYear} Cheikh Distribution. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[12px] text-white/35">
              {[
                { href: '/privacy', label: 'Confidentialité' },
                { href: '/terms',   label: 'Conditions générales' },
                { href: '/faq',     label: 'FAQ' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white/70 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
