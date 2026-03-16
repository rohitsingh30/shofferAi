import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async () => 'hashed_password'),
  },
}));

import { prisma } from '@/lib/prisma';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'longpassword' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });

  it('returns 400 when password < 8 chars', async () => {
    const res = await POST(makeRequest({ email: 'test@test.com', password: 'short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('8 characters');
  });

  it('returns 409 when email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing' } as any);

    const res = await POST(makeRequest({ email: 'taken@test.com', password: 'longpassword' }));
    expect(res.status).toBe(409);
  });

  it('returns 201 with user id on success', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user-1',
      email: 'new@test.com',
    } as any);

    const res = await POST(makeRequest({
      name: 'Test',
      email: 'new@test.com',
      password: 'longpassword',
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('new-user-1');
    expect(body.email).toBe('new@test.com');
  });

  it('hashes password with bcrypt before storing', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as any);

    await POST(makeRequest({ email: 'a@b.com', password: 'mypassword' }));

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: 'hashed_password' }),
      })
    );
  });

  it('creates profile along with user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'u1', email: 'a@b.com' } as any);

    await POST(makeRequest({ email: 'a@b.com', password: 'longpassword' }));

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          profile: { create: {} },
        }),
      })
    );
  });

  it('returns 500 on unexpected error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST(makeRequest({ email: 'a@b.com', password: 'longpassword' }));
    expect(res.status).toBe(500);
  });
});
