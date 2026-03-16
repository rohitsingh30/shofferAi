import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
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
import { auth } from '@/auth';

describe('GET /api/credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns credential list for user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    mockVault.list.mockResolvedValue([{ id: 'c1', type: 'card', label: 'Visa' }]);

    const res = await GET();
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].label).toBe('Visa');
  });
});

describe('POST /api/credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const req = new Request('http://localhost/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ type: 'card', label: 'Test', data: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const req = new Request('http://localhost/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ type: 'card' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 with credential ID on success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
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
    vi.mocked(auth).mockResolvedValue(null as any);
    const req = new Request('http://localhost/api/credentials?id=c1', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when id missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const req = new Request('http://localhost/api/credentials', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('returns success on delete', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    mockVault.delete.mockResolvedValue(undefined);

    const req = new Request('http://localhost/api/credentials?id=c1', { method: 'DELETE' });
    const res = await DELETE(req);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
