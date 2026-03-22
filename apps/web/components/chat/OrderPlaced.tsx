'use client';

import React from 'react';

export interface OrderPlacedProps {
  orderNumber: string;
  targetSite: string;
  targetOrderId?: string;
  targetOrderUrl?: string;
  targetTrackingUrl?: string;
  estimatedDelivery?: string;
}

export function OrderPlaced({
  orderNumber,
  targetSite,
  targetOrderId,
  targetOrderUrl,
  targetTrackingUrl,
  estimatedDelivery,
}: OrderPlacedProps) {
  const trackUrl = targetTrackingUrl || targetOrderUrl;

  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
      <div className="border-l-[3px] border-emerald-500 px-4 py-3.5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-base">🛒</span>
          <h3 className="text-[14px] font-semibold text-emerald-400">
            Order Placed on {targetSite}!
          </h3>
        </div>

        {/* Details */}
        <div className="mt-2.5 space-y-1.5 text-[13px]">
          {orderNumber && (
            <p className="text-zinc-400">
              ShofferAI ref: <span className="text-zinc-300">{orderNumber}</span>
            </p>
          )}
          {targetOrderId && (
            <p className="text-zinc-400">
              {targetSite} order: <span className="text-zinc-300">{targetOrderId}</span>
            </p>
          )}
          {estimatedDelivery && (
            <p className="text-zinc-400">
              🚚 Estimated delivery: <span className="text-zinc-300">{estimatedDelivery}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.12]"
            >
              Track on {targetSite}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <a
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.12]"
          >
            View Order
          </a>
        </div>
      </div>
    </div>
  );
}
