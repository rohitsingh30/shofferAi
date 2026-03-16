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

  return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
}
