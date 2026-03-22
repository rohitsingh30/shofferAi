'use client';

import { useMemo } from 'react';
import type { ProductCardData } from '@shofferai/shared';
import { useCart } from '../CartContext';
import { useL2Cart } from '../L2CartContext';
import { useImagePreloader } from './useImagePreloader';
import { ProductCardSkeleton } from './CardSkeletons';

interface ProductCardInputProps {
  product: ProductCardData;
  onSubmit: (value: string) => void;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCardInput({ product, onSubmit }: ProductCardInputProps) {
  const { addItem, items } = useCart();
  const { openCart } = useL2Cart();

  const imageUrls = useMemo(() => [product.image], [product.image]);
  const { ready: imageReady, failed: imgFailed } = useImagePreloader(imageUrls);

  const handlePayNow = () => {
    // Only add if not already in cart (carousel selection may have added it)
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const alreadyInCart = items.some(
      (item) =>
        item.id === product.id ||
        item.name === product.name ||
        normalize(item.name).includes(normalize(product.name)) ||
        normalize(product.name).includes(normalize(item.name)),
    );
    if (!alreadyInCart) {
      addItem(product);
    }
    openCart();
    onSubmit('proceed_to_pay');
  };

  const handleViewOnStore = () => {
    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!imageReady) {
    return <ProductCardSkeleton />;
  }

  const showImage = product.image && !imgFailed.has(product.image);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      {/* Product content */}
      <div className="flex gap-4 p-4">
        {/* Image */}
        {showImage && (
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-white/[0.06]">
            <img
              src={product.image!}
              alt={product.name}
              className="h-full w-full object-contain p-2"
            />
          </div>
        )}

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Store badge */}
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary/80">
            {product.store}
          </span>

          {/* Name */}
          <h3 className="text-[15px] font-semibold leading-tight text-white">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-zinc-500 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
            {product.discount && (
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
                {product.discount}
              </span>
            )}
          </div>

          {/* Rating + Delivery */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            {product.rating && (
              <span className="flex items-center gap-1">
                <span className="text-amber-400">★</span>
                <span className="text-zinc-300">{product.rating}</span>
                {product.ratingCount && (
                  <span className="text-zinc-500">({product.ratingCount})</span>
                )}
              </span>
            )}
            {product.delivery && (
              <span className="flex items-center gap-1">
                <span>🚚</span>
                <span>{product.delivery}</span>
                {product.deliveryFree && (
                  <span className="font-medium text-emerald-400">Free</span>
                )}
              </span>
            )}
          </div>

          {/* Color */}
          {product.color && (
            <span className="text-xs text-zinc-500">
              Color: <span className="text-zinc-300">{product.color}</span>
            </span>
          )}
        </div>
      </div>

      {/* Specs */}
      {product.specs && product.specs.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <div className="flex flex-wrap gap-2">
            {product.specs.map((spec, i) => (
              <span
                key={i}
                className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-300"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {product.offers && product.offers.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <div className="space-y-1">
            {product.offers.map((offer, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 text-amber-400">💳</span>
                <span className="text-zinc-300">{offer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons: Pay Now + View on Store */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex gap-2">
          {/* Pay Now — primary action */}
          <button
            onClick={handlePayNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Pay Now
          </button>

          {/* View on Store — secondary action, opens product in new tab */}
          {product.url ? (
            <button
              onClick={handleViewOnStore}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View on {product.store}
            </button>
          ) : (
            <button
              onClick={() => {
                const q = encodeURIComponent(product.name);
                const storeUrls: Record<string, string> = {
                  Flipkart: `https://www.flipkart.com/search?q=${q}`,
                  Amazon: `https://www.amazon.in/s?k=${q}`,
                  Myntra: `https://www.myntra.com/${q}`,
                };
                const url = storeUrls[product.store] || `https://www.google.com/search?q=${q}+${encodeURIComponent(product.store)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View on {product.store}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
