import React from 'react';
import { renderMarkdown } from './render-markdown';
import { OrderConfirmation } from './OrderConfirmation';
import { OrderPlaced } from './OrderPlaced';
import { OrderFailed } from './OrderFailed';
import { OrderStatusUpdate } from './OrderStatusUpdate';
import { PriceComparisonCard } from './PriceComparisonCard';
import type { PriceComparisonData } from '@shofferai/shared';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Inline selection shown below assistant question (e.g. address, date pick) */
  selection?: string;
  orderConfirmed?: { orderNumber: string; items: Array<{ name: string; qty?: number; quantity?: number; priceCents?: number; price?: string }>; productAmountCents: number; serviceFeeCents: number; totalCents: number; targetSite: string };
  orderPlaced?: { orderNumber: string; targetSite: string; targetOrderId?: string; targetOrderUrl?: string; targetTrackingUrl?: string; estimatedDelivery?: string };
  orderFailed?: { orderNumber: string; reason: string; refundAmountCents?: number };
  orderStatus?: { orderNumber: string; status: string; message: string; targetTrackingUrl?: string; targetSite?: string };
  priceComparison?: PriceComparisonData;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-3 shadow-lg shadow-primary/10">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  // Render order cards when present (standalone, no avatar wrapper)
  if (message.orderConfirmed) {
    return <OrderConfirmation {...message.orderConfirmed} />;
  }
  if (message.orderPlaced) {
    return <OrderPlaced {...message.orderPlaced} />;
  }
  if (message.orderFailed) {
    return <OrderFailed {...message.orderFailed} />;
  }
  if (message.orderStatus) {
    return <OrderStatusUpdate {...message.orderStatus} />;
  }
  if (message.priceComparison) {
    return <PriceComparisonCard data={message.priceComparison} />;
  }

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]">
        <p className="text-[14px] leading-relaxed text-zinc-200">
          {renderMarkdown(message.content)}
        </p>
        {message.selection && (
          <p className="mt-2 border-t border-white/[0.06] pt-2 text-[13px] font-medium text-zinc-400">
            {message.selection}
          </p>
        )}
      </div>
    </div>
  );
}
