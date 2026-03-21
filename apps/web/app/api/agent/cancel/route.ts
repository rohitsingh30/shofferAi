import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { remoteMcpHost, workflowEngine } from '@/lib/singletons';
import { getAuthUser } from '@/lib/auth-helper';
import type { TaskCancelMessage } from '@shofferai/shared';

/**
 * POST /api/agent/cancel
 * Explicitly cancel a running task — sends task_cancel to the laptop relay
 * so it can kill the Copilot CLI + Chrome immediately.
 *
 * Called by the frontend when user clicks "New Chat" or navigates away.
 * This is more reliable than relying on request.signal abort detection,
 * which doesn't fire on Cloud Run's HTTP/2 load balancer.
 */
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    console.warn('[cancel] auth failed — no session/token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body defensively — supports both fetch(JSON) and sendBeacon(Blob)
  let taskId: string | undefined;
  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    taskId = body.taskId;
  } catch (e) {
    console.warn('[cancel] body parse failed:', e);
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!taskId) {
    console.warn('[cancel] no taskId in body');
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  console.log('[cancel] taskId=%s user=%s explicit cancel request', taskId, user.userId);

  // Send task_cancel to laptop relay (best-effort)
  if (remoteMcpHost.isConnected()) {
    try {
      const cancelMsg: TaskCancelMessage = {
        id: randomUUID(),
        type: 'task_cancel',
        taskId,
        reason: 'user_cancelled',
      };
      remoteMcpHost.sendTaskMessage(cancelMsg);
      console.log('[cancel] taskId=%s sent task_cancel to laptop relay', taskId);
    } catch (e) {
      console.warn('[cancel] taskId=%s failed to send task_cancel:', taskId, e);
    }
  } else {
    console.warn('[cancel] taskId=%s relay not connected, cannot send task_cancel', taskId);
  }

  // Update task status in DB
  try {
    await workflowEngine.updateTaskStatus(taskId, 'failed');
  } catch {
    // Task may not exist in DB yet — that's OK
  }

  return NextResponse.json({ ok: true });
}
