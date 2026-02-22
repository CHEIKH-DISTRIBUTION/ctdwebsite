import { cn } from '@/lib/utils';

/**
 * Skeleton — loading placeholder with shimmer animation.
 *
 * Uses the `.skeleton` CSS class defined in globals.css.
 * Wrap a group of skeletons in a <SkeletonCard> for card-shaped
 * loading states.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-48 w-full rounded-xl" />
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('skeleton', className)}
      {...props}
    />
  );
}

/** Pre-built product-card loading skeleton */
function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard };
