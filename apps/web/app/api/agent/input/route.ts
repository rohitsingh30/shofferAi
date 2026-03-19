import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { workflowEngine } from '@/lib/singletons';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId, stepId, value } = await request.json();
  console.log('[input] taskId=%s stepId=%s value=%s user=%s', taskId, stepId, typeof value === 'string' ? value.slice(0, 50) : value, authUser.userId);

  if (!taskId || !stepId || value === undefined) {
    return NextResponse.json(
      { error: 'taskId, stepId, and value are required' },
      { status: 400 }
    );
  }

  // Verify the task belongs to this user
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: authUser.userId },
  });

  if (!task) {
    console.warn('[input] taskId=%s not found for user=%s', taskId, authUser.userId);
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const pauseManager = workflowEngine.getPauseManager();
  const success = pauseManager.provideInput(taskId, stepId, value);

  if (!success) {
    console.warn('[input] taskId=%s no pending input request found', taskId);
    return NextResponse.json(
      { error: 'No pending input request found' },
      { status: 404 }
    );
  }

  console.log('[input] taskId=%s input delivered OK', taskId);
  return NextResponse.json({ success: true });
}
