'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  name?: string;
  title?: string;
  quantity?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  statusMessage: string | null;
  targetSite: string;
  targetOrderId: string | null;
  items: OrderItem[] | unknown;
  itemCount: number;
  productAmountCents: number;
  serviceFeeCents: number;
  totalCents: number;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  payment_received: { label: 'Payment Received', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  placing_order: { label: 'Placing Order', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  order_placed: { label: 'Order Placed', bg: 'bg-green-500/10', text: 'text-green-400' },
  shipped: { label: 'Shipped', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  out_for_delivery: { label: 'Out for Delivery', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  checkout_failed: { label: 'Checkout Failed', bg: 'bg-red-500/10', text: 'text-red-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
  refunded: { label: 'Refunded', bg: 'bg-orange-500/10', text: 'text-orange-400' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' '),
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function formatCents(cents: number): string {
  return `₹${(cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function getItemSummary(items: OrderItem[] | unknown, itemCount: number): string {
  if (!Array.isArray(items) || items.length === 0) {
    return `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
  }
  const first = items[0];
  const name = first?.name || first?.title || 'Item';
  if (items.length === 1) return name;
  return `${name} +${items.length - 1} more`;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.06] bg-zinc-800/50 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-zinc-700" />
          <div className="h-3 w-20 rounded bg-zinc-700/60" />
        </div>
        <div className="h-5 w-24 rounded-full bg-zinc-700" />
      </div>
      <div className="mt-3 h-3 w-48 rounded bg-zinc-700/40" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-zinc-700/60" />
        <div className="h-3 w-24 rounded bg-zinc-700/40" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load orders');
        const data: OrdersResponse = await res.json();
        setOrders(data.orders);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-white">Orders</h1>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <svg className="mb-3 h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm">No orders yet</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <a
              key={order.id}
              href="#"
              className="block rounded-xl border border-white/[0.06] bg-zinc-800/50 p-4 transition-colors hover:border-white/[0.1] hover:bg-zinc-800/80"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{order.targetSite}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {getItemSummary(order.items, order.itemCount)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium text-white">{formatCents(order.totalCents)}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
