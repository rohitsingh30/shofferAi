'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OrderStatusBadge, formatCents } from '@/components/orders/OrderStatusBadge';

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
    <div className="flex-1 overflow-y-auto">
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-white">Orders</h1>

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
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-xl border border-white/[0.06] bg-zinc-800/50 p-4 transition-colors hover:border-white/[0.1] hover:bg-zinc-800/80"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{order.targetSite}</p>
                </div>
                <OrderStatusBadge status={order.status} />
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
            </Link>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
