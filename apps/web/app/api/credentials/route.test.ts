import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth-helper', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// vi.hoisted ensures these are available when the mock factory runs
const mockVault = vi.hoisted(() => ({
  list: vi.fn(),
  store: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/credential-vault', () => ({
  CredentialVault: class {
    list = mockVault.list;
    store = mockVault.store;
    delete = mockVault.delete;
  },
}));

import { GET, POST, DELETE } from './route';
import { getAuthUser } from '@/lib/auth-helper';

function loginAs(userId: string) {
  vi.mocked(getAuthUser).mockResolvedValue({ userId, name: 'Test', email: 'test@test.com' });
}

describe('GET /api/credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await GET(new Request('http://localhost/api/credentials'));
    expect(res.status).toBe(401);
  });

  it('returns credential list for user', async () => {
    loginAs('u1');
    mockVault.list.mockResolvedValue([{ id: 'c1', type: 'card', label: 'Visa' }]);

    const res = await GET(new Request('http://localhost/api/credentials'));
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].label).toBe('Visa');
  });

  it('lists credentials scoped to authenticated userId', async () => {
    loginAs('user-abc');
    mockVault.list.mockResolvedValue([]);

    await GET(new Request('http://localhost/api/credentials'));
    expect(mockVault.list).toHaveBeenCalledWith('user-abc');
  });
});

describe('POST /api/credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const req = new Request('http://localhost/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ type: 'card', label: 'Test', data: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    loginAs('u1');
    const req = new Request('http://localhost/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ type: 'card' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 with credential ID on success', async () => {
    loginAs('u1');
    mockVault.store.mockResolvedValue('cred-new');

    const req = new Request('http://localhost/api/credentials', {
      method: 'POST',
      body: JSON.stringify({
        type: 'card',
        label: 'My Card',
        data: { cardNumber: '4111' },
        lastFour: '4111',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('cred-new');
  });
});

describe('DELETE /api/credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const req = new Request('http://localhost/api/credentials?id=c1', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when id missing', async () => {
    loginAs('u1');
    const req = new Request('http://localhost/api/credentials', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('returns success on delete', async () => {
    loginAs('u1');
    mockVault.delete.mockResolvedValue(undefined);

    const req = new Request('http://localhost/api/credentials?id=c1', { method: 'DELETE' });
    const res = await DELETE(req);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
