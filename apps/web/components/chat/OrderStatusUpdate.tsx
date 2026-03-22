/** Chat card for delivery status updates (shipped, delivered, etc.). */

import { STATUS_CONFIG } from '@/components/orders/OrderStatusBadge';

export interface OrderStatusUpdateProps {
  orderNumber: string;
  status: string;
  message: string;
  targetTrackingUrl?: string;
  targetSite?: string;
}

export function OrderStatusUpdate({
  orderNumber,
  status,
  message,
  targetTrackingUrl,
  targetSite,
}: OrderStatusUpdateProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' '),
    icon: '📋',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
  };

  const borderColor =
    status === 'delivered'
      ? 'border-emerald-500/40'
      : status === 'shipped' || status === 'out_for_delivery'
        ? 'border-indigo-500/40'
        : status === 'cancelled'
          ? 'border-red-500/40'
          : 'border-white/[0.08]';

  return (
    <div
      className={`rounded-xl border-l-[3px] ${borderColor} border border-white/[0.06] bg-zinc-900/60 px-4 py-3`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className="text-sm font-medium text-white">{config.label}</span>
      </div>

      <p className="mt-1 pl-7 text-xs text-zinc-400">{orderNumber}</p>

      {message && (
        <p className="mt-1.5 pl-7 text-sm text-zinc-300">{message}</p>
      )}

      {targetTrackingUrl && (
        <div className="mt-3 pl-7">
          <a
            href={targetTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.1]"
          >
            Track{targetSite ? ` on ${targetSite}` : ''}{' '}
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
