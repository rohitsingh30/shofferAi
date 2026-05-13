'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useImagePreloader } from './useImagePreloader';
import { CardGridSkeleton } from './CardSkeletons';
import { CardPlaceholder } from './CardPlaceholder';

interface CardData {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  subtitle?: string;
  badge?: string;
}

interface CarouselInputProps {
  cards: CardData[];
  multiSelect?: boolean;
  allowCustom?: boolean;
  /** When true, each card shows a per-card ADD button. Tapping it fires
   *  onSubmit immediately with that card's id (no submit-bar wait). */
  instantAdd?: boolean;
  onSubmit: (value: string) => void;
}

/* Detect whether any card has a real product image */
function hasImages(cards: CardData[]): boolean {
  return cards.some((c) => c.image && c.image.startsWith('http'));
}

/* Parse "₹44 · 450 ml" → { price: "₹44", detail: "450 ml" } */
function parseSubtitle(sub?: string): { price?: string; detail?: string } {
  if (!sub) return {};
  const m = sub.match(/^(₹[\d,]+)\s*[·•\-–]\s*(.+)$/);
  if (m) return { price: m[1], detail: m[2].trim() };
  if (/^₹/.test(sub)) return { price: sub };
  return { detail: sub };
}

export function CarouselInput({
  cards,
  multiSelect = false,
  allowCustom = false,
  instantAdd = false,
  onSubmit,
}: CarouselInputProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [customText, setCustomText] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const productMode = hasImages(cards);

  // Preload all product images — show shimmer until ready
  const imageUrls = useMemo(() => cards.map((c) => c.image), [cards]);
  const { ready: imagesReady, failed: imgErrors } = useImagePreloader(
    productMode ? imageUrls : [],
  );

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 4);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
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
    const cardWidth = productMode ? 172 : 120;
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
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

  /** Instant-add: tap ADD on a single card → submit immediately as a
   *  single-item array (consistent with multi-select shape so the cloud
   *  agent always receives [{id, qty}]). Visual: card flashes "✓ Added"
   *  for 1.2s so the user has feedback before the next agent message. */
  function handleInstantAdd(id: string) {
    setJustAdded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    onSubmit(JSON.stringify([{ id, qty: 1 }]));
    setTimeout(() => {
      setJustAdded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1500);
  }

  /* ─── Product Mode: large image cards ─── */
  if (productMode) {
    return (
      <div className="flex flex-col gap-3">
        {/* Shimmer skeleton while images preload */}
        {!imagesReady && <CardGridSkeleton count={cards.length} cols="carousel" />}

        {/* Real carousel — hidden until all images ready, then fades in */}
        <div className={`transition-opacity duration-300 ${imagesReady ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'}`}>
        {/* Carousel wrapper */}
        <div className="carousel-wrapper relative -mx-1">
          {/* Edge fade — left */}
          {showLeftArrow && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--color-background)] to-transparent" />
          )}
          {/* Edge fade — right */}
          {showRightArrow && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--color-background)] to-transparent" />
          )}

          {/* Left arrow */}
          {showLeftArrow && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute -left-1 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white/70 shadow-xl backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:scale-105"
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {showRightArrow && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute -right-1 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white/70 shadow-xl backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white hover:scale-105"
              aria-label="Scroll right"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 pb-2"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {cards.map((card, i) => {
              const isSelected = selected.includes(card.id);
              const wasJustAdded = justAdded.has(card.id);
              const showImg = card.image && !imgErrors.has(card.image);
              const { price, detail } = parseSubtitle(card.subtitle);

              // In instantAdd mode, the whole card is non-toggleable; only
              // the explicit ADD button submits. In normal mode, the card is
              // a toggle button that drives the bottom submit bar.
              const CardEl = instantAdd ? 'div' : 'button';
              const cardProps = instantAdd
                ? {}
                : { type: 'button' as const, onClick: () => toggle(card.id) };

              return (
                <CardEl
                  key={card.id}
                  {...(cardProps as Record<string, unknown>)}
                  className={`carousel-card snap-start shrink-0 w-[156px] flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 group ${
                    instantAdd
                      ? 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
                      : isSelected
                      ? 'border-primary/70 bg-primary/[0.06] ring-2 ring-primary/25 shadow-lg shadow-primary/10 scale-[1.02] cursor-pointer'
                      : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 cursor-pointer'
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Image area */}
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-white/[0.06] p-3">
                    {/* Badge */}
                    {card.badge && (
                      <span className="absolute left-2 top-2 z-10 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
                        {card.badge}
                      </span>
                    )}

                    {/* Selected check (toggle mode only) */}
                    {!instantAdd && isSelected && (
                      <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}

                    {/* Just-added flash (instant mode) */}
                    {instantAdd && wasJustAdded && (
                      <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-fade-in">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}

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

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
                    {/* Product name */}
                    <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-white/90">
                      {card.label}
                    </span>

                    {/* Weight / detail */}
                    {detail && (
                      <span className="text-[11px] text-white/40">
                        {detail}
                      </span>
                    )}

                    {/* Price + ADD row */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      {price ? (
                        <span className="text-[15px] font-bold text-primary">
                          {price}
                        </span>
                      ) : !price && card.subtitle ? (
                        <span className="text-[11px] font-medium text-primary/70">
                          {card.subtitle}
                        </span>
                      ) : <span />}

                      {/* Per-card ADD button (instant mode only) */}
                      {instantAdd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantAdd(card.id);
                          }}
                          disabled={wasJustAdded}
                          className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold tracking-wide transition-all ${
                            wasJustAdded
                              ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                              : 'bg-primary/15 text-primary hover:bg-primary/25 active:scale-95 ring-1 ring-primary/30'
                          }`}
                          aria-label={wasJustAdded ? `${card.label} added to cart` : `Add ${card.label} to cart`}
                        >
                          {wasJustAdded ? '✓ ADDED' : 'ADD'}
                        </button>
                      )}
                    </div>
                  </div>
                </CardEl>
              );
            })}
          </div>
        </div>
        </div>

        {/* Scroll indicator dots */}
        {cards.length > 3 && (
          <div className="flex justify-center gap-1">
            {Array.from({ length: Math.min(cards.length, 7) }).map((_, i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-white/20"
              />
            ))}
          </div>
        )}

        {/* Custom text input */}
        {allowCustom && (
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Or type something specific..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        )}

        {/* Submit bar — only relevant in toggle mode (instantAdd has per-card ADD) */}
        {!instantAdd && (selected.length > 0 || (allowCustom && customText.trim())) && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/[0.08] p-3 ring-1 ring-primary/20 animate-fade-in">
            <div className="min-w-0 flex-1">
              {selected.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-primary">
                    {selected.length} selected
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {cards.filter(c => selected.includes(c.id)).map(c => c.label).join(', ')}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
            >
              Confirm →
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── Emoji Mode: compact cards (no product images) ─── */
  return (
    <div className="flex flex-col gap-3">
      <div className="carousel-wrapper relative -mx-1">
        {showLeftArrow && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--color-background)] to-transparent" />
        )}
        {showRightArrow && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--color-background)] to-transparent" />
        )}

        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-1 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white/60 shadow-lg backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-1 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white/60 shadow-lg backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-1 pb-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {cards.map((card, i) => {
            const isSelected = selected.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                className={`carousel-card snap-start shrink-0 w-[108px] flex flex-col items-center gap-1.5 rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/20 scale-[1.03]'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.045] hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.label}
                    className="h-14 w-14 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : card.emoji ? (
                  <span className="text-3xl leading-none">{card.emoji}</span>
                ) : (
                  <CardPlaceholder id={card.id} label={card.label} size="sm" />
                )}

                <span className="text-xs font-medium text-white/90 text-center leading-tight line-clamp-2">
                  {card.label}
                </span>

                {card.subtitle && (
                  <span className="text-[10px] text-white/45 text-center leading-tight line-clamp-1">
                    {card.subtitle}
                  </span>
                )}

                {card.badge && (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                    {card.badge}
                  </span>
                )}

                {isSelected && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {allowCustom && (
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Or type something specific..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={selected.length === 0 && !(allowCustom && customText.trim())}
        className="self-end rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {multiSelect && selected.length > 1
          ? `Confirm (${selected.length})`
          : 'Confirm'}
      </button>
    </div>
  );
}
