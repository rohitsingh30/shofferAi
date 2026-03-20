'use client';

import { useState, useEffect, useCallback } from 'react';

type TimeRange = '1' | '6' | '24' | '72' | '168';
type Tab = 'overview' | 'errors' | 'llm' | 'tools' | 'relay' | 'users' | 'chrome' | 'latency';

interface OverviewData {
  totalEvents: number;
  totalErrors: number;
  errorRate: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  taskSuccessRate: string;
  totalUsers: number;
  totalPayments: number;
  avgTaskDurationMs: number;
  totalLLMCalls: number;
  totalToolCalls: number;
}

interface TimelinePoint {
  hour: string;
  count: number;
  errors: number;
}

interface ErrorEvent {
  id: string;
  timestamp: string;
  event: string;
  category: string;
  userId: string | null;
  taskId: string | null;
  metadata: string | null;
}

interface LLMData {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  recentCalls: Array<{
    id: string;
    timestamp: string;
    durationMs: number | null;
    taskId: string | null;
    inputTokens?: number;
    outputTokens?: number;
    iteration?: number;
    skillName?: string;
    stopReason?: string;
  }>;
}

interface ToolData {
  tool: string;
  count: number;
  errors: number;
  avgMs: number;
}

interface RelayData {
  events: Array<{
    id: string;
    timestamp: string;
    event: string;
    success: boolean;
    durationMs: number | null;
    metadata: string | null;
  }>;
  avgRelayLatencyMs: number;
  connections: number;
  disconnections: number;
  errors: number;
}

interface UserData {
  summary: Array<{ event: string; count: number }>;
  recentLogins: Array<{ timestamp: string; userId: string | null; metadata: string | null }>;
}

interface ChromeLiveTask {
  taskId: string;
  userId: string;
  status: 'starting' | 'running' | 'complete' | 'error';
  startedAt: number;
  skill?: string;
  description?: string;
}

interface ChromePoolStatus {
  maxSlots: number;
  active: number;
  ready: number;
  busy: number;
  error: number;
  queueLength: number;
}

