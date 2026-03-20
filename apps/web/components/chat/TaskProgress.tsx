export interface StepInfo {
  action: string;
  status: string;
}

export function TaskProgress({ steps }: { steps: StepInfo[] }) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-sm shadow-primary/50" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Working on it
            </span>
          </div>
          {steps.length > 1 && (
            <span className="text-[11px] text-zinc-600">{completedCount}/{steps.length}</span>
          )}
        </div>

        {/* Progress bar */}
        {steps.length > 1 && (
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <StepIcon status={step.status} />
              <span
                className={`text-[13px] transition-colors ${
                  step.status === 'completed'
                    ? 'text-zinc-600 line-through decoration-zinc-700'
                    : step.status === 'running'
                    ? 'text-zinc-200'
                    : step.status === 'failed'
                    ? 'text-red-400'
                    : 'text-zinc-500'
                }`}
              >
                {step.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  const base = 'h-5 w-5 flex items-center justify-center rounded-full shrink-0';

  switch (status) {
    case 'running':
      return (
        <div className={base}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      );
    case 'completed':
      return (
        <div className={`${base} bg-emerald-500/15`}>
          <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'failed':
      return (
        <div className={`${base} bg-red-500/15`}>
          <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case 'paused_for_input':
      return (
        <div className={`${base} bg-amber-500/15`}>
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        </div>
      );
    default:
      return (
        <div className={base}>
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
        </div>
      );
  }
}
