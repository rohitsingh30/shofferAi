import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    console.log('[tasks] GET user=%s count=%d', authUser.userId, tasks.length);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[tasks] GET user=%s ERROR:', authUser.userId, error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
