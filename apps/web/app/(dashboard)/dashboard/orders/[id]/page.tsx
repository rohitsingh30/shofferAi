'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderStatusBadge, formatCents, STATUS_CONFIG } from '@/components/orders/OrderStatusBadge';
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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-zinc-700" />
          <div className="rounded-xl border border-white/[0.06] bg-zinc-800/50 p-6">
            <div className="h-6 w-48 rounded bg-zinc-700" />
            <div className="mt-3 h-4 w-32 rounded bg-zinc-700/60" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-zinc-700/40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <BackIcon /> Back to Orders
        </button>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
  const addr = order.deliveryAddress;
  const statusIcon = STATUS_CONFIG[order.status]?.icon || '•';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Back nav */}
      <button
        onClick={() => router.push('/dashboard/orders')}
        className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <BackIcon /> Back to Orders
      </button>

      {/* ─── Order Header ─── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {order.targetSite} · {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ─── Status Summary ─── */}
      <div className="mb-6 rounded-xl border border-white/[0.06] bg-zinc-800/50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusIcon}</span>
          <span className="text-sm font-medium text-white">
            {STATUS_CONFIG[order.status]?.label || order.status.replace(/_/g, ' ')}
          </span>
        </div>
        {order.statusMessage && (
          <p className="mt-1 pl-7 text-xs text-zinc-400">{order.statusMessage}</p>
        )}
        {order.estimatedDelivery && order.status !== 'delivered' && (
          <p className="mt-1 pl-7 text-xs text-zinc-400">
            🚚 Estimated delivery: {formatDate(order.estimatedDelivery)}
          </p>
        )}
        {order.deliveredAt && (
          <p className="mt-1 pl-7 text-xs text-emerald-400">
            Delivered {formatDate(order.deliveredAt)}
          </p>
        )}
      </div>

      {/* ─── Action Buttons ─── */}
      {(order.targetOrderUrl || order.targetTrackingUrl) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {order.targetTrackingUrl && (
            <a
              href={order.targetTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Track on {order.targetSite} <ExternalLinkIcon />
            </a>
          )}
          {order.targetOrderUrl && (
            <a
              href={order.targetOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              View on {order.targetSite} <ExternalLinkIcon />
            </a>
          )}
        </div>
      )}

      {/* ─── Items ─── */}
      {items.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Items</h2>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-800/50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{item.name || item.title || 'Item'}</p>
                  {item.variant && (
                    <p className="mt-0.5 text-xs text-zinc-500">{item.variant}</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-3 text-sm text-zinc-400">
                  {(item.quantity || item.qty) && (
                    <span>×{item.quantity || item.qty}</span>
                  )}
                  {item.priceCents != null && (
                    <span className="text-white">{formatCents(item.priceCents)}</span>
                  )}
                  {item.price && !item.priceCents && (
                    <span className="text-white">{item.price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Payment Breakdown ─── */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Payment</h2>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Product</span>
            <span className="text-white">{formatCents(order.productAmountCents)}</span>
          </div>
          {order.serviceFeeCents > 0 && (
            <div className="mt-1.5 flex justify-between text-sm">
              <span className="text-zinc-400">Service fee</span>
              <span className="text-white">{formatCents(order.serviceFeeCents)}</span>
            </div>
          )}
          <div className="mt-2 border-t border-white/[0.06] pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-zinc-300">Total</span>
              <span className="text-white">{formatCents(order.totalCents)}</span>
            </div>
          </div>
          {order.payment.paidAt && (
            <p className="mt-2 text-xs text-zinc-500">
              Paid {formatDate(order.payment.paidAt)}
              {order.payment.razorpayPaymentId && (
                <span> · {order.payment.razorpayPaymentId}</span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* ─── Delivery Address ─── */}
      {addr && typeof addr === 'object' && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Delivery Address</h2>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
            {addr.name && <p className="font-medium text-white">{addr.name}</p>}
            {addr.line1 && <p>{addr.line1}</p>}
            {addr.line2 && <p>{addr.line2}</p>}
            <p>
              {[addr.city, addr.state, addr.pin].filter(Boolean).join(', ')}
            </p>
            {addr.phone && <p className="mt-1">📞 {addr.phone}</p>}
          </div>
        </section>
      )}

      {/* ─── Target Site Info ─── */}
      {order.targetOrderId && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">{order.targetSite} Details</h2>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">{order.targetSite} Order ID</span>
              <span className="text-white">{order.targetOrderId}</span>
            </div>
          </div>
        </section>
      )}

      {/* ─── Status Timeline ─── */}
      {order.statusHistory.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Timeline</h2>
          <OrderTimeline entries={order.statusHistory} currentStatus={order.status} />
        </section>
      )}
    </div>
  );
}
