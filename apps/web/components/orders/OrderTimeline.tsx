import { STATUS_CONFIG } from './OrderStatusBadge';

interface TimelineEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  message: string | null;
  metadata: string | null;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

// Tailwind colour classes mapped per status
const DOT_COLORS: Record<string, { bg: string; ring: string }> = {
  order_placed:     { bg: 'bg-green-400',   ring: 'ring-green-400/20' },
  shipped:          { bg: 'bg-indigo-400',   ring: 'ring-indigo-400/20' },
  out_for_delivery: { bg: 'bg-purple-400',   ring: 'ring-purple-400/20' },
  delivered:        { bg: 'bg-emerald-400',  ring: 'ring-emerald-400/20' },
  cancelled:        { bg: 'bg-zinc-500',     ring: 'ring-zinc-500/20' },
  checkout_failed:  { bg: 'bg-red-400',      ring: 'ring-red-400/20' },
};
const DEFAULT_DOT = { bg: 'bg-zinc-600', ring: 'ring-zinc-600/20' };

export function OrderTimeline({
  entries,
}: {
  entries: TimelineEntry[];
  currentStatus?: string;
}) {
  return (
    <div className="relative ml-1">
      {/* Vertical connector line */}
      <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.05] to-transparent" />

      <div className="space-y-5">
        {entries.map((entry, i) => {
          const isLatest = i === entries.length - 1;
          const config = STATUS_CONFIG[entry.toStatus];
          const dot = DOT_COLORS[entry.toStatus] || DEFAULT_DOT;

          let meta: Record<string, string> | null = null;
          if (entry.metadata) {
            try { meta = JSON.parse(entry.metadata); } catch { /* ignore */ }
          }

          return (
            <div key={entry.id} className="relative flex gap-4 pl-0">
              {/* Dot */}
              <div className="relative z-10 mt-[5px] flex-shrink-0">
                <div className={`h-[11px] w-[11px] rounded-full ${
                  isLatest
                    ? `${dot.bg} ring-4 ${dot.ring}`
                    : 'bg-zinc-600 ring-2 ring-zinc-700/50'
                }`} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-0.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`text-[13px] font-medium ${isLatest ? 'text-white' : 'text-zinc-400'}`}>
                    {config?.label || entry.toStatus.replace(/_/g, ' ')}
                  </p>
                  <span
                    className="flex-shrink-0 text-[11px] tabular-nums text-zinc-600"
                    title={formatTimestamp(entry.createdAt)}
                  >
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
                {entry.message && (
                  <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{entry.message}</p>
                )}
                {meta?.courierName && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-500">
                    <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1 2-1zm0 0l6-3v10l-6 3m0-10l6-3" />
                    </svg>
                    {meta.courierName}{meta.trackingNumber && ` · ${meta.trackingNumber}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
