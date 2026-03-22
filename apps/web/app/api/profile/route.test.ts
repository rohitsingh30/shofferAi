import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth-helper', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { GET, PUT } from './route';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

function makeRequest(body?: object): Request {
  return new Request('http://localhost/api/profile', {
    method: body ? 'PUT' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  });
}

// Helper to set authenticated user
function loginAs(userId: string) {
  vi.mocked(getAuthUser).mockResolvedValue({ userId, name: 'Test', email: 'test@test.com' });
}

describe('GET /api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 404 when profile not found', async () => {
    loginAs('u1');
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
  });

  it('returns profile with parsed JSON fields', async () => {
    loginAs('u1');
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      userId: 'u1',
      phone: '+91999',
      addresses: JSON.stringify([{ city: 'Mumbai' }]),
      preferences: JSON.stringify({ language: 'en' }),
    } as any);

    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.addresses).toEqual([{ city: 'Mumbai' }]);
    expect(body.preferences).toEqual({ language: 'en' });
  });

  it('queries profile by authenticated userId — never hardcoded', async () => {
    loginAs('user-xyz-123');
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);
    await GET(makeRequest());
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-xyz-123' },
    });
  });
});

describe('PUT /api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await PUT(makeRequest({ phone: '+91999' }));
    expect(res.status).toBe(401);
  });

  it('upserts profile with serialized JSON fields', async () => {
    loginAs('u1');
    vi.mocked(prisma.profile.upsert).mockResolvedValue({
      userId: 'u1', phone: '+91999',
      addresses: JSON.stringify([{ line1: '123 St' }]),
      preferences: JSON.stringify({}),
    } as any);

    const res = await PUT(makeRequest({ phone: '+91999', addresses: [{ line1: '123 St' }], preferences: {} }));
    expect(res.status).toBe(200);
    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    );
  });

  // ── SAFETY: cross-user contamination guards ──────────────────────

  it('upserts to the AUTHENTICATED user — not a stale/previous user', async () => {
    loginAs('new-google-user');
    vi.mocked(prisma.profile.upsert).mockResolvedValue({
      userId: 'new-google-user', phone: '+91111',
      addresses: '[]', preferences: '{}',
    } as any);

    await PUT(makeRequest({ phone: '+91111' }));
    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'new-google-user' },
        create: expect.objectContaining({ userId: 'new-google-user' }),
      }),
    );
  });

  it('does NOT touch addresses when addresses field is omitted (onboarding skip)', async () => {
    loginAs('u1');
    vi.mocked(prisma.profile.upsert).mockResolvedValue({
      userId: 'u1', phone: '+91999',
      addresses: JSON.stringify([{ city: 'Delhi' }]),
      preferences: '{}',
    } as any);

    // Onboarding sends ONLY phone, no addresses key at all
    await PUT(makeRequest({ phone: '+91999' }));

    const call = vi.mocked(prisma.profile.upsert).mock.calls[0][0] as any;
    // addresses should be undefined in update → Prisma leaves the column unchanged
    expect(call.update.addresses).toBeUndefined();
  });

  it('DOES clear addresses when explicitly sent as empty array (legitimate delete)', async () => {
    loginAs('u1');
    vi.mocked(prisma.profile.upsert).mockResolvedValue({
      userId: 'u1', phone: '+91999',
      addresses: '[]', preferences: '{}',
    } as any);

    await PUT(makeRequest({ addresses: [] }));

    const call = vi.mocked(prisma.profile.upsert).mock.calls[0][0] as any;
    expect(call.update.addresses).toBe('[]');
  });

  it('two different users get isolated profiles', async () => {
    const upsertMock = vi.mocked(prisma.profile.upsert);

    // User A saves address
    loginAs('user-a');
    upsertMock.mockResolvedValue({ userId: 'user-a', phone: '', addresses: '[]', preferences: '{}' } as any);
    await PUT(makeRequest({ addresses: [{ label: 'Home', line1: 'A street' }] }));

    // User B saves different address
    loginAs('user-b');
    upsertMock.mockResolvedValue({ userId: 'user-b', phone: '', addresses: '[]', preferences: '{}' } as any);
    await PUT(makeRequest({ addresses: [{ label: 'Work', line1: 'B street' }] }));

    // Verify each call used the correct userId
    expect(upsertMock).toHaveBeenCalledTimes(2);
    expect(upsertMock.mock.calls[0][0]).toEqual(expect.objectContaining({ where: { userId: 'user-a' } }));
    expect(upsertMock.mock.calls[1][0]).toEqual(expect.objectContaining({ where: { userId: 'user-b' } }));
  });
});
