'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CarouselInputProps {
  cards: Array<{
    id: string;
    label: string;
    emoji?: string;
    image?: string;
    subtitle?: string;
    badge?: string;
  }>;
  multiSelect?: boolean;
  allowCustom?: boolean;
  onSubmit: (value: string) => void;
}

export function CarouselInput({
  cards,
  multiSelect = false,
  allowCustom = false,
  onSubmit,
}: CarouselInputProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  function toggle(id: string) {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
      );
    } else {
      setSelected((prev) => (prev[0] === id ? [] : [id]));
    }
  }

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  }

  function handleSubmit() {
    if (allowCustom && customText.trim()) {
      onSubmit(customText.trim());
      return;
    }
    if (selected.length === 0) return;
    const selectedCards = cards.filter((c) => selected.includes(c.id));
    onSubmit(
      multiSelect
        ? JSON.stringify(selectedCards.map((c) => c.id))
        : selectedCards[0].id,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Scroll area wrapper */}
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white/70 transition-colors hover:text-white"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white/70 transition-colors hover:text-white"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Scrollable card row */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {cards.map((card) => {
            const isSelected = selected.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                className={`snap-start shrink-0 w-24 flex flex-col items-center gap-1.5 rounded-xl border p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]'
                }`}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.label}
                    className="h-12 w-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : card.emoji ? (
                  <span className="text-3xl leading-none">{card.emoji}</span>
                ) : null}

                <span className="text-xs font-medium text-white/90 text-center leading-tight line-clamp-2">
                  {card.label}
                </span>

                {card.subtitle && (
                  <span className="text-[10px] text-white/50 text-center leading-tight line-clamp-1">
                    {card.subtitle}
                  </span>
                )}

                {card.badge && (
                  <span className="mt-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    {card.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom text input */}
      {allowCustom && (
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Or type something specific..."
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-primary/40 transition-colors"
        />
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selected.length === 0 && !(allowCustom && customText.trim())}
        className="self-end rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
      >
        {multiSelect && selected.length > 1
          ? `Submit (${selected.length})`
          : 'Submit'}
      </button>
    </div>
  );
}
