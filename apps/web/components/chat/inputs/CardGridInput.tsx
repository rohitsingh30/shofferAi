'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface CardItem {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  subtitle?: string;
  badge?: string;
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
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const isProductMode = hasProductImages(cards);

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

  const handleImgError = useCallback((id: string) => {
    setImgErrors((prev) => new Set(prev).add(id));
  }, []);

  const allCards = [...cards, ...customItems];

  const summaryParts = Array.from(selections.entries()).map(([id, qty]) => {
    const card = allCards.find((c) => c.id === id);
    const label = card?.label ?? id;
    return showQuantity ? `${label} ×${qty}` : label;
  });

  // Product mode: larger cards with images on top, price + weight below
  if (isProductMode) {
    return (
      <div className="space-y-3">
        {/* Product grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {allCards.map((card) => {
            const qty = selections.get(card.id);
            const isSelected = qty !== undefined;
            const showImg = card.image && !imgErrors.has(card.id);

            return (
              <div
                key={card.id}
                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'border-primary/60 bg-primary/[0.08] ring-1 ring-primary/30'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05]'
                }`}
                onClick={() => {
                  if (showQuantity && isSelected) return;
                  toggleCard(card.id);
                }}
              >
                {/* Badge */}
                {card.badge && (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    {card.badge}
                  </span>
                )}

                {/* Product image */}
                <div className="relative flex aspect-square items-center justify-center bg-white/[0.04] p-2">
                  {showImg ? (
                    <img
                      src={card.image!}
                      alt={card.label}
                      className="h-full w-full rounded-lg object-contain"
                      loading="lazy"
                      onError={() => handleImgError(card.id)}
                    />
                  ) : (
                    <span className="text-4xl leading-none">
                      {card.emoji ?? '📦'}
                    </span>
                  )}
                </div>

                {/* Product info */}
                <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-2">
                  {/* Name */}
                  <span className="line-clamp-2 text-xs font-medium leading-tight text-white/90">
                    {card.label}
                  </span>

                  {/* Price / weight (via subtitle like "₹32 · 500ml") */}
                  {card.subtitle && (
                    <span className="text-[11px] font-medium text-primary/80">
                      {card.subtitle}
                    </span>
                  )}

                  {/* Quantity stepper */}
                  {showQuantity && isSelected && (
                    <div
                      className="mt-auto flex items-center justify-center gap-1 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setQty(card.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary transition-colors hover:bg-primary/30"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(card.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary transition-colors hover:bg-primary/30"
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
                      className="mt-auto rounded-lg border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
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
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </form>
        )}

        {/* Cart summary + submit */}
        {selections.size > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-primary">
                {selections.size} item{selections.size > 1 ? 's' : ''} selected
              </p>
              <p className="truncate text-[11px] text-white/50">
                {summaryParts.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
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

              <span className="text-2xl leading-none">
                {card.emoji ?? '📦'}
              </span>

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
