/**
 * Cheikh Distribution — Design Tokens (TypeScript)
 *
 * TypeScript mirror of tokens.css.
 * Use this for dynamic inline styles (e.g. style={{ color: brand.primary }}).
 * For static Tailwind classes, prefer: bg-brand-primary, text-brand-secondary, etc.
 *
 * Pantone references:
 *   brand.primary   = Pantone 711 C         #F9461C  tomato red
 *   brand.secondary = Pantone Reflex Blue C  #001489  deep navy
 *   brand.accent    = Pantone 1235 C         #FFB500  amber gold
 */

export const brand = {
  primary:         '#F9461C',   // Pantone 711 C
  primaryHover:    '#D93810',
  primaryActive:   '#C2300E',
  primaryLight:    '#FFF0EC',
  primaryMuted:    'rgba(249, 70, 28, 0.10)',

  secondary:       '#001489',   // Pantone Reflex Blue C
  secondaryHover:  '#001070',
  secondaryActive: '#000D57',
  secondaryLight:  '#EEF1FF',
  secondaryMuted:  'rgba(0, 20, 137, 0.08)',

  accent:          '#FFB500',   // Pantone 1235 C
  accentHover:     '#E09F00',
  accentLight:     '#FFF8E6',
  accentMuted:     'rgba(255, 181, 0, 0.12)',
} as const;

export const shadows = {
  card:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 8px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
  primary:   '0 4px 16px rgba(249, 70, 28, 0.28)',
  secondary: '0 4px 16px rgba(0, 20, 137, 0.22)',
  sm:        '0 1px 4px rgba(0,0,0,0.07)',
  md:        '0 4px 12px rgba(0,0,0,0.08)',
  lg:        '0 8px 24px rgba(0,0,0,0.10)',
} as const;

export const radius = {
  xs:   '3px',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl': '28px',
  pill: '9999px',
} as const;

/** Drop-in replacement for the COLORS constant used in checkout/page.tsx */
export const BRAND_COLORS = {
  primary:   brand.primary,
  secondary: brand.secondary,
  accent:    brand.accent,
  dark:      brand.secondaryHover,
} as const;

export type BrandColorKey = keyof typeof brand;
