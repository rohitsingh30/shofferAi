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
  /** Snapshot of the carousel/card_grid that was shown for this message,
   *  so it can be re-expanded after the user sends a follow-up. */
  carouselSnapshot?: {
    inputType: 'carousel' | 'card_grid';
    cards: Array<{ id: string; label: string; image?: string; subtitle?: string; badge?: string }>;
  };
  /** Quick-reply chips shown below this assistant message. Tapping a chip
   *  sends it as a new user message — keeps the conversation flowing. */
  suggestions?: string[];
  orderConfirmed?: { orderNumber: string; items: Array<{ name: string; qty?: number; quantity?: number; priceCents?: number; price?: string }>; productAmountCents: number; serviceFeeCents: number; totalCents: number; targetSite: string };
  orderPlaced?: { orderNumber: string; targetSite: string; targetOrderId?: string; targetOrderUrl?: string; targetTrackingUrl?: string; estimatedDelivery?: string };
  orderFailed?: { orderNumber: string; reason: string; refundAmountCents?: number };
  orderStatus?: { orderNumber: string; status: string; message: string; targetTrackingUrl?: string; targetSite?: string };
  priceComparison?: PriceComparisonData;
}

export function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  const [carouselExpanded, setCarouselExpanded] = React.useState(false);

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

        {/* Collapsed carousel snapshot — re-expandable */}
        {message.carouselSnapshot && message.carouselSnapshot.cards.length > 0 && (
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={() => setCarouselExpanded((v) => !v)}
              className="flex items-center gap-2 text-[12px] font-medium text-primary/80 hover:text-primary transition-colors"
            >
              <svg
                className={`h-3.5 w-3.5 transition-transform ${carouselExpanded ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {carouselExpanded ? 'Hide' : 'Show'} {message.carouselSnapshot.cards.length} option{message.carouselSnapshot.cards.length === 1 ? '' : 's'}
            </button>
            {carouselExpanded && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {message.carouselSnapshot.cards.map((c) => (
                  <div key={c.id} className="shrink-0 w-[120px] flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
                    <div className="aspect-[4/3] flex items-center justify-center bg-white/[0.06] p-2">
                      {c.image && c.image.startsWith('http') ? (
                        <img src={c.image} alt={c.label} className="h-full w-full object-contain rounded" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-[11px] font-medium text-white/80 leading-tight">{c.label}</p>
                      {c.subtitle && <p className="mt-1 text-[10px] font-semibold text-primary/80">{c.subtitle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggestion chips */}
        {message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
            {message.suggestions.map((s, i) => (
              <button
                key={`${message.id}-sug-${i}`}
                type="button"
                onClick={() => onSuggestionClick(s)}
                className="rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1.5 text-[12px] font-medium text-primary/90 hover:bg-primary/[0.15] hover:border-primary/50 hover:text-primary transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
