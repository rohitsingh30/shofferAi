import { NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/singletons';
import { getAuthUser } from '@/lib/auth-helper';

/**
 * POST /api/agent/cancel
 *
 * Cancel a running task. After the migration to the Browser Operations
 * Service the cancel path is much simpler: there's no laptop process to
 * kill — we just mark the task failed in the DB. The active SSE stream
 * detects the abort via request.signal and closes its session via
 * BrowserOpsHost.closeSession().
 */
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let taskId: string | undefined;
  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    taskId = body.taskId;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  console.log('[cancel] taskId=%s user=%s explicit cancel', taskId, user.userId);

  try {
    await workflowEngine.updateTaskStatus(taskId, 'failed');
  } catch {
    // Task may not exist in DB yet — fine
  }

  return NextResponse.json({ ok: true });
}
