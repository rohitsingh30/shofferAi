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
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderTimeline({
  entries,
  currentStatus,
}: {
  entries: TimelineEntry[];
  currentStatus: string;
}) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />

      <div className="space-y-4">
        {entries.map((entry, i) => {
          const isLatest = i === entries.length - 1;
          const config = STATUS_CONFIG[entry.toStatus];
          const dotColor = isLatest
            ? config?.text || 'text-zinc-400'
            : 'text-zinc-600';

          let meta: Record<string, string> | null = null;
          if (entry.metadata) {
            try { meta = JSON.parse(entry.metadata); } catch { /* ignore */ }
          }

          return (
            <div key={entry.id} className="relative flex gap-3 pl-0">
              {/* Dot */}
              <div className={`relative z-10 mt-1 h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 ${
                isLatest
                  ? `border-current ${dotColor} bg-current/20`
                  : 'border-zinc-600 bg-zinc-800'
              }`} />

              {/* Content */}
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm font-medium ${isLatest ? 'text-white' : 'text-zinc-400'}`}>
                    {config?.label || entry.toStatus.replace(/_/g, ' ')}
                  </p>
                  <span className="flex-shrink-0 text-xs text-zinc-600" title={formatTimestamp(entry.createdAt)}>
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
                {entry.message && (
                  <p className="mt-0.5 text-xs text-zinc-500">{entry.message}</p>
                )}
                {meta?.courierName && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Courier: {meta.courierName}
                    {meta.trackingNumber && ` · ${meta.trackingNumber}`}
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
