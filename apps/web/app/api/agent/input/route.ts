import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { workflowEngine } from '@/lib/singletons';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId, stepId, value } = await request.json();

  if (!taskId || !stepId || value === undefined) {
    return NextResponse.json(
      { error: 'taskId, stepId, and value are required' },
      { status: 400 }
    );
  }

  // Verify the task belongs to this user
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const pauseManager = workflowEngine.getPauseManager();
  const success = pauseManager.provideInput(taskId, stepId, value);

  if (!success) {
    return NextResponse.json(
      { error: 'No pending input request found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
