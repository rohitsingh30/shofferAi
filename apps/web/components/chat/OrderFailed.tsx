'use client';

import React from 'react';

export interface OrderFailedProps {
  orderNumber: string;
  reason: string;
  refundAmountCents?: number;
}

function formatINR(cents: number): string {
  return '₹' + (cents / 100).toLocaleString('en-IN');
}

export function OrderFailed({ orderNumber, reason, refundAmountCents }: OrderFailedProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
      <div className="border-l-[3px] border-red-500 px-4 py-3.5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-base">❌</span>
          <h3 className="text-[14px] font-semibold text-red-400">Order Failed</h3>
        </div>
        {orderNumber && (
          <p className="mt-1 text-[12px] text-zinc-400">{orderNumber}</p>
        )}

        {/* Reason */}
        <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-300">{reason}</p>

        {/* Refund notice */}
        {refundAmountCents != null && refundAmountCents > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[12px] text-zinc-300">
            <span>💸</span>
            <span>Full refund of <span className="font-medium text-zinc-200">{formatINR(refundAmountCents)}</span> initiated — it'll be back in your account within 3-5 business days.</span>
          </div>
        )}

        {/* Reassurance */}
        <p className="mt-2.5 text-[12px] text-zinc-500">
          No worries — you can try again or ask me to help with something else.
        </p>
      </div>
    </div>
  );
}
