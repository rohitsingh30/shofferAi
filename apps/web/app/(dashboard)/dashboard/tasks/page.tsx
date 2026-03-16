'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  description: string;
  workflowType: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  steps: { action: string; status: string }[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Task History</h1>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border">
              <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold">No tasks yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              When you ask ShofferAI to book hotels, order groceries, or handle other tasks, they&apos;ll show up here with full progress tracking.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{task.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {task.workflowType && task.workflowType !== 'generic' && (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                          {task.workflowType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                {task.steps.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="space-y-1.5">
                      {task.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {step.status === 'completed' ? (
                            <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-border" />
                          )}
                          <span className={step.status === 'completed' ? 'text-muted-foreground' : ''}>{step.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-success/15 text-success border-success/20',
    failed: 'bg-destructive/15 text-destructive border-destructive/20',
    running: 'bg-primary/15 text-primary border-primary/20',
    paused_for_input: 'bg-warning/15 text-warning border-warning/20',
    pending: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${styles[status] || styles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
