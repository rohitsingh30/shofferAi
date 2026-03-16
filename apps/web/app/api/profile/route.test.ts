import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from './route';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function makeRequest(body?: object): Request {
  return new Request('http://localhost/api/profile', {
    method: body ? 'PUT' : 'GET',
    ...(body && { body: JSON.stringify(body) }),
  });
}

describe('GET /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 404 when profile not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns profile with parsed JSON fields', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      userId: 'u1',
      phone: '+91999',
      addresses: JSON.stringify([{ city: 'Mumbai' }]),
      preferences: JSON.stringify({ language: 'en' }),
    } as any);

    const res = await GET();
    const body = await res.json();
    expect(body.addresses).toEqual([{ city: 'Mumbai' }]);
    expect(body.preferences).toEqual({ language: 'en' });
  });
});

describe('PUT /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await PUT(makeRequest({ phone: '+91999' }));
    expect(res.status).toBe(401);
  });

  it('upserts profile with serialized JSON fields', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.profile.upsert).mockResolvedValue({
      userId: 'u1',
      phone: '+91999',
      addresses: JSON.stringify([]),
      preferences: JSON.stringify({}),
    } as any);

    const res = await PUT(makeRequest({ phone: '+91999', addresses: [], preferences: {} }));
    expect(res.status).toBe(200);

    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
      })
    );
  });
});
