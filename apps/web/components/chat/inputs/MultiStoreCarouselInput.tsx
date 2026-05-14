'use client';

/**
 * MultiStoreCarouselInput — stacked store sections, each with its own
 * horizontal carousel. The cross-store grocery comparison UX.
 *
 * UX contract (post user feedback):
 *   - Each card has an instant ADD button. Tapping it commits IMMEDIATELY:
 *       1. Hits POST /api/cart/instant-add → runner adds it to that store's
 *          real cart.
 *       2. Locally adds an entry to CartContext so the floating CartBar +
 *          per-store cart panel update right away (no agent round-trip).
 *   - The carousel STAYS visible across multiple ADDs — the user keeps
 *     comparing/adding across stores in the same turn.
 *   - The agent's `ask_user(multi_store_carousel)` remains pending. The
 *     carousel is only dismissed when the user types a follow-up message
 *     in the chat textbox (which submits the ask_user with that message).
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
  /** Product URL from <store>.search — required by some stores (e.g. Zepto)
   *  to add to cart. Pass through verbatim; the side-channel /api/cart/instant-add
   *  forwards it as `product_url`. */
  url?: string;
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
  /** Called per ADD. Parent handles the actual cart side-effects (POST to
   *  /api/cart/instant-add + local CartContext update). Returns when the
   *  add succeeds so we can show "✓ ADDED" feedback. */
  onInstantAdd?: (store: string, card: StoreCard) => Promise<void>;
  /** Called when the agent's ask_user should finally be dismissed — e.g.
   *  if we add an explicit "I'm done" CTA later. Currently unused; the
   *  user dismisses by typing in the main chat textbox. */
  onSubmit: (value: string) => void;
}

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
  onInstantAdd,
}: MultiStoreCarouselInputProps) {
  // All sections start expanded — user wanted scannable comparison
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // Per-card running qty across this carousel instance — shows "x2", "x3"
  // badges so the user knows how many they've added.
  const [qtyByKey, setQtyByKey] = useState<Record<string, number>>({});
  const [errorByStore, setErrorByStore] = useState<Record<string, string>>({});

  function toggleCollapse(storeName: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(storeName)) next.delete(storeName);
      else next.add(storeName);
      return next;
    });
  }

  async function handleStoreAdd(store: string, raw: string) {
    // CarouselInput in instantAdd mode submits '[{"id":"...","qty":1}]'.
    // We unwrap, find the card, and dispatch the side-channel add.
    let cardId: string | undefined;
    try {
      const arr = JSON.parse(raw) as Array<{ id: string }>;
      if (Array.isArray(arr) && arr.length > 0) cardId = arr[0].id;
    } catch {
      cardId = raw;
    }
    if (!cardId) return;
    const section = stores.find((s) => s.store === store);
    const card = section?.cards.find((c) => c.id === cardId);
    if (!card) return;

    const key = `${store}::${cardId}`;
    // Optimistic increment so the UI feels instant
    setQtyByKey((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    setErrorByStore((prev) => {
      if (!prev[store]) return prev;
      const next = { ...prev };
      delete next[store];
      return next;
    });

    try {
      await onInstantAdd?.(store, card);
    } catch (err) {
      // Roll back qty + surface the error inline on the section header
      setQtyByKey((prev) => {
        const cur = prev[key] ?? 0;
        const next = { ...prev };
        if (cur <= 1) delete next[key];
        else next[key] = cur - 1;
        return next;
      });
      const msg = err instanceof Error ? err.message : String(err);
      setErrorByStore((prev) => ({ ...prev, [store]: msg }));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
      )}

      {stores.map((section) => {
        const isCollapsed = collapsed.has(section.store);
        const itemCount = section.cards.length;
        const liveError = errorByStore[section.store];
        const sectionQtys: Record<string, number> = {};
        for (const card of section.cards) {
          const q = qtyByKey[`${section.store}::${card.id}`];
          if (q) sectionQtys[card.id] = q;
        }
        const addedCount = Object.values(sectionQtys).reduce((a, b) => a + b, 0);
        const addedTotal = section.cards.reduce((sum, c) => {
          const q = sectionQtys[c.id] ?? 0;
          if (q === 0) return sum;
          const p = parsePrice(c.subtitle);
          return sum + (p ?? 0) * q;
        }, 0);
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
                {addedCount > 0 && (
                  <span
                    className="ml-1 shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/40 tabular-nums"
                    title={addedTotal > 0 ? `~₹${addedTotal.toFixed(addedTotal % 1 === 0 ? 0 : 2)}` : undefined}
                  >
                    {addedCount} in cart{addedTotal > 0 ? ` · ~₹${addedTotal.toFixed(0)}` : ''}
                  </span>
                )}
              </div>
              {!section.error && (
                <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">
                  {itemCount} {itemCount === 1 ? 'option' : 'options'}
                </span>
              )}
            </button>

            {liveError && (
              <div className="mx-3 mb-2 rounded-lg bg-red-500/[0.06] px-3 py-2 ring-1 ring-red-500/25">
                <p className="text-[11px] text-red-300/90">⚠️ {liveError}</p>
              </div>
            )}

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
                    onSubmit={(v) => handleStoreAdd(section.store, v)}
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
