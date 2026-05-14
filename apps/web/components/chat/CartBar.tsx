'use client';

import { useCart } from './CartContext';
import { useL2Cart } from './L2CartContext';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartBar() {
  const { itemCount, total, isEmpty, stores, byStore } = useCart();
  const { openCart } = useL2Cart();

  if (isEmpty) return null;

  // Build a multi-store summary like "2 BB · 1 Zepto" so a cart spanning
  // multiple merchants doesn't mislead the user with a single store name.
  const storeBreakdown = stores
    .map((s) => `${(byStore[s] ?? []).length} ${s}`)
    .join(' · ');

  return (
    <div className="animate-slide-up mx-auto w-full max-w-3xl px-4 pb-2">
      <button
        onClick={openCart}
        className="group flex w-full items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.1] active:scale-[0.99]"
      >
        {/* Cart icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <svg className="h-4.5 w-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
          <span className="text-sm font-medium text-white shrink-0">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          {stores.length > 0 && (
            <>
              <span className="text-zinc-600 shrink-0">·</span>
              <span className="text-sm text-zinc-400 truncate">{storeBreakdown}</span>
            </>
          )}
        </div>

        {/* Total + View */}
        <span className="text-sm font-bold text-emerald-400">
          {formatPrice(total)}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors group-hover:text-white">
          View
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      </button>
    </div>
  );
}