interface ChromeHistoricalTask {
  taskId: string;
  userEmail: string | null;
  userName: string | null;
  description: string | null;
  status: string;
  skill: string | null;
  createdAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

interface ChromeData {
  live: {
    type: string;
    timestamp: string;
    tasks: ChromeLiveTask[];
    chromePool: ChromePoolStatus;
  } | null;
  recentTasks: ChromeHistoricalTask[];
  totalTasks: number;
  activeTasks: number;
}

interface LatencyPhaseStats {
  phase: string;
  count: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
}

interface LatencyData {
  phases: LatencyPhaseStats[];
  ttfm: { count: number; avgMs: number; p50Ms: number; p95Ms: number; maxMs: number };
  overall: { count: number; avgMs: number; p50Ms: number; p95Ms: number; maxMs: number; successCount: number; failCount: number };
  recentTasks: Array<{
    taskId: string;
    timestamp: string;
    totalMs: number | null;
    ttfmMs: number | null;
    success: boolean;
    skillName: string | null;
    completedVia: string | null;
    phaseCount: number;
  }>;
  hours: number;
}

interface TaskDetailData {
  task: {
    id: string;
    description: string;
    status: string;
    workflowType: string | null;
    result: string | null;
    createdAt: string;
    completedAt: string | null;
    user: { id: string; email: string | null; name: string | null };
  };
  steps: Array<{
    id: string;
    stepNumber: number;
    action: string;
    toolCalls: string | null;
    status: string;
    result: string | null;
    error: string | null;
    startedAt: string | null;
    completedAt: string | null;
    inputNeeded: string | null;
    userInput: string | null;
  }>;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    metadata: string | null;
    createdAt: string;
  }>;
  telemetry: Array<{
    id: string;
    timestamp: string;
    event: string;
    category: string;
    success: boolean;
    durationMs: number | null;
    metadata: string | null;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amountCents: number;
    totalCents: number;
    currency: string;
    bookingSummary: string;
    createdAt: string;
    paidAt: string | null;
  }>;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TimelineChart({ data }: { data: TimelinePoint[] }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data for this period</p>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 120;

  return (
    <div className="flex items-end gap-1" style={{ height: chartHeight }}>
      {data.map((d, i) => {
        const totalPx = Math.max((d.count / maxCount) * chartHeight, d.count > 0 ? 4 : 0);
        const errorPx = d.count > 0 ? Math.max((d.errors / d.count) * totalPx, d.errors > 0 ? 3 : 0) : 0;
        const successPx = totalPx - errorPx;
        const hour = new Date(d.hour).getHours();
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
            <div className="pointer-events-none absolute -top-8 z-10 hidden rounded bg-popover px-2 py-1 text-xs shadow-lg group-hover:block">
              {d.count} events, {d.errors} errors
            </div>
            {d.count > 0 && (
              <div className="flex w-full flex-col items-stretch">
                {errorPx > 0 && (
                  <div className="w-full rounded-t bg-red-500/80" style={{ height: errorPx }} />
                )}
                <div className={`w-full ${errorPx > 0 ? '' : 'rounded-t'} rounded-b bg-primary/60`} style={{ height: successPx }} />
              </div>
            )}
            {i % Math.max(1, Math.floor(data.length / 8)) === 0 && (
              <span className="absolute -bottom-5 text-[10px] text-muted-foreground">{hour}:00</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

type TaskDetailTab = 'messages' | 'steps' | 'telemetry' | 'payments';

function TaskDetailPanel({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const [data, setData] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<TaskDetailTab>('messages');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/telemetry?view=task-detail&taskId=${taskId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  const detailTabs: { key: TaskDetailTab; label: string; count?: number }[] = [
    { key: 'messages', label: 'Messages', count: data?.messages.length },
    { key: 'steps', label: 'Steps', count: data?.steps.length },
    { key: 'telemetry', label: 'Events', count: data?.telemetry.length },
    { key: 'payments', label: 'Payments', count: data?.payments.length },
  ];

  const statusColor: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    running: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
    pending: 'bg-muted text-muted-foreground',
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="min-w-0 flex-1">
            {data?.task ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold">{data.task.description}</h2>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${statusColor[data.task.status] || 'bg-muted text-muted-foreground'}`}>
                    {data.task.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <code className="cursor-pointer rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]" title="Click to copy" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(taskId); }}>{taskId}</code>
                  <span>{data.task.user.email || data.task.user.name || data.task.user.id.slice(0, 12)}</span>
                  {data.task.workflowType && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">{data.task.workflowType}</span>
                  )}
                  <span>{new Date(data.task.createdAt).toLocaleString()}</span>
                  {data.task.completedAt && (
                    <span>→ {formatDuration(new Date(data.task.completedAt).getTime() - new Date(data.task.createdAt).getTime())}</span>
                  )}
                </div>
              </>
            ) : (
              <h2 className="text-sm font-semibold">Task {taskId.slice(0, 12)}…</h2>
            )}
          </div>
          <button onClick={onClose} className="ml-4 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Detail tabs */}
        <div className="flex gap-0 border-b border-border px-6">
          {detailTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setDetailTab(t.key)}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                detailTab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label} {t.count !== undefined ? `(${t.count})` : ''}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-400">Failed to load: {error}</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <>
              {/* Messages */}
              {detailTab === 'messages' && (
                <div className="space-y-3">
                  {data.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages</p>
                  ) : data.messages.map((m) => {
                    const meta = m.metadata ? (typeof m.metadata === 'string' ? JSON.parse(m.metadata) : m.metadata) : null;
                    const isInput = meta?.inputType;
                    const isConfirm = meta?.type === 'confirmation';
                    const isPayment = meta?.type === 'payment';
                    return (
                    <div key={m.id} className={`rounded-lg border p-3 ${m.role === 'user' ? 'border-primary/30 bg-primary/5' : m.role === 'assistant' ? 'border-border bg-card' : 'border-border/50 bg-muted/30'}`}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${m.role === 'user' ? 'text-primary' : m.role === 'assistant' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {m.role}
                          </span>
                          {isInput && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">ask_user</span>}
                          {isConfirm && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-medium text-orange-400">confirm</span>}
                          {isPayment && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">payment</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{m.content}</p>
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Steps */}
              {detailTab === 'steps' && (
                <div className="space-y-2">
                  {data.steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No steps recorded</p>
                  ) : data.steps.map((s) => {
                    const stepStatusColor: Record<string, string> = {
                      completed: 'text-green-400',
                      running: 'text-blue-400',
                      failed: 'text-red-400',
                      pending: 'text-muted-foreground',
                    };
                    const dur = s.startedAt && s.completedAt
                      ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
                      : null;
                    return (
                      <div key={s.id} className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">{s.stepNumber}</span>
                            <span className="text-xs font-medium">{s.action}</span>
                            <span className={`text-[10px] ${stepStatusColor[s.status] || 'text-muted-foreground'}`}>● {s.status}</span>
                          </div>
                          {dur !== null && <span className="text-[10px] text-muted-foreground">{formatDuration(dur)}</span>}
                        </div>
                        {s.toolCalls && (
                          <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted/50 p-2 text-[10px] leading-relaxed text-muted-foreground">{
                            (() => { try { return JSON.stringify(JSON.parse(s.toolCalls), null, 2); } catch { return s.toolCalls; } })()
                          }</pre>
                        )}
                        {s.result && (
                          <p className="mt-1 truncate text-[10px] text-muted-foreground" title={s.result}>→ {s.result.slice(0, 200)}</p>
                        )}
                        {s.error && (
                          <p className="mt-1 text-[10px] text-red-400">✗ {s.error}</p>
                        )}
                        {s.inputNeeded && (
                          <div className="mt-1 text-[10px]">
                            <span className="text-amber-400">? {s.inputNeeded}</span>
                            {s.userInput && <span className="ml-2 text-green-400">→ {s.userInput}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Telemetry */}
              {detailTab === 'telemetry' && (
                <div className="space-y-1">
                  {data.telemetry.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No telemetry events</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Time</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Event</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cat</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Duration</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.telemetry.map((e) => {
                            let meta: Record<string, unknown> = {};
                            try { if (e.metadata) meta = JSON.parse(e.metadata); } catch {}
                            const detail = meta.tool || meta.error || meta.skillName || meta.message || '';
                            return (
                              <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                                <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</td>
                                <td className="px-3 py-1.5 font-medium">{e.event}</td>
                                <td className="px-3 py-1.5 text-muted-foreground">{e.category}</td>
                                <td className="px-3 py-1.5">
                                  <span className={`rounded px-1 py-0.5 text-[10px] ${e.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {e.success ? 'ok' : 'fail'}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-muted-foreground">{e.durationMs ? formatDuration(e.durationMs) : '-'}</td>
                                <td className="max-w-[200px] truncate px-3 py-1.5 text-muted-foreground" title={String(detail)}>{String(detail).slice(0, 80) || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Payments */}
              {detailTab === 'payments' && (
                <div className="space-y-3">
                  {data.payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payments for this task</p>
                  ) : data.payments.map((p) => (
                    <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {p.currency === 'INR' ? '₹' : p.currency} {(p.totalCents / 100).toFixed(2)}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-xs ${p.status === 'captured' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.bookingSummary}</p>
                      <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                        <span>Created: {new Date(p.createdAt).toLocaleString()}</span>
                        {p.paidAt && <span>Paid: {new Date(p.paidAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [hours, setHours] = useState<TimeRange>('24');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [llm, setLlm] = useState<LLMData | null>(null);
  const [tools, setTools] = useState<ToolData[]>([]);
  const [relay, setRelay] = useState<RelayData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [chrome, setChrome] = useState<ChromeData | null>(null);
  const [latency, setLatency] = useState<LatencyData | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const fetchView = async (view: string) => {
        const res = await fetch(`/api/admin/telemetry?view=${view}&hours=${hours}`);
        if (!res.ok) {
          if (res.status === 403) throw new Error('Access denied. Admin privileges required.');
          throw new Error(`API error (${res.status})`);
        }
        return res.json();
      };

      if (tab === 'overview') {
        const [overviewData, timelineData] = await Promise.all([
          fetchView('overview'),
          fetchView('timeline'),
        ]);
        setOverview(overviewData);
        setTimeline(timelineData);
      } else if (tab === 'errors') {
        setErrors(await fetchView('errors'));
      } else if (tab === 'llm') {
        setLlm(await fetchView('llm'));
      } else if (tab === 'tools') {
        setTools(await fetchView('tools'));
      } else if (tab === 'relay') {
        setRelay(await fetchView('relay'));
      } else if (tab === 'users') {
        setUsers(await fetchView('users'));
      } else if (tab === 'chrome') {
        setChrome(await fetchView('chrome'));
      } else if (tab === 'latency') {
        setLatency(await fetchView('latency'));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch telemetry';
      setApiError(msg);
      console.error('Failed to fetch telemetry', e);
    }
    setLoading(false);
  }, [tab, hours]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'latency', label: '⏱ Latency' },
    { key: 'chrome', label: 'Chrome Sessions' },
    { key: 'llm', label: 'LLM Usage' },
    { key: 'tools', label: 'Tool Calls' },
    { key: 'relay', label: 'Relay' },
    { key: 'errors', label: 'Errors' },
    { key: 'users', label: 'Users' },
  ];

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: '1', label: '1h' },
    { key: '6', label: '6h' },
    { key: '24', label: '24h' },
    { key: '72', label: '3d' },
    { key: '168', label: '7d' },
  ];

  return (
    <>
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Telemetry Dashboard</h1>
          <p className="text-xs text-muted-foreground">Real-time system observability</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex rounded-lg border border-border">
            {timeRanges.map((t) => (
              <button
                key={t.key}
                onClick={() => setHours(t.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  hours === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button
            onClick={fetchData}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            title="Refresh"
          >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border px-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {apiError ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-400">{apiError}</p>
            <button onClick={fetchData} className="mt-2 rounded-lg bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:bg-primary/90">Retry</button>
          </div>
        ) : loading && !overview && !errors.length && !llm && !tools.length && !relay && !users && !chrome ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && overview && (
              <div className="space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  <StatCard label="Total Events" value={formatNumber(overview.totalEvents)} />
                  <StatCard label="Tasks" value={overview.totalTasks} sub={`${overview.completedTasks} done, ${overview.failedTasks} failed`} />
                  <StatCard label="Success Rate" value={`${overview.taskSuccessRate}%`} color={parseFloat(overview.taskSuccessRate) >= 80 ? 'text-green-400' : 'text-red-400'} />
                  <StatCard label="Avg Task Time" value={formatDuration(overview.avgTaskDurationMs)} />
                  <StatCard label="Errors" value={overview.totalErrors} sub={`${overview.errorRate}% of events`} color={overview.totalErrors > 0 ? 'text-red-400' : 'text-green-400'} />
                  <StatCard label="LLM Calls" value={formatNumber(overview.totalLLMCalls)} />
                  <StatCard label="Tool Calls" value={formatNumber(overview.totalToolCalls)} />
                  <StatCard label="Payments" value={overview.totalPayments} />
                  <StatCard label="Users" value={overview.totalUsers} />
                </div>

                {/* Timeline */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-4 text-sm font-semibold">Event Timeline</h3>
                  <div className="pb-6">
                    <TimelineChart data={timeline} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-primary/60" /> Success</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-red-500/80" /> Errors</span>
                  </div>
                </div>
              </div>
            )}

            {/* ERRORS TAB */}
            {tab === 'errors' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{errors.length} Errors (last {hours}h)</h3>
                {errors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No errors in this period</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Time</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Event</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Category</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((e) => {
                          let meta: Record<string, unknown> = {};
                          try { if (e.metadata) meta = JSON.parse(e.metadata); } catch {}
                          return (
                            <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                              <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                                {new Date(e.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-2">
                                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">{e.event}</span>
                              </td>
                              <td className="px-4 py-2 text-xs">{e.category}</td>
                              <td className="max-w-md truncate px-4 py-2 text-xs text-muted-foreground">
                                {meta.error ? String(meta.error) : JSON.stringify(meta).slice(0, 150)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* LLM TAB */}
            {tab === 'llm' && llm && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="LLM Calls" value={llm.totalCalls} />
                  <StatCard label="Total Tokens" value={formatNumber(llm.totalTokens)} sub={`${formatNumber(llm.totalInputTokens)} in / ${formatNumber(llm.totalOutputTokens)} out`} />
                  <StatCard label="Avg Latency" value={formatDuration(llm.avgLatencyMs)} />
                  <StatCard
                    label="Est. Cost"
                    value={`$${((llm.totalInputTokens * 0.005 + llm.totalOutputTokens * 0.015) / 1000).toFixed(2)}`}
                    sub="Based on GPT-4o pricing"
                  />
                </div>

                {/* Recent LLM calls */}
                <div className="rounded-xl border border-border">
                  <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Recent LLM Calls</h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Latency</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Tokens In</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Tokens Out</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Iter</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Skill</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Stop</th>
                        </tr>
                      </thead>
                      <tbody>
                        {llm.recentCalls.map((c) => (
                          <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                              {new Date(c.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 text-xs">{c.durationMs ? formatDuration(c.durationMs) : '-'}</td>
                            <td className="px-4 py-2 text-xs">{c.inputTokens?.toLocaleString() || '-'}</td>
                            <td className="px-4 py-2 text-xs">{c.outputTokens?.toLocaleString() || '-'}</td>
                            <td className="px-4 py-2 text-xs">{c.iteration || '-'}</td>
                            <td className="px-4 py-2 text-xs">{c.skillName || '-'}</td>
                            <td className="px-4 py-2 text-xs">
                              <span className={`rounded px-1.5 py-0.5 ${c.stopReason === 'tool_use' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                {c.stopReason || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TOOLS TAB */}
            {tab === 'tools' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold">Tool Usage Breakdown</h3>
                {tools.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tool calls in this period</p>
                ) : (
                  <div className="space-y-3">
                    {tools.map((t) => {
                      const maxCount = Math.max(...tools.map((x) => x.count), 1);
                      return (
                        <div key={t.tool} className="rounded-xl border border-border bg-card p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <span className="font-medium">{t.tool || 'unknown'}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{t.count} calls</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Avg: {formatDuration(t.avgMs)}</span>
                              {t.errors > 0 && <span className="text-red-400">{t.errors} errors</span>}
                            </div>
                          </div>
                          <MiniBar value={t.count} max={maxCount} color={t.errors > 0 ? 'bg-amber-500' : 'bg-primary'} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RELAY TAB */}
            {tab === 'relay' && relay && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="Avg Latency" value={formatDuration(relay.avgRelayLatencyMs)} />
                  <StatCard label="Connections" value={relay.connections} color="text-green-400" />
                  <StatCard label="Disconnections" value={relay.disconnections} color={relay.disconnections > 0 ? 'text-amber-400' : 'text-green-400'} />
                  <StatCard label="Errors" value={relay.errors} color={relay.errors > 0 ? 'text-red-400' : 'text-green-400'} />
                </div>

                <div className="rounded-xl border border-border">
                  <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Recent Relay Events</h3>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Event</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Latency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relay.events.map((e) => (
                          <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                              {new Date(e.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 text-xs">{e.event}</td>
                            <td className="px-4 py-2">
                              <span className={`rounded px-1.5 py-0.5 text-xs ${e.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {e.success ? 'ok' : 'fail'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs">{e.durationMs ? formatDuration(e.durationMs) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && users && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {users.summary.map((s) => (
                    <StatCard key={s.event} label={s.event.replace(/_/g, ' ')} value={s.count} />
                  ))}
                </div>

                <div className="rounded-xl border border-border">
                  <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Recent Logins</h3>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Provider</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.recentLogins.map((l, i) => {
                          let provider = 'unknown';
                          try { if (l.metadata) provider = JSON.parse(l.metadata).provider || 'unknown'; } catch {}
                          return (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                              <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                                {new Date(l.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-xs font-mono">{l.userId?.slice(0, 12) || '-'}</td>
                              <td className="px-4 py-2 text-xs">{provider}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* LATENCY TAB */}
            {tab === 'latency' && latency && (
              <div className="space-y-6">
                {/* Overall stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  <StatCard label="Tasks Tracked" value={latency.overall.count} sub={`${latency.overall.successCount} ok / ${latency.overall.failCount} fail`} />
                  <StatCard label="Avg E2E Latency" value={latency.overall.count > 0 ? formatDuration(latency.overall.avgMs) : '-'} sub={latency.overall.count > 0 ? `p50: ${formatDuration(latency.overall.p50Ms)}` : ''} />
                  <StatCard label="P95 E2E Latency" value={latency.overall.count > 0 ? formatDuration(latency.overall.p95Ms) : '-'} sub={latency.overall.count > 0 ? `max: ${formatDuration(latency.overall.maxMs)}` : ''} color={latency.overall.p95Ms > 60000 ? 'text-amber-400' : 'text-foreground'} />
                  <StatCard label="TTFM (Avg)" value={latency.ttfm.count > 0 ? formatDuration(latency.ttfm.avgMs) : '-'} sub={latency.ttfm.count > 0 ? `p95: ${formatDuration(latency.ttfm.p95Ms)}` : 'Time to first message'} color={latency.ttfm.avgMs > 5000 ? 'text-amber-400' : 'text-green-400'} />
                  <StatCard label="TTFM (P50)" value={latency.ttfm.count > 0 ? formatDuration(latency.ttfm.p50Ms) : '-'} sub={latency.ttfm.count > 0 ? `max: ${formatDuration(latency.ttfm.maxMs)}` : ''} />
                </div>

                {/* Phase breakdown */}
                {latency.phases.length > 0 && (
                  <div className="rounded-xl border border-border">
                    <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">
                      Phase Breakdown
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Phase</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Count</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Avg</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">P50</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">P95</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Max</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Distribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latency.phases.map((p) => {
                            const maxP95 = Math.max(...latency.phases.map((ph) => ph.p95Ms), 1);
                            const phaseColors: Record<string, string> = {
                              auth: 'bg-slate-500',
                              task_setup: 'bg-blue-500',
                              skill_match: 'bg-violet-500',
                              llm_chat: 'bg-amber-500',
                              handoff_setup: 'bg-orange-500',
                              browser_execution: 'bg-green-500',
                              user_input_wait: 'bg-pink-500',
                            };
                            return (
                              <tr key={p.phase} className="border-b border-border/50 hover:bg-muted/20">
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${phaseColors[p.phase] || 'bg-primary'}`} />
                                    <span className="font-mono text-xs font-medium">{p.phase}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right text-xs text-muted-foreground">{p.count}</td>
                                <td className="px-4 py-2 text-right text-xs font-medium">{formatDuration(p.avgMs)}</td>
                                <td className="px-4 py-2 text-right text-xs text-muted-foreground">{formatDuration(p.p50Ms)}</td>
                                <td className="px-4 py-2 text-right text-xs text-muted-foreground">{formatDuration(p.p95Ms)}</td>
                                <td className="px-4 py-2 text-right text-xs text-muted-foreground">{formatDuration(p.maxMs)}</td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <MiniBar value={p.p95Ms} max={maxP95} color={phaseColors[p.phase] || 'bg-primary'} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent task latencies */}
                <div className="rounded-xl border border-border">
                  <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">
                    Recent Task Latencies ({latency.recentTasks.length})
                  </h3>
                  {latency.recentTasks.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No latency data yet. Run a task to start tracking.
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card">
                          <tr className="border-b border-border">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Task ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Skill</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Via</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">TTFM</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Phases</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latency.recentTasks.map((t) => (
                            <tr key={t.taskId} className="cursor-pointer border-b border-border/50 hover:bg-muted/30" onClick={() => t.taskId && setSelectedTaskId(t.taskId)}>
                              <td className="px-4 py-2">
                                <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                  {t.taskId?.slice(0, 8) || '-'}
                                </code>
                              </td>
                              <td className="px-4 py-2">
                                {t.skillName ? (
                                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">{t.skillName}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs text-muted-foreground">{t.completedVia || '-'}</td>
                              <td className="px-4 py-2 text-right text-xs font-medium">{t.totalMs ? formatDuration(t.totalMs) : '-'}</td>
                              <td className="px-4 py-2 text-right text-xs text-muted-foreground">{t.ttfmMs ? formatDuration(t.ttfmMs) : '-'}</td>
                              <td className="px-4 py-2">
                                <span className={`rounded px-1.5 py-0.5 text-[10px] ${t.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {t.success ? 'ok' : 'fail'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-xs text-muted-foreground">{t.phaseCount}</td>
                              <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                                {new Date(t.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHROME SESSIONS TAB */}
            {tab === 'chrome' && chrome && (
              <div className="space-y-6">
                {/* Live status header */}
                {chrome.live ? (
                  <>
                    {/* Chrome Pool capacity */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                      <StatCard label="Max Slots" value={chrome.live.chromePool.maxSlots} />
                      <StatCard label="Active" value={chrome.live.chromePool.active} />
                      <StatCard label="Ready" value={chrome.live.chromePool.ready} color="text-green-400" />
                      <StatCard label="Busy" value={chrome.live.chromePool.busy} color={chrome.live.chromePool.busy > 0 ? 'text-amber-400' : 'text-foreground'} />
                      <StatCard label="Errors" value={chrome.live.chromePool.error} color={chrome.live.chromePool.error > 0 ? 'text-red-400' : 'text-green-400'} />
                      <StatCard label="Queued" value={chrome.live.chromePool.queueLength} color={chrome.live.chromePool.queueLength > 0 ? 'text-red-400' : 'text-foreground'} />
                    </div>

                    {/* Live running tasks */}
                    <div className="rounded-xl border border-border bg-card">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold">
                          Live Tasks ({chrome.live.tasks.length})
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          Updated {new Date(chrome.live.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {chrome.live.tasks.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                          No active tasks — Chrome pool idle
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {chrome.live.tasks.map((t) => {
                            const elapsed = Date.now() - t.startedAt;
                            const statusColor: Record<string, string> = {
                              starting: 'bg-blue-500/20 text-blue-400',
                              running: 'bg-green-500/20 text-green-400',
                              complete: 'bg-emerald-500/20 text-emerald-400',
                              error: 'bg-red-500/20 text-red-400',
                            };
                            return (
                              <div key={t.taskId} className="flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-muted/30" onClick={() => setSelectedTaskId(t.taskId)}>
                                {/* Status dot */}
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${statusColor[t.status] || 'bg-muted'}`}>
                                  {t.status === 'running' ? (
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                  ) : t.status === 'starting' ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
                                  ) : (
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                  )}
                                </div>

                                {/* Task info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium">
                                      {t.description || 'Task ' + t.taskId.slice(0, 8)}
                                    </span>
                                    {t.skill && (
                                      <span className="shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        {t.skill}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="font-mono">{t.userId.slice(0, 12)}…</span>
                                    <span>•</span>
                                    <span>{formatDuration(elapsed)}</span>
                                    <span>•</span>
                                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${statusColor[t.status] || ''}`}>
                                      {t.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Task ID */}
                                <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground md:block">
                                  {t.taskId.slice(0, 12)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                    <svg className="mx-auto h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-muted-foreground">Laptop relay not connected</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Live Chrome data requires the laptop relay to be running</p>
                  </div>
                )}

                {/* Historical tasks */}
                <div className="rounded-xl border border-border">
                  <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">
                    Recent Tasks ({chrome.totalTasks})
                  </h3>
                  {chrome.recentTasks.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No tasks in this period</div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card">
                          <tr className="border-b border-border">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">User</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Task</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Skill</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Duration</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chrome.recentTasks.map((t) => {
                            const taskStatusColor: Record<string, string> = {
                              completed: 'bg-green-500/20 text-green-400',
                              running: 'bg-blue-500/20 text-blue-400',
                              failed: 'bg-red-500/20 text-red-400',
                              pending: 'bg-muted text-muted-foreground',
                            };
                            return (
                              <tr key={t.taskId} className="cursor-pointer border-b border-border/50 hover:bg-muted/30" onClick={() => setSelectedTaskId(t.taskId)}>
                                <td className="px-4 py-2">
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{t.taskId.slice(0, 8)}</code>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">{t.userName || 'Unknown'}</span>
                                    <span className="text-[10px] text-muted-foreground">{t.userEmail || '-'}</span>
                                  </div>
                                </td>
                                <td className="max-w-[200px] truncate px-4 py-2 text-xs" title={t.description || ''}>
                                  {t.description || '-'}
                                </td>
                                <td className="px-4 py-2">
                                  {t.skill ? (
                                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">{t.skill}</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${taskStatusColor[t.status] || 'bg-muted text-muted-foreground'}`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-xs text-muted-foreground">
                                  {t.durationMs ? formatDuration(t.durationMs) : t.status === 'running' ? '⏳' : '-'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                                  {new Date(t.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Task detail slide-over */}
    {selectedTaskId && (
      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    )}
  </>
  );
}
