'use client';

import type { PriceComparisonData } from '@shofferai/shared';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PriceComparisonCard({ data }: { data: PriceComparisonData }) {
  const sorted = [...data.stores]
    .filter((s) => s.available)
    .sort((a, b) => a.price - b.price);

  const cheapest = sorted[0];
  const isBetterDealElsewhere = cheapest && cheapest.store !== data.currentStore && cheapest.price < data.currentPrice;
  const savings = isBetterDealElsewhere ? data.currentPrice - cheapest.price : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
          <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-white">Price Comparison</h3>
          <p className="text-[11px] text-zinc-500">{data.productName}</p>
        </div>
        {isBetterDealElsewhere && (
          <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Save {formatPrice(savings)}
          </span>
        )}
      </div>

      {/* Store prices */}
      <div className="border-t border-white/[0.06] px-4 py-2.5">
        <div className="space-y-1.5">
          {sorted.map((store, i) => {
            const isCurrent = store.store === data.currentStore;
            const isCheapest = i === 0;
            return (
              <div
                key={store.store}
                className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  isCheapest && !isCurrent
                    ? 'bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                    : isCurrent
                      ? 'bg-primary/[0.08] ring-1 ring-primary/20'
                      : 'bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-zinc-300">{store.store}</span>
                  {isCurrent && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary/80">
                      Current
                    </span>
                  )}
                  {isCheapest && !isCurrent && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                      Best Price
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-semibold ${
                    isCheapest ? 'text-emerald-400' : 'text-zinc-400'
                  }`}>
                    {formatPrice(store.price)}
                  </span>
                  {store.url && (
                    <button
                      onClick={() => window.open(store.url, '_blank', 'noopener,noreferrer')}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Unavailable stores */}
          {data.stores.filter((s) => !s.available).map((store) => (
            <div
              key={store.store}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 opacity-50"
            >
              <span className="text-[13px] text-zinc-500">{store.store}</span>
              <span className="text-[11px] text-zinc-600">Not available</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      {isBetterDealElsewhere && (
        <div className="border-t border-white/[0.06] px-4 py-2">
          <p className="text-[11px] text-zinc-500">
            💡 <span className="text-emerald-400/80">{cheapest.store}</span> has the best price — {formatPrice(savings)} cheaper
          </p>
        </div>
      )}
    </div>
  );
}
