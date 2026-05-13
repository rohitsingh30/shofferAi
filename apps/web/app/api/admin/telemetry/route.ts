import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'rsinghtomar3011@gmail.com,demo@shofferai.com').split(',');

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return null;
  }
  return session;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'overview';
  const hours = parseInt(url.searchParams.get('hours') || '24', 10);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  if (view === 'overview') {
    const [
      totalEvents,
      totalErrors,
      totalTasks,
      completedTasks,
      failedTasks,
      totalUsers,
      totalPayments,
      avgTaskDuration,
      totalLLMCalls,
      totalToolCalls,
    ] = await Promise.all([
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since } } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, success: false } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'task_created' } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'task_execution', success: true } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'task_execution', success: false } }),
      prisma.user.count(),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'payment_verified' } }),
      prisma.telemetryEvent.aggregate({ where: { timestamp: { gte: since }, event: 'task_execution', durationMs: { not: null } }, _avg: { durationMs: true } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'llm_call' } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: since }, event: 'tool_call' } }),
    ]);

    return NextResponse.json({
      totalEvents,
      totalErrors,
      errorRate: totalEvents > 0 ? ((totalErrors / totalEvents) * 100).toFixed(1) : '0',
      totalTasks,
      completedTasks,
      failedTasks,
      taskSuccessRate: totalTasks > 0 ? (((completedTasks) / (completedTasks + failedTasks || 1)) * 100).toFixed(1) : '0',
      totalUsers,
      totalPayments,
      avgTaskDurationMs: Math.round(avgTaskDuration._avg.durationMs || 0),
      totalLLMCalls,
      totalToolCalls,
      hours,
    });
  }

  if (view === 'timeline') {
    // Get event counts grouped by hour
    const events = await prisma.$queryRaw<Array<{ hour: string; count: bigint; errors: bigint }>>`
      SELECT
        date_trunc('hour', timestamp) as hour,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE success = false) as errors
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since}
      GROUP BY hour
      ORDER BY hour ASC
    `;
    return NextResponse.json(
      events.map((e) => ({
        hour: e.hour,
        count: Number(e.count),
        errors: Number(e.errors),
      }))
    );
  }

  if (view === 'errors') {
    const errors = await prisma.telemetryEvent.findMany({
      where: { timestamp: { gte: since }, success: false },
      orderBy: { timestamp: 'desc' },
      take: 100,
      select: {
        id: true,
        timestamp: true,
        event: true,
        category: true,
        userId: true,
        taskId: true,
        metadata: true,
      },
    });
    return NextResponse.json(errors);
  }

  if (view === 'llm') {
    const llmEvents = await prisma.telemetryEvent.findMany({
      where: { timestamp: { gte: since }, event: 'llm_call' },
      orderBy: { timestamp: 'desc' },
      take: 200,
      select: {
        id: true,
        timestamp: true,
        durationMs: true,
        metadata: true,
        taskId: true,
      },
    });

    // Aggregate token usage
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalDuration = 0;
    let count = 0;

    for (const e of llmEvents) {
      if (e.metadata) {
        try {
          const meta = JSON.parse(e.metadata);
          totalInputTokens += meta.inputTokens || 0;
          totalOutputTokens += meta.outputTokens || 0;
        } catch {}
      }
      if (e.durationMs) {
        totalDuration += e.durationMs;
        count++;
      }
    }

    return NextResponse.json({
      totalCalls: llmEvents.length,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      avgLatencyMs: count > 0 ? Math.round(totalDuration / count) : 0,
      recentCalls: llmEvents.slice(0, 50).map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        durationMs: e.durationMs,
        taskId: e.taskId,
        ...(e.metadata ? JSON.parse(e.metadata) : {}),
      })),
    });
  }

  if (view === 'tools') {
    const toolEvents = await prisma.$queryRaw<Array<{ tool: string; count: bigint; errors: bigint; avg_ms: number }>>`
      SELECT
        metadata::jsonb->>'tool' as tool,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE success = false) as errors,
        AVG("durationMs") as avg_ms
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since} AND event = 'tool_call' AND metadata IS NOT NULL
      GROUP BY tool
      ORDER BY count DESC
    `;
    return NextResponse.json(
      toolEvents.map((e) => ({
        tool: e.tool,
        count: Number(e.count),
        errors: Number(e.errors),
        avgMs: Math.round(e.avg_ms || 0),
      }))
    );
  }

  if (view === 'relay') {
    const relayEvents = await prisma.telemetryEvent.findMany({
      where: { timestamp: { gte: since }, category: 'relay' },
      orderBy: { timestamp: 'desc' },
      take: 100,
      select: {
        id: true,
        timestamp: true,
        event: true,
        success: true,
        durationMs: true,
        metadata: true,
      },
    });

    const relayToolCalls = relayEvents.filter((e) => e.event === 'relay_tool_call');
    const avgRelayLatency = relayToolCalls.length > 0
      ? Math.round(relayToolCalls.reduce((sum, e) => sum + (e.durationMs || 0), 0) / relayToolCalls.length)
      : 0;

    return NextResponse.json({
      events: relayEvents,
      avgRelayLatencyMs: avgRelayLatency,
      connections: relayEvents.filter((e) => e.event === 'relay_connected').length,
      disconnections: relayEvents.filter((e) => e.event === 'relay_disconnected').length,
      errors: relayEvents.filter((e) => e.event === 'relay_error').length,
    });
  }

  if (view === 'users') {
    const userEvents = await prisma.$queryRaw<Array<{ event: string; count: bigint }>>`
      SELECT event, COUNT(*) as count
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since} AND category = 'auth'
      GROUP BY event
      ORDER BY count DESC
    `;
    const recentLogins = await prisma.telemetryEvent.findMany({
      where: { timestamp: { gte: since }, event: 'user_login' },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: { timestamp: true, userId: true, metadata: true },
    });
    return NextResponse.json({
      summary: userEvents.map((e) => ({ event: e.event, count: Number(e.count) })),
      recentLogins,
    });
  }

  if (view === 'chrome') {
    // Live status from browser-ops runner. The runner exposes /v1/health and a
    // bearer-protected /status endpoint; we surface a minimal connected/idle view here.
    let liveStatus: { connected: boolean; tasks?: unknown[] } | null = null;
    try {
      const { browserOpsClient } = await import('@/lib/singletons');
      liveStatus = { connected: browserOpsClient.isConnected() };
    } catch {
      liveStatus = null;
    }

    // Historical: recent task executions with user info
    const recentTasks = await prisma.task.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        description: true,
        status: true,
        workflowType: true,
        createdAt: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Task durations
    const taskDurations = recentTasks.map((t) => ({
      taskId: t.id,
      userEmail: t.user.email,
      userName: t.user.name,
      description: t.description?.slice(0, 200),
      status: t.status,
      skill: t.workflowType,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      durationMs: t.completedAt ? t.completedAt.getTime() - t.createdAt.getTime() : null,
    }));

    return NextResponse.json({
      live: liveStatus,
      recentTasks: taskDurations,
      totalTasks: recentTasks.length,
      activeTasks: liveStatus?.tasks?.length || 0,
    });
  }

  if (view === 'latency') {
    const taskId = url.searchParams.get('taskId');

    if (taskId) {
      // ─── Per-task waterfall ────────────────────────────────────────
      // Get the task_latency summary event + all task_phase events for this task
      const [latencyEvent, phaseEvents, taskInfo] = await Promise.all([
        prisma.telemetryEvent.findFirst({
          where: { taskId, event: 'task_latency' },
          select: { id: true, timestamp: true, durationMs: true, success: true, metadata: true },
        }),
        prisma.telemetryEvent.findMany({
          where: { taskId, event: 'task_phase' },
          orderBy: { timestamp: 'asc' },
          select: { id: true, timestamp: true, durationMs: true, success: true, metadata: true },
        }),
        prisma.task.findUnique({
          where: { id: taskId },
          select: { id: true, description: true, status: true, workflowType: true, createdAt: true, completedAt: true },
        }),
      ]);

      // Parse the summary event metadata for markers and phases
      let summary: Record<string, unknown> = {};
      if (latencyEvent?.metadata) {
        try { summary = JSON.parse(latencyEvent.metadata); } catch {}
      }

      const phases = phaseEvents.map((e) => {
        let meta: Record<string, unknown> = {};
        if (e.metadata) { try { meta = JSON.parse(e.metadata); } catch {} }
        return {
          phase: meta.phase as string || 'unknown',
          durationMs: e.durationMs,
          startMs: meta.startMs as number,
          endMs: meta.endMs as number,
          ...meta,
        };
      });

      return NextResponse.json({
        taskId,
        task: taskInfo,
        totalMs: latencyEvent?.durationMs || null,
        ttfmMs: summary.ttfmMs ?? null,
        success: latencyEvent?.success ?? null,
        phases,
        markers: summary.markers || [],
      });
    }

    // ─── Aggregate latency breakdown ───────────────────────────────
    // Get avg/p50/p95/max per phase across all tasks in the time window
    const phaseStats = await prisma.$queryRaw<Array<{
      phase: string;
      count: bigint;
      avg_ms: number;
      p50_ms: number;
      p95_ms: number;
      max_ms: number;
    }>>`
      SELECT
        metadata::jsonb->>'phase' as phase,
        COUNT(*) as count,
        AVG("durationMs") as avg_ms,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "durationMs") as p50_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "durationMs") as p95_ms,
        MAX("durationMs") as max_ms
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since}
        AND event = 'task_phase'
        AND "durationMs" IS NOT NULL
      GROUP BY phase
      ORDER BY avg_ms DESC
    `;

    // Get TTFM stats from task_latency events
    const ttfmStats = await prisma.$queryRaw<Array<{
      count: bigint;
      avg_ms: number;
      p50_ms: number;
      p95_ms: number;
      max_ms: number;
    }>>`
      SELECT
        COUNT(*) as count,
        AVG((metadata::jsonb->>'ttfmMs')::numeric) as avg_ms,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (metadata::jsonb->>'ttfmMs')::numeric) as p50_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata::jsonb->>'ttfmMs')::numeric) as p95_ms,
        MAX((metadata::jsonb->>'ttfmMs')::numeric) as max_ms
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since}
        AND event = 'task_latency'
        AND metadata::jsonb->>'ttfmMs' IS NOT NULL
        AND (metadata::jsonb->>'ttfmMs')::numeric > 0
    `;

    // Get overall task latency distribution
    const taskLatencyStats = await prisma.$queryRaw<Array<{
      count: bigint;
      avg_ms: number;
      p50_ms: number;
      p95_ms: number;
      max_ms: number;
      success_count: bigint;
      fail_count: bigint;
    }>>`
      SELECT
        COUNT(*) as count,
        AVG("durationMs") as avg_ms,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "durationMs") as p50_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "durationMs") as p95_ms,
        MAX("durationMs") as max_ms,
        COUNT(*) FILTER (WHERE success = true) as success_count,
        COUNT(*) FILTER (WHERE success = false) as fail_count
      FROM "TelemetryEvent"
      WHERE timestamp >= ${since}
        AND event = 'task_latency'
        AND "durationMs" IS NOT NULL
    `;

    // Recent task latencies for the table
    const recentLatencies = await prisma.telemetryEvent.findMany({
      where: { timestamp: { gte: since }, event: 'task_latency' },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: { id: true, timestamp: true, durationMs: true, success: true, taskId: true, metadata: true },
    });

    const ttfm = ttfmStats[0] || { count: 0n, avg_ms: 0, p50_ms: 0, p95_ms: 0, max_ms: 0 };
    const overall = taskLatencyStats[0] || { count: 0n, avg_ms: 0, p50_ms: 0, p95_ms: 0, max_ms: 0, success_count: 0n, fail_count: 0n };

    return NextResponse.json({
      phases: phaseStats.map((p) => ({
        phase: p.phase,
        count: Number(p.count),
        avgMs: Math.round(p.avg_ms || 0),
        p50Ms: Math.round(p.p50_ms || 0),
        p95Ms: Math.round(p.p95_ms || 0),
        maxMs: Math.round(p.max_ms || 0),
      })),
      ttfm: {
        count: Number(ttfm.count),
        avgMs: Math.round(ttfm.avg_ms || 0),
        p50Ms: Math.round(ttfm.p50_ms || 0),
        p95Ms: Math.round(ttfm.p95_ms || 0),
        maxMs: Math.round(ttfm.max_ms || 0),
      },
      overall: {
        count: Number(overall.count),
        avgMs: Math.round(overall.avg_ms || 0),
        p50Ms: Math.round(overall.p50_ms || 0),
        p95Ms: Math.round(overall.p95_ms || 0),
        maxMs: Math.round(overall.max_ms || 0),
        successCount: Number(overall.success_count),
        failCount: Number(overall.fail_count),
      },
      recentTasks: recentLatencies.map((e) => {
        let meta: Record<string, unknown> = {};
        if (e.metadata) { try { meta = JSON.parse(e.metadata); } catch {} }
        return {
          taskId: e.taskId,
          timestamp: e.timestamp,
          totalMs: e.durationMs,
          ttfmMs: meta.ttfmMs ?? null,
          success: e.success,
          skillName: meta.skillName || null,
          completedVia: meta.completedVia || null,
          phaseCount: meta.phaseCount || 0,
        };
      }),
      hours,
    });
  }

  if (view === 'task-detail') {
    const taskId = url.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 });
    }

    const [task, steps, messages, telemetry, payments] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          description: true,
          status: true,
          workflowType: true,
          result: true,
          createdAt: true,
          completedAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.taskStep.findMany({
        where: { taskId },
        orderBy: { stepNumber: 'asc' },
        select: {
          id: true,
          stepNumber: true,
          action: true,
          toolCalls: true,
          status: true,
          result: true,
          error: true,
          startedAt: true,
          completedAt: true,
          inputNeeded: true,
          userInput: true,
        },
      }),
      prisma.message.findMany({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.telemetryEvent.findMany({
        where: { taskId },
        orderBy: { timestamp: 'asc' },
        select: {
          id: true,
          timestamp: true,
          event: true,
          category: true,
          success: true,
          durationMs: true,
          metadata: true,
        },
      }),
      prisma.payment.findMany({
        where: { taskId },
        select: {
          id: true,
          status: true,
          amountCents: true,
          totalCents: true,
          currency: true,
          bookingSummary: true,
          createdAt: true,
          paidAt: true,
        },
      }),
    ]);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      task,
      steps,
      messages,
      telemetry,
      payments,
    });
  }

  return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
}
