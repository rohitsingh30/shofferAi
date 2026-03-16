import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

describe('GET /api/tasks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns tasks with steps for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.task.findMany).mockResolvedValue([
      { id: 't1', description: 'Book hotel', steps: [] },
    ] as any);

    const res = await GET();
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].description).toBe('Book hotel');
  });

  it('orders by createdAt desc with limit 50', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.task.findMany).mockResolvedValue([]);

    await GET();
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });
  });
});
