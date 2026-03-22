'use client';

import { useState, useCallback, useMemo } from 'react';
import { useImagePreloader } from './useImagePreloader';
import { CardGridSkeleton } from './CardSkeletons';
import { CardPlaceholder } from './CardPlaceholder';

interface CardItem {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  subtitle?: string;
  badge?: string;
  url?: string;
}

interface CardGridInputProps {
  cards: CardItem[];
  showQuantity?: boolean;
  allowCustom?: boolean;
  multiSelect?: boolean;
  onSubmit: (value: string) => void;
}

// Detect if any card has a real image URL (vs all-emoji mode)
function hasProductImages(cards: CardItem[]): boolean {
  return cards.some((c) => c.image && c.image.startsWith('http'));
}

export function CardGridInput({
  cards,
  showQuantity = false,
  allowCustom = false,
  multiSelect = true,
  onSubmit,
}: CardGridInputProps) {
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [customText, setCustomText] = useState('');
  const [customItems, setCustomItems] = useState<CardItem[]>([]);

  const isProductMode = hasProductImages(cards);

  // Preload all product images — show shimmer until ready
  const imageUrls = useMemo(() => cards.map((c) => c.image), [cards]);
  const { ready: imagesReady, failed: imgErrors } = useImagePreloader(
    isProductMode ? imageUrls : [],
  );

  function toggleCard(id: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiSelect) next.clear();
        next.set(id, 1);
      }
      return next;
    });
  }

  function setQty(id: string, delta: number) {
    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? 0;
      const newQty = current + delta;
      if (newQty <= 0) {
        next.delete(id);
      } else {
        next.set(id, newQty);
      }
      return next;
    });
  }

  function addCustom() {
    const text = customText.trim();
    if (!text) return;
    const id = `custom-${Date.now()}`;
    const item: CardItem = { id, label: text, emoji: '✨' };
    setCustomItems((prev) => [...prev, item]);
    setSelections((prev) => {
      const next = new Map(prev);
      next.set(id, 1);
      return next;
    });
    setCustomText('');
  }

  function handleSubmit() {
    if (selections.size === 0) return;
    const allCards = [...cards, ...customItems];
    const result = Array.from(selections.entries()).map(([id, qty]) => {
      const card = allCards.find((c) => c.id === id);
      return showQuantity
        ? { id, label: card?.label ?? id, qty }
        : { id, label: card?.label ?? id };
    });
    onSubmit(JSON.stringify(result));
  }

  const allCards = [...cards, ...customItems];

  const summaryParts = Array.from(selections.entries()).map(([id, qty]) => {
    const card = allCards.find((c) => c.id === id);
    const label = card?.label ?? id;
    return showQuantity ? `${label} ×${qty}` : label;
  });

  // Parse "₹44 · 450 ml" → { price, detail }
  function parseCardSubtitle(sub?: string): { price?: string; detail?: string } {
    if (!sub) return {};
    const m = sub.match(/^(₹[\d,]+)\s*[·•\-–]\s*(.+)$/);
    if (m) return { price: m[1], detail: m[2].trim() };
    if (/^₹/.test(sub)) return { price: sub };
    return { detail: sub };
  }

  // Product mode: larger cards with images on top, price + weight below
  if (isProductMode) {
    return (
      <div className="space-y-3">
        {/* Shimmer skeleton while images preload */}
        {!imagesReady && <CardGridSkeleton count={allCards.length} />}

        {/* Real product grid — hidden until all images ready, then fades in */}
        <div
          className={`scrollbar-none grid grid-rows-2 grid-flow-col auto-cols-[140px] sm:auto-cols-[156px] gap-2.5 overflow-x-auto snap-x pb-2 transition-opacity duration-300 ${
            imagesReady ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'
          }`}
        >
          {allCards.map((card, i) => {
            const qty = selections.get(card.id);
            const isSelected = qty !== undefined;
            const showImg = card.image && !imgErrors.has(card.image);
            const parsed = parseCardSubtitle(card.subtitle);

            return (
              <div
                key={card.id}
                className={`carousel-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-200 snap-start ${
                  isSelected
                    ? 'border-primary/60 bg-primary/[0.06] ring-2 ring-primary/25 shadow-lg shadow-primary/10'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => {
                  if (showQuantity && isSelected) return;
                  toggleCard(card.id);
                }}
              >
                {/* Badge */}
                {card.badge && (
                  <span className="absolute left-2 top-2 z-10 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
                    {card.badge}
                  </span>
                )}

                {/* Selected check */}
                {isSelected && !showQuantity && (
                  <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}

                {/* Product image */}
                <div className="relative flex aspect-[4/3] items-center justify-center bg-white/[0.06] p-3">
                  {showImg ? (
                    <img
                      src={card.image!}
                      alt={card.label}
                      className="h-full w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <CardPlaceholder id={card.id} label={card.label} size="lg" />
                  )}
                </div>

                {/* Product info */}
                <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
                  {/* Name */}
                  <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-white/90">
                    {card.label}
                  </span>

                  {/* Weight / detail */}
                  {parsed.detail && (
                    <span className="text-[11px] text-white/40">
                      {parsed.detail}
                    </span>
                  )}

                  {/* Price + View link */}
                  <div className="mt-1 flex items-center justify-between gap-1">
                    {parsed.price ? (
                      <span className="text-[15px] font-bold text-primary">
                        {parsed.price}
                      </span>
                    ) : card.subtitle ? (
                      <span className="text-[11px] font-medium text-primary/70">
                        {card.subtitle}
                      </span>
                    ) : <span />}

                    {card.url && (
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
                        title="View product page"
                      >
                        View
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Quantity stepper */}
                  {showQuantity && isSelected && (
                    <div
                      className="mt-2 flex items-center justify-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setQty(card.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary transition-all hover:bg-primary/25 active:scale-95"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-base font-bold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(card.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary transition-all hover:bg-primary/25 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {/* ADD button (quantity mode, not yet selected) */}
                  {showQuantity && !isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCard(card.id);
                      }}
                      className="mt-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary tracking-wide transition-all hover:bg-primary/20 active:scale-95"
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom item input */}
        {allowCustom && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustom();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="🔍 Search for something else..."
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition-all hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </form>
        )}

        {/* Cart summary + submit */}
        {selections.size > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/[0.08] p-3 ring-1 ring-primary/20 animate-fade-in">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary">
                {selections.size} item{selections.size > 1 ? 's' : ''} selected
              </p>
              <p className="truncate text-[11px] text-white/40">
                {summaryParts.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Emoji mode: compact cards (original style, slightly polished)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {allCards.map((card) => {
          const qty = selections.get(card.id);
          const isSelected = qty !== undefined;

          return (
            <div
              key={card.id}
              className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 transition-all duration-150 ${
                isSelected
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-primary/40 hover:bg-primary/10'
              }`}
              onClick={() => {
                if (showQuantity && isSelected) return;
                toggleCard(card.id);
              }}
            >
              {card.badge && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {card.badge}
                </span>
              )}

              {card.emoji ? (
                <span className="text-2xl leading-none">
                  {card.emoji}
                </span>
              ) : (
                <CardPlaceholder id={card.id} label={card.label} size="sm" />
              )}

              <span className="text-center text-sm text-foreground/80">
                {card.label}
              </span>

              {card.subtitle && (
                <span className="text-center text-xs text-muted-foreground">
                  {card.subtitle}
                </span>
              )}

              {showQuantity && isSelected && (
                <div
                  className="mt-1 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setQty(card.id, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold transition-colors hover:bg-primary/30"
                  >
                    −
                  </button>
                  <span className="min-w-[1.25rem] text-center text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(card.id, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold transition-colors hover:bg-primary/30"
                  >
                    +
                  </button>
                </div>
              )}

              {showQuantity && !isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(card.id);
                  }}
                  className="mt-1 flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold transition-colors hover:bg-primary/30"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {allowCustom && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="+ Something else..."
            className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>
      )}

      {selections.size > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {summaryParts.join(', ')}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
