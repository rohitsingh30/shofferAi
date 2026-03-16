import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockProvideInput = vi.fn();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/singletons', () => ({
  workflowEngine: {
    getPauseManager: () => ({
      provideInput: mockProvideInput,
    }),
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/agent/input', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/agent/input', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await POST(makeRequest({ taskId: 't1', stepId: 's1', value: 'v' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const res = await POST(makeRequest({ taskId: 't1' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when task not found for user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.task.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest({ taskId: 't1', stepId: 's1', value: 'v' }));
    expect(res.status).toBe(404);
  });

  it('returns 404 when no pending input', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.task.findFirst).mockResolvedValue({ id: 't1' } as any);
    mockProvideInput.mockReturnValue(false);

    const res = await POST(makeRequest({ taskId: 't1', stepId: 's1', value: 'v' }));
    expect(res.status).toBe(404);
  });

  it('returns success when input provided', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.task.findFirst).mockResolvedValue({ id: 't1' } as any);
    mockProvideInput.mockReturnValue(true);

    const res = await POST(makeRequest({ taskId: 't1', stepId: 's1', value: '123456' }));
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockProvideInput).toHaveBeenCalledWith('t1', 's1', '123456');
  });
});
