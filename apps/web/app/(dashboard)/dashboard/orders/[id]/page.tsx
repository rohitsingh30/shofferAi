'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCents, STATUS_CONFIG } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';

interface OrderItem {
  name?: string;
  title?: string;
  quantity?: number;
  qty?: number;
  priceCents?: number;
  price?: string;
  variant?: string;
  image?: string;
}

interface StatusHistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  message: string | null;
  metadata: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  statusMessage: string | null;
  targetSite: string;
  targetOrderId: string | null;
  targetOrderUrl: string | null;
  targetTrackingUrl: string | null;
  items: OrderItem[] | unknown;
  itemCount: number;
  productAmountCents: number;
  serviceFeeCents: number;
  totalCents: number;
  deliveryAddress: Record<string, string> | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  placedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
  payment: {
    razorpayPaymentId: string | null;
    razorpayOrderId: string | null;
    paidAt: string | null;
    currency: string;
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Status-aware accent colours ──
const STATUS_ACCENT: Record<string, { border: string; glow: string; ring: string }> = {
  delivered:        { border: 'border-emerald-500/30', glow: 'shadow-emerald-500/5',  ring: 'ring-emerald-500/20' },
  shipped:          { border: 'border-indigo-500/30',  glow: 'shadow-indigo-500/5',   ring: 'ring-indigo-500/20' },
  out_for_delivery: { border: 'border-purple-500/30',  glow: 'shadow-purple-500/5',   ring: 'ring-purple-500/20' },
  order_placed:     { border: 'border-green-500/30',   glow: 'shadow-green-500/5',    ring: 'ring-green-500/20' },
  cancelled:        { border: 'border-zinc-500/30',    glow: 'shadow-zinc-500/5',     ring: 'ring-zinc-500/20' },
  checkout_failed:  { border: 'border-red-500/30',     glow: 'shadow-red-500/5',      ring: 'ring-red-500/20' },
};
const DEFAULT_ACCENT = { border: 'border-white/[0.08]', glow: '', ring: 'ring-white/10' };

function capitalise(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(async (res) => {
        if (res.status === 404) throw new Error('Order not found');
        if (!res.ok) throw new Error('Failed to load order');
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="rounded-2xl bg-zinc-800/60 p-8">
              <div className="h-5 w-40 rounded bg-zinc-700" />
              <div className="mt-4 h-3 w-28 rounded bg-zinc-700/50" />
              <div className="mt-8 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-3 w-full rounded bg-zinc-700/30" />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 rounded-2xl bg-zinc-800/60" />
              <div className="h-32 rounded-2xl bg-zinc-800/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / 404 ── */
  if (error || !order) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="group mb-8 flex items-center gap-2 text-[13px] text-zinc-500 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Orders
          </button>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-sm text-red-400">
            {error || 'Order not found'}
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
  const addr = order.deliveryAddress;
  const cfg = STATUS_CONFIG[order.status];
  const accent = STATUS_ACCENT[order.status] || DEFAULT_ACCENT;
  const siteName = capitalise(order.targetSite);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">

        {/* ── Back nav ── */}
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="group mb-8 flex items-center gap-2 text-[13px] text-zinc-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Orders
        </button>

        {/* ━━━━━━ Hero Card ━━━━━━ */}
        <div className={`relative rounded-2xl border ${accent.border} bg-zinc-900/80 p-6 shadow-lg ${accent.glow} ring-1 ${accent.ring}`}>
          {/* Top row: order # + badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{siteName}</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-white">
                {order.orderNumber}
              </h1>
              <p className="mt-1.5 text-[13px] text-zinc-500">
                {shortDate(order.createdAt)}
              </p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${cfg?.bg || 'bg-zinc-800'} ${cfg?.text || 'text-zinc-400'}`}>
              {cfg?.icon} {cfg?.label || order.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Status line */}
          <div className="mt-5 flex items-center gap-2.5 text-sm">
            {order.statusMessage && (
              <p className="text-zinc-400">{order.statusMessage}</p>
            )}
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <p className="text-zinc-500">
                Est. delivery {shortDate(order.estimatedDelivery)}
              </p>
            )}
            {order.deliveredAt && (
              <p className="text-emerald-400/90">
                ✓ Delivered {formatDate(order.deliveredAt)}
              </p>
            )}
          </div>

          {/* Action links */}
          {(order.targetTrackingUrl || order.targetOrderUrl) && (
            <div className="mt-5 flex gap-2.5">
              {order.targetTrackingUrl && (
                <a href={order.targetTrackingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/[0.12]">
                  Track Package
                  <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {order.targetOrderUrl && (
                <a href={order.targetOrderUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-400 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white">
                  View on {siteName}
                  <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* ━━━━━━ Two-column grid: Items + Payment ━━━━━━ */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Items */}
          {items.length > 0 && (
            <section className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-5">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Items
              </h2>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-white">
                        {item.name || item.title || 'Item'}
                      </p>
                      {item.variant && (
                        <p className="mt-0.5 text-[11px] text-zinc-500">{item.variant}</p>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 text-[13px]">
                      {(item.quantity || item.qty) && (
                        <span className="text-zinc-600">×{item.quantity || item.qty}</span>
                      )}
                      <span className="font-medium text-white tabular-nums">
                        {item.priceCents != null ? formatCents(item.priceCents) : item.price || ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment */}
          <section className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Payment
            </h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="tabular-nums text-zinc-300">{formatCents(order.productAmountCents)}</span>
              </div>
              {order.serviceFeeCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service fee</span>
                  <span className="tabular-nums text-zinc-300">{formatCents(order.serviceFeeCents)}</span>
                </div>
              )}
              <div className="mt-1 border-t border-white/[0.06] pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="tabular-nums text-white">{formatCents(order.totalCents)}</span>
                </div>
              </div>
            </div>
            {order.payment.paidAt && (
              <p className="mt-3 text-[11px] text-zinc-600">
                Paid {formatDate(order.payment.paidAt)}
                {order.payment.razorpayPaymentId && (
                  <span className="ml-1 font-mono">{order.payment.razorpayPaymentId}</span>
                )}
              </p>
            )}
          </section>
        </div>

        {/* ━━━━━━ Two-column grid: Address + Site Details ━━━━━━ */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Delivery Address */}
          {addr && typeof addr === 'object' && (
            <section className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-5">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Delivery Address
              </h2>
              <div className="space-y-0.5 text-[13px] leading-relaxed text-zinc-400">
                {addr.name && <p className="font-medium text-white">{addr.name}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{[addr.city, addr.state, addr.pin].filter(Boolean).join(', ')}</p>
                {addr.phone && (
                  <p className="mt-2 flex items-center gap-1.5 text-zinc-500">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {addr.phone}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Site details */}
          {order.targetOrderId && (
            <section className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-5">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {siteName} Details
              </h2>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-zinc-500">Order ID</p>
                  <p className="mt-0.5 font-mono text-white">{order.targetOrderId}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ━━━━━━ Timeline ━━━━━━ */}
        {order.statusHistory.length > 0 && (
          <section className="mt-6 rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-5">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Timeline
            </h2>
            <OrderTimeline entries={order.statusHistory} currentStatus={order.status} />
          </section>
        )}

        {/* Bottom spacer for comfortable scrolling */}
        <div className="h-10" />
      </div>
    </div>
  );
}
