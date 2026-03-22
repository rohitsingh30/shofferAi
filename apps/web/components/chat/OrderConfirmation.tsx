'use client';

import React from 'react';

export interface OrderConfirmationProps {
  orderNumber: string;
  items: Array<{ name: string; qty?: number; quantity?: number; priceCents?: number; price?: string }>;
  productAmountCents: number;
  serviceFeeCents: number;
  totalCents: number;
  targetSite: string;
}

function formatINR(cents: number): string {
  return '₹' + (cents / 100).toLocaleString('en-IN');
}

export function OrderConfirmation({
  orderNumber,
  items,
  productAmountCents,
  serviceFeeCents,
  totalCents,
  targetSite,
}: OrderConfirmationProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
      {/* Green gradient left border via inset shadow */}
      <div className="border-l-[3px] border-emerald-500 px-4 py-3.5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-base">✅</span>
          <h3 className="text-[14px] font-semibold text-emerald-400">Order Confirmed</h3>
        </div>
        <p className="mt-1 text-[12px] text-zinc-400">{orderNumber}</p>

        {/* Items */}
        <div className="mt-3 space-y-1.5">
          {items.map((item, i) => {
            const qty = item.qty ?? item.quantity ?? 1;
            const priceStr = item.priceCents != null
              ? formatINR(item.priceCents)
              : item.price ?? '';
            return (
              <div key={i} className="flex items-center justify-between text-[13px]">
                <span className="text-zinc-300">
                  {item.name}
                  {qty > 1 && <span className="text-zinc-500"> ×{qty}</span>}
                </span>
                {priceStr && <span className="text-zinc-400">{priceStr}</span>}
              </div>
            );
          })}
        </div>

        {/* Price breakdown */}
        <div className="mt-3 border-t border-white/[0.06] pt-2.5 space-y-1">
          <div className="flex justify-between text-[12px] text-zinc-400">
            <span>Product</span>
            <span>{formatINR(productAmountCents)}</span>
          </div>
          <div className="flex justify-between text-[12px] text-zinc-400">
            <span>Service fee</span>
            <span>{formatINR(serviceFeeCents)}</span>
          </div>
          <div className="flex justify-between text-[13px] font-medium text-zinc-200">
            <span>Total</span>
            <span>{formatINR(totalCents)}</span>
          </div>
        </div>

        {/* Status spinner */}
        <div className="mt-3 flex items-center gap-2 text-[12px] text-zinc-400">
          <svg className="h-3.5 w-3.5 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>📦 Placing your order on {targetSite}…</span>
        </div>
      </div>
    </div>
  );
}
