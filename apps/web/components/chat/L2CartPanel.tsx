'use client';

import { useState, useCallback } from 'react';
import { useCart, type CartItemData } from './CartContext';
import { useL2Cart } from './L2CartContext';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CartItemRow({ item, onUpdateQty, onRemove }: {
  item: CartItemData;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      {/* Image */}
      {item.image && (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-white">{item.name}</span>
        {item.color && (
          <span className="text-xs text-zinc-500">{item.color}</span>
        )}
        <span className="text-sm font-semibold text-white">
          {formatPrice(item.price)}
        </span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onUpdateQty(item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          +
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  );
}

export function L2CartPanel() {
  const { items, store, taskId: cartTaskId, total, isEmpty, updateQuantity, removeItem, clearCart } = useCart();
  const { closeCart, pendingConfirm, clearPendingConfirm } = useL2Cart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckoutConfirm = useCallback(() => {
    if (!pendingConfirm) return;
    pendingConfirm();
    clearPendingConfirm();
    closeCart();
  }, [pendingConfirm, clearPendingConfirm, closeCart]);

  const handlePayNow = useCallback(async () => {
    if (isEmpty) return;
    setLoading(true);
    setError(null);

    try {
      const taskId = cartTaskId || `cart-${Date.now()}`;
      const summary = JSON.stringify({
        store,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: formatPrice(item.price),
          subtotal: formatPrice(item.price * item.quantity),
        })),
        total: formatPrice(total),
      });

      // Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          amountCents: total * 100,
          serviceFeeCents: 0,
          bookingSummary: summary,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const { orderId, amount, currency, key } = await orderRes.json();

      // Load and open Razorpay Checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          order_id: orderId,
          name: 'ShofferAI',
          description: `${store} order`,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  taskId,
                  stepId: 'cart-payment',
                }),
              });

              if (!verifyRes.ok) {
                throw new Error('Payment verification failed');
              }

              // Success — clear cart and close panel
              clearCart();
              closeCart();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
          theme: { color: '#7c3aed' },
        };

        // @ts-expect-error Razorpay is loaded via script
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  }, [items, store, total, cartTaskId, isEmpty, clearCart, closeCart]);

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-chat-bg px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
          <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-chat-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Your Cart</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {store} · {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCart}
            className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Clear all
          </button>
          {/* Close button */}
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2.5">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={(qty) => updateQuantity(item.id, qty)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Price breakdown + Pay button */}
      <div className="border-t border-border/50 px-5 py-4 space-y-4">
        {/* Breakdown */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-zinc-400 truncate pr-2">
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0 text-zinc-300">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-white/[0.06] pt-2">
            <div className="flex justify-between text-base font-semibold">
              <span className="text-white">Total</span>
              <span className="text-emerald-400">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        {/* Action button: "Proceed to Checkout" (confirmation) or "Pay Now" (direct payment) */}
        {pendingConfirm ? (
          <button
            onClick={handleCheckoutConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Proceed to Checkout · {formatPrice(total)}
          </button>
        ) : (
          <button
            onClick={handlePayNow}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Pay Now · {formatPrice(total)}
              </>
            )}
          </button>
        )}

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Secured by Razorpay · UPI, Cards, Net Banking
        </div>
      </div>
    </div>
  );
}
