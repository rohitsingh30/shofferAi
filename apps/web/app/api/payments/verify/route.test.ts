import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import { POST } from './route';

const mockProvideInput = vi.fn();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      update: vi.fn(),
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

const TEST_SECRET = 'test_razorpay_secret';

function makeSignature(orderId: string, paymentId: string): string {
  return createHmac('sha256', TEST_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/payments/verify', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await POST(makeRequest({
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 'sig',
      taskId: 't1',
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const res = await POST(makeRequest({ razorpay_order_id: 'o1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid signature', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    const res = await POST(makeRequest({
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 'wrong_signature',
      taskId: 't1',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid');
  });

  it('returns 500 when RAZORPAY_KEY_SECRET not configured', async () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

    const res = await POST(makeRequest({
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 'sig',
      taskId: 't1',
    }));
    expect(res.status).toBe(500);
  });

  it('updates payment record and resumes agent on valid signature', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.payment.update).mockResolvedValue({} as any);
    mockProvideInput.mockResolvedValue(true);

    const sig = makeSignature('order_abc', 'pay_xyz');
    const res = await POST(makeRequest({
      razorpay_order_id: 'order_abc',
      razorpay_payment_id: 'pay_xyz',
      razorpay_signature: sig,
      taskId: 't1',
    }));

    const body = await res.json();
    expect(body.success).toBe(true);

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { razorpayOrderId: 'order_abc' },
      data: expect.objectContaining({
        status: 'captured',
        razorpayPaymentId: 'pay_xyz',
      }),
    });
  });

  it('calls pauseManager.provideInput with correct taskId', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.payment.update).mockResolvedValue({} as any);
    mockProvideInput.mockResolvedValue(true);

    const sig = makeSignature('order_abc', 'pay_xyz');
    await POST(makeRequest({
      razorpay_order_id: 'order_abc',
      razorpay_payment_id: 'pay_xyz',
      razorpay_signature: sig,
      taskId: 'task-42',
    }));

    expect(mockProvideInput).toHaveBeenCalledWith('task-42', 'payment', 'confirmed');
  });
});
