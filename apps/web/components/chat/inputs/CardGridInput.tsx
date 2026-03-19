'use client';

import { useState } from 'react';

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

export function CardGridInput({
  cards,
  showQuantity = false,
  allowCustom = false,
  multiSelect = true,
  onSubmit,
}: CardGridInputProps) {
  // Map of card id → quantity (presence = selected, value = qty)
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [customText, setCustomText] = useState('');
  const [customItems, setCustomItems] = useState<CardItem[]>([]);

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

  // Build summary string
  const summaryParts = Array.from(selections.entries())
    .map(([id, qty]) => {
      const card = allCards.find((c) => c.id === id);
      const label = card?.label ?? id;
      return showQuantity ? `${label} ×${qty}` : label;
    });

  return (
    <div className="space-y-3">
      {/* Card grid */}
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
                if (showQuantity && isSelected) return; // stepper handles it
                toggleCard(card.id);
              }}
            >
              {/* Badge */}
              {card.badge && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {card.badge}
                </span>
              )}

              {/* Emoji or Image */}
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.label}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <span className="text-2xl leading-none">
                  {card.emoji ?? '📦'}
                </span>
              )}

              {/* Label */}
              <span className="text-center text-sm text-foreground/80">
                {card.label}
              </span>

              {/* Subtitle */}
              {card.subtitle && (
                <span className="text-center text-xs text-muted-foreground">
                  {card.subtitle}
                </span>
              )}

              {/* Quantity stepper */}
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

              {/* Add button (quantity mode, not yet selected) */}
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

      {/* Cart summary + submit */}
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
