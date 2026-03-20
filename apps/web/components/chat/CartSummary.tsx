'use client';

import { useState } from 'react';

export interface CartItem {
  name: string;
  quantity: number;
  price: string;
}

interface CartSummaryProps {
  items: CartItem[];
  total: string;
  store?: string;
}

export function CartSummary({ items, total, store }: CartSummaryProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="flex items-start gap-3.5">
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>

      {/* Cart card */}
      <div className="flex-1 rounded-2xl rounded-tl-md border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {store ? `${store} Cart` : 'Shopping Cart'}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-emerald-400">{total}</span>
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${collapsed ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>

        {/* Items */}
        {!collapsed && (
          <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/[0.06] text-xs text-muted-foreground">
                    {item.quantity}x
                  </span>
                  <span className="text-foreground/80">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.price}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-sm font-medium">
              <span>Total</span>
              <span className="text-emerald-400">{total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
