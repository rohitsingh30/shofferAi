/** Shared order status badge + config used by orders list & detail pages. */

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  payment_received: { label: 'Payment Received', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: '💳' },
  placing_order: { label: 'Placing Order', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: '⏳' },
  order_placed: { label: 'Order Placed', bg: 'bg-green-500/10', text: 'text-green-400', icon: '✅' },
  shipped: { label: 'Shipped', bg: 'bg-indigo-500/10', text: 'text-indigo-400', icon: '📦' },
  out_for_delivery: { label: 'Out for Delivery', bg: 'bg-purple-500/10', text: 'text-purple-400', icon: '🚚' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '🟢' },
  checkout_failed: { label: 'Checkout Failed', bg: 'bg-red-500/10', text: 'text-red-400', icon: '❌' },
  cancelled: { label: 'Cancelled', bg: 'bg-zinc-500/10', text: 'text-zinc-400', icon: '🚫' },
  refunded: { label: 'Refunded', bg: 'bg-orange-500/10', text: 'text-orange-400', icon: '💸' },
  return_requested: { label: 'Return Requested', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '↩️' },
  return_initiated: { label: 'Return Initiated', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '📤' },
  return_picked_up: { label: 'Return Picked Up', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '🚛' },
  target_refund_received: { label: 'Merchant Refunded', bg: 'bg-orange-500/10', text: 'text-orange-400', icon: '🏦' },
  user_refunded: { label: 'Refund Complete', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '✅' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' '),
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    icon: '•',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

/** Format cents (paise) as ₹X,XXX.XX */
export function formatCents(cents: number): string {
  return `₹${(cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
