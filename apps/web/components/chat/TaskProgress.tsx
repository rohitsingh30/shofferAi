export interface StepInfo {
  action: string;
  status: string;
}

export function TaskProgress({ steps }: { steps: StepInfo[] }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1 rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Working on it
          </span>
        </div>
        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <StepIcon status={step.status} />
              <span
                className={`text-sm ${
                  step.status === 'completed'
                    ? 'text-muted-foreground line-through'
                    : step.status === 'running'
                    ? 'text-foreground'
                    : step.status === 'failed'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
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
        <div className={`${base}`}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    case 'completed':
      return (
        <div className={`${base} bg-success/20`}>
          <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'failed':
      return (
        <div className={`${base} bg-destructive/20`}>
          <svg className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case 'paused_for_input':
      return (
        <div className={`${base} bg-warning/20`}>
          <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
        </div>
      );
    default:
      return (
        <div className={`${base}`}>
          <div className="h-2 w-2 rounded-full bg-border" />
        </div>
      );
  }
}
