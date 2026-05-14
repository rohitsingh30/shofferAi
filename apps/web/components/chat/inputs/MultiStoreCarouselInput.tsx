'use client';

/**
 * MultiStoreCarouselInput — stacked store sections, each with its own
 * horizontal carousel. The cross-store grocery comparison UX.
 *
 * Each section has:
 *   - Header: store name + delivery time + result count + optional badge
 *     (🥇 Cheapest, ⚡ Fastest, etc.)
 *   - Collapsible chevron toggle
 *   - Horizontal carousel (re-uses CarouselInput in `accumulate` mode)
 *
 * Per-card ADD increments a local qty stepper. NOTHING is submitted until
 * the user taps the sticky "Done shopping (N items) →" footer bar. This
 * lets users browse + compare across stores in one turn — adding a few
 * items from BigBasket and a few from Zepto before sending the batch.
 *
 * Final submission shape: '[{"store":"Zepto","id":"abc","qty":2}, ...]'.
 * The cloud LLM iterates this and calls each <store>.add_to_cart tool.
 *
 * Failed stores render an inline notice ("⚠️ Couldn't reach Zepto") instead
 * of being dropped — honest about coverage.
 */
import { useMemo, useState } from 'react';
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

/* Parse "₹44 · 450 ml" → number price for total estimation */
function parsePrice(sub?: string): number | null {
  if (!sub) return null;
  const m = sub.match(/₹([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function MultiStoreCarouselInput({
  stores,
  summary,
  onSubmit,
}: MultiStoreCarouselInputProps) {
  // All sections start expanded — user wanted scannable comparison
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // Cross-store qty state: { storeName: { cardId: qty } }
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleCollapse(storeName: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(storeName)) next.delete(storeName);
      else next.add(storeName);
      return next;
    });
  }

  function updateQty(storeName: string, cardId: string, qty: number) {
    setQuantities((prev) => {
      const next: Record<string, Record<string, number>> = { ...prev };
      const storeMap = { ...(next[storeName] ?? {}) };
      if (qty <= 0) {
        delete storeMap[cardId];
      } else {
        storeMap[cardId] = qty;
      }
      if (Object.keys(storeMap).length === 0) {
        delete next[storeName];
      } else {
        next[storeName] = storeMap;
      }
      return next;
    });
  }

  // Aggregate stats for the sticky footer bar
  const { totalItems, storeBreakdown, estimatedTotal } = useMemo(() => {
    let items = 0;
    let priceTotal = 0;
    let anyPriced = false;
    const breakdown: Array<{ store: string; count: number }> = [];
    for (const section of stores) {
      const storeQtys = quantities[section.store];
      if (!storeQtys) continue;
      let storeCount = 0;
      for (const card of section.cards) {
        const q = storeQtys[card.id] ?? 0;
        if (q > 0) {
          storeCount += q;
          const p = parsePrice(card.subtitle);
          if (p !== null) {
            priceTotal += p * q;
            anyPriced = true;
          }
        }
      }
      if (storeCount > 0) {
        items += storeCount;
        breakdown.push({ store: section.store, count: storeCount });
      }
    }
    return {
      totalItems: items,
      storeBreakdown: breakdown,
      estimatedTotal: anyPriced ? priceTotal : null,
    };
  }, [stores, quantities]);

  function handleDone() {
    if (totalItems === 0 || submitting) return;
    setSubmitting(true);
    const payload: Array<{ store: string; id: string; qty: number }> = [];
    for (const section of stores) {
      const storeQtys = quantities[section.store];
      if (!storeQtys) continue;
      for (const [cardId, qty] of Object.entries(storeQtys)) {
        if (qty > 0) {
          payload.push({ store: section.store, id: cardId, qty });
        }
      }
    }
    onSubmit(JSON.stringify(payload));
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {summary && (
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      )}

      {stores.map((section) => {
        const isCollapsed = collapsed.has(section.store);
        const itemCount = section.cards.length;
        const storeQtyMap = quantities[section.store] ?? {};
        const storeAddedCount = Object.values(storeQtyMap).reduce((a, b) => a + b, 0);
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
                {storeAddedCount > 0 && (
                  <span className="ml-1 shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/40 tabular-nums">
                    {storeAddedCount} added
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
                    accumulate={true}
                    quantities={storeQtyMap}
                    onQtyChange={(id, qty) => updateQty(section.store, id, qty)}
                    onSubmit={() => { /* no-op in accumulate mode */ }}
                  />
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* Sticky footer — appears once user has added at least one item */}
      {totalItems > 0 && (
        <div className="sticky bottom-0 -mx-3 px-3 pt-3 pb-1 z-30 animate-fade-in">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-emerald-300 tabular-nums">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                {estimatedTotal !== null && ` · ~₹${estimatedTotal.toFixed(estimatedTotal % 1 === 0 ? 0 : 2)}`}
              </p>
              <p className="truncate text-[11px] text-emerald-200/60 mt-0.5">
                {storeBreakdown.map((b) => `${b.count} from ${b.store}`).join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDone}
              disabled={submitting}
              className="shrink-0 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Done shopping — add ${totalItems} items to cart`}
            >
              {submitting ? 'Adding...' : 'Done shopping →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
