import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockOrdersCreate = vi.fn();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/razorpay', () => ({
  getRazorpay: () => ({
    orders: { create: mockOrdersCreate },
  }),
  RAZORPAY_KEY_ID: 'rzp_test_key',
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/payments/create-order', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await POST(makeRequest({ taskId: 't1', amountCents: 1000, bookingSummary: 'test' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const res = await POST(makeRequest({ taskId: 't1' }));
    expect(res.status).toBe(400);
  });

  it('creates Razorpay order with correct amount', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    mockOrdersCreate.mockResolvedValue({ id: 'order_123' });
    vi.mocked(prisma.payment.create).mockResolvedValue({} as any);

    const res = await POST(makeRequest({
      taskId: 't1',
      amountCents: 5000,
      serviceFeeCents: 500,
      bookingSummary: 'Hotel XYZ',
    }));

    const body = await res.json();
    expect(body.orderId).toBe('order_123');
    expect(body.amount).toBe(5500); // 5000 + 500
    expect(body.currency).toBe('INR');
    expect(body.key).toBe('rzp_test_key');

    expect(mockOrdersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5500,
        currency: 'INR',
      })
    );
  });

  it('creates Payment DB record', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    mockOrdersCreate.mockResolvedValue({ id: 'order_456' });
    vi.mocked(prisma.payment.create).mockResolvedValue({} as any);

    await POST(makeRequest({
      taskId: 't1',
      amountCents: 3000,
      bookingSummary: 'Test booking',
    }));

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 't1',
        userId: 'u1',
        status: 'pending',
        amountCents: 3000,
        razorpayOrderId: 'order_456',
      }),
    });
  });
});
