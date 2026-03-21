export interface StepInfo {
  action: string;
  status: string;
}

export function TaskProgress({ steps }: { steps: StepInfo[] }) {
  const hasRunning = steps.some(s => s.status === 'running');

  return (
    <div className="flex items-start gap-3.5">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {hasRunning && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        )}
      </div>

      <div className="flex-1 rounded-2xl rounded-tl-md bg-white/[0.03] ring-1 ring-white/[0.06] overflow-hidden">
        {/* Steps timeline */}
        <div className="px-4 py-2.5">
          <div className="space-y-0.5">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                  step.status === 'running' ? 'bg-primary/[0.06]' : ''
                }`}
              >
                <StepIcon status={step.status} />
                <span
                  className={`text-[13px] leading-snug transition-colors ${
                    step.status === 'completed'
                      ? 'text-zinc-600'
                      : step.status === 'running'
                      ? 'text-zinc-200'
                      : step.status === 'failed'
                      ? 'text-red-400'
                      : step.status === 'paused_for_input'
                      ? 'text-amber-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {step.action}
                </span>
                {step.status === 'completed' && (
                  <span className="ml-auto text-[10px] text-zinc-700">done</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'running':
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      );
    case 'completed':
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
          <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'failed':
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15">
          <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case 'paused_for_input':
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
        </div>
      );
  }
}
