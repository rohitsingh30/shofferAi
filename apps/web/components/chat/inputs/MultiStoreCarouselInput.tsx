'use client';

/**
 * MultiStoreCarouselInput — stacked store sections, each with its own
 * horizontal carousel. The cross-store grocery comparison UX.
 *
 * Each section has:
 *   - Header: store name + delivery time + result count + optional badge
 *     (🥇 Cheapest, ⚡ Fastest, etc.)
 *   - Collapsible chevron toggle
 *   - Horizontal carousel (re-uses existing CarouselInput component)
 *
 * Per-card ADD button returns JSON like {"store":"Zepto","id":"abc","qty":1}.
 * The cloud LLM routes this to the right <store>.add_to_cart tool.
 *
 * Failed stores render an inline notice ("⚠️ Couldn't reach Zepto") instead
 * of being dropped — honest about coverage.
 */
import { useState } from 'react';
import { CarouselInput } from './CarouselInput';

export interface StoreCard {
  id: string;
  label: string;
  image?: string;
  subtitle?: string;
  badge?: string;
}

export interface StoreSection {
  store: string;
  icon?: string;
  delivery?: string;
  badge?: string;
  /** When set, this store's section renders an error notice instead of a carousel. */
  error?: string;
  cards: StoreCard[];
}

interface MultiStoreCarouselInputProps {
  stores: StoreSection[];
  /** Optional global summary line shown above all sections. */
  summary?: string;
  onSubmit: (value: string) => void;
}

export function MultiStoreCarouselInput({
  stores,
  summary,
  onSubmit,
}: MultiStoreCarouselInputProps) {
  // All sections start expanded — user wanted scannable comparison
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCollapse(storeName: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(storeName)) next.delete(storeName);
      else next.add(storeName);
      return next;
    });
  }

  function handleStoreSubmit(storeName: string, rawValue: string) {
    // CarouselInput in instantAdd mode submits '[{"id":"...","qty":1}]'.
    // We re-emit with store identification so the cloud LLM can route.
    try {
      const arr = JSON.parse(rawValue) as Array<{ id: string; qty?: number }>;
      if (Array.isArray(arr) && arr.length > 0) {
        const enriched = arr.map((item) => ({
          store: storeName,
          id: item.id,
          qty: item.qty ?? 1,
        }));
        onSubmit(JSON.stringify(enriched));
        return;
      }
    } catch {
      // fall through
    }
    // Single-id legacy shape — still tag with store
    onSubmit(JSON.stringify([{ store: storeName, id: rawValue, qty: 1 }]));
  }

  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      )}

      {stores.map((section) => {
        const isCollapsed = collapsed.has(section.store);
        const itemCount = section.cards.length;
        return (
          <section
            key={section.store}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            {/* Store header — clickable to collapse */}
            <button
              type="button"
              onClick={() => toggleCollapse(section.store)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Collapse chevron */}
                <svg
                  className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                {section.icon && (
                  <span className="text-base">{section.icon}</span>
                )}
                <h3 className="text-sm font-semibold text-white truncate">{section.store}</h3>
                {section.delivery && (
                  <span className="text-[11px] text-zinc-500 shrink-0">· {section.delivery}</span>
                )}
                {section.badge && !section.error && (
                  <span className="ml-1 shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
                    {section.badge}
                  </span>
                )}
                {section.error && (
                  <span className="ml-1 shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 ring-1 ring-red-500/30">
                    Failed
                  </span>
                )}
              </div>
              {!section.error && (
                <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">
                  {itemCount} {itemCount === 1 ? 'option' : 'options'}
                </span>
              )}
            </button>

            {/* Section body */}
            {!isCollapsed && (
              <div className="px-3 pb-3">
                {section.error ? (
                  <div className="rounded-xl bg-red-500/[0.04] px-3 py-3 ring-1 ring-red-500/20">
                    <p className="text-[12px] text-red-400/90">⚠️ {section.error}</p>
                  </div>
                ) : section.cards.length === 0 ? (
                  <div className="rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/[0.04]">
                    <p className="text-[12px] text-zinc-500">No matches found at {section.store}.</p>
                  </div>
                ) : (
                  <CarouselInput
                    cards={section.cards}
                    instantAdd={true}
                    onSubmit={(v) => handleStoreSubmit(section.store, v)}
                  />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
