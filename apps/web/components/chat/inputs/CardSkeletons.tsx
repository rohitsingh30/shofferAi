'use client';

/**
 * Shimmer skeleton that matches the product card layout.
 * Shown while images are preloading, then replaced all-at-once.
 */
export function CardGridSkeleton({ count, cols = 'grid' }: { count: number; cols?: 'grid' | 'carousel' }) {
  const items = Array.from({ length: Math.min(count, 12) });

  if (cols === 'carousel') {
    return (
      <div className="flex gap-3 overflow-hidden px-1 pb-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="w-[156px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]"
          >
            <div className="aspect-[4/3] animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] from-white/[0.03] bg-[length:200%_100%]" />
            <div className="space-y-2 px-3 pb-3 pt-2.5">
              <div className="h-3 w-4/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80}ms` }} />
              <div className="h-2.5 w-3/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80 + 40}ms` }} />
              <div className="h-4 w-2/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80 + 80}ms` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]"
        >
          <div className="aspect-[4/3] animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80}ms` }} />
          <div className="space-y-2 px-3 pb-3 pt-2.5">
            <div className="h-3 w-4/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80 + 40}ms` }} />
            <div className="h-2.5 w-3/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80 + 80}ms` }} />
            <div className="h-4 w-2/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" style={{ animationDelay: `${i * 80 + 120}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Single product card skeleton */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]">
      <div className="flex gap-4 p-4">
        <div className="h-28 w-28 shrink-0 animate-shimmer rounded-xl bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]" />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="h-3 w-16 animate-shimmer rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" />
          <div className="h-4 w-4/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" style={{ animationDelay: '80ms' }} />
          <div className="h-5 w-2/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.05] via-white/[0.12] to-white/[0.05] bg-[length:200%_100%]" style={{ animationDelay: '160ms' }} />
          <div className="h-3 w-3/5 animate-shimmer rounded bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%]" style={{ animationDelay: '240ms' }} />
        </div>
      </div>
      <div className="border-t border-white/[0.04] p-3">
        <div className="h-11 w-full animate-shimmer rounded-xl bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
