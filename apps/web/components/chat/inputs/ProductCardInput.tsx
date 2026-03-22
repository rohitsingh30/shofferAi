'use client';

import { useMemo } from 'react';
import type { ProductCardData } from '@shofferai/shared';
import { useCart } from '../CartContext';
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
  const { addItem } = useCart();

  const imageUrls = useMemo(() => [product.image], [product.image]);
  const { ready: imageReady, failed: imgFailed } = useImagePreloader(imageUrls);

  const handleAddToCart = () => {
    addItem(product);
    onSubmit('added_to_cart');
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

      {/* Add to Cart button */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
