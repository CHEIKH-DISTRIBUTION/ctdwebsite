import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — brand-aligned variants
 *
 * default   → Pantone 711 C tomato-red  (primary CTA: buy, checkout)
 * secondary → Pantone Reflex Blue C navy (important but not buy)
 * outline   → navy border, transparent bg (secondary actions)
 * ghost     → neutral hover only
 * destructive → red (delete / danger)
 * link      → underline anchor style
 *
 * Disabled: opacity-40 + not-allowed cursor (clearly inactive).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold " +
  "transition-all duration-150 " +
  "active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-40 " +
  "cursor-pointer " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F9461C] " +
  "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        /* ── Primary — brand tomato-red (Pantone 711 C) ──── */
        default:
          "bg-[#F9461C] text-white shadow-sm " +
          "hover:bg-[#D93810] hover:shadow-[0_4px_16px_rgba(249,70,28,0.28)] " +
          "active:bg-[#C2300E] active:shadow-none",

        /* ── Secondary — brand navy (Pantone Reflex Blue C) */
        secondary:
          "bg-[#001489] text-white shadow-sm " +
          "hover:bg-[#001070] hover:shadow-[0_4px_16px_rgba(0,20,137,0.22)] " +
          "active:bg-[#000D57]",

        /* ── Outline — navy border, fills on hover ────────── */
        outline:
          "border-2 border-[#001489] text-[#001489] bg-transparent " +
          "hover:bg-[#001489] hover:text-white " +
          "active:bg-[#001070] active:text-white " +
          "dark:bg-input/30 dark:border-input dark:hover:bg-input/50",

        /* ── Ghost — neutral ─────────────────────────────── */
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 " +
          "dark:hover:bg-accent/50",

        /* ── Destructive ─────────────────────────────────── */
        destructive:
          "bg-destructive text-white shadow-sm " +
          "hover:bg-destructive/90 " +
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 " +
          "dark:bg-destructive/60",

        /* ── Link ────────────────────────────────────────── */
        link:
          "text-[#001489] underline-offset-4 hover:underline hover:text-[#001070]",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-3",
        sm:      "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg:      "h-12 rounded-xl px-8 has-[>svg]:px-5 text-base",
        icon:    "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
