import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/telemetry', () => ({
  track: vi.fn(),
}));

vi.mock('jose', () => ({
  SignJWT: class {
    private payload: Record<string, unknown>;
    constructor(payload: Record<string, unknown>) { this.payload = payload; }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return 'mock-jwt-token'; }
  },
}));

import { POST } from './route';
import { prisma } from '@/lib/prisma';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/auth/google-mobile', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Mock global fetch for Google userinfo API
const originalFetch = global.fetch;

describe('POST /api/auth/google-mobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Google's userinfo endpoint
    global.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      if (urlStr.includes('googleapis.com/oauth2')) {
        return new Response(JSON.stringify({
          id: 'google-sub-123',
          email: 'NewUser@Gmail.COM',
          name: 'New User',
          picture: 'https://photo.url',
        }), { status: 200 });
      }
      return originalFetch(url as any);
    }) as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns 400 when access token missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('creates user with PROFILE for new Google user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-cuid', email: 'newuser@gmail.com', name: 'New User', image: 'https://photo.url',
    } as any);

    const res = await POST(makeRequest({ accessToken: 'valid-token' }));
    expect(res.status).toBe(200);

    // CRITICAL: user.create MUST include profile: { create: {} }
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          profile: { create: {} },
        }),
      }),
    );
  });

  it('lowercases email when looking up existing user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u1', email: 'newuser@gmail.com', name: 'New User', image: null,
    } as any);

    await POST(makeRequest({ accessToken: 'valid-token' }));

    // Google returns "NewUser@Gmail.COM" → lookup must use lowercase
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@gmail.com' },
    });
  });

  it('lowercases email when creating new user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u1', email: 'newuser@gmail.com', name: 'New User', image: null,
    } as any);

    await POST(makeRequest({ accessToken: 'valid-token' }));

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'newuser@gmail.com',
        }),
      }),
    );
  });

  it('returns JWT with the correct database userId — not Google sub', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'db-cuid-999', email: 'newuser@gmail.com', name: 'New User', image: null,
    } as any);

    const res = await POST(makeRequest({ accessToken: 'valid-token' }));
    const body = await res.json();

    // Token is mocked but user.id in response must be the DB cuid
    expect(body.user.id).toBe('db-cuid-999');
    expect(body.token).toBe('mock-jwt-token');
  });

  it('links Google account to existing user without creating duplicate', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user', email: 'newuser@gmail.com', name: 'Existing', image: null,
    } as any);
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null); // not yet linked
    vi.mocked(prisma.account.create).mockResolvedValue({} as any);

    const res = await POST(makeRequest({ accessToken: 'valid-token' }));
    const body = await res.json();

    // Must NOT create a new user — use existing
    expect(prisma.user.create).not.toHaveBeenCalled();
    // Must link the Google account
    expect(prisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'existing-user',
          provider: 'google',
        }),
      }),
    );
    // JWT must reference the EXISTING user
    expect(body.user.id).toBe('existing-user');
  });
});
