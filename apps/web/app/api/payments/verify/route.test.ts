import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import { POST } from './route';

const mockProvideInput = vi.fn();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/auth-helper', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      update: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
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

vi.mock('@/lib/telemetry', () => ({
  track: vi.fn(),
}));

import { auth } from '@/auth';
import { getAuthUser } from '@/lib/auth-helper';
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
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await POST(makeRequest({
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 'sig',
      taskId: 't1',
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ userId: 'u1' });
    const res = await POST(makeRequest({ razorpay_order_id: 'o1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid signature', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ userId: 'u1' });
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
    vi.mocked(getAuthUser).mockResolvedValue({ userId: 'u1' });

    const res = await POST(makeRequest({
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 'sig',
      taskId: 't1',
    }));
    expect(res.status).toBe(500);
  });

  it('updates payment record, creates order, and resumes agent on valid signature', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ userId: 'u1' });
    vi.mocked(prisma.payment.update).mockResolvedValue({
      id: 'pay-1',
      amountCents: 179900,
      serviceFeeCents: 10000,
      totalCents: 189900,
      bookingSummary: '{"items":[{"name":"OnePlus Buds","qty":1}],"total":"₹1799"}',
    } as any);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null); // no collision
    vi.mocked(prisma.order.create).mockResolvedValue({
      id: 'order-1',
      orderNumber: 'SHOF-20260322-A1B2',
      status: 'payment_received',
    } as any);
    vi.mocked(prisma.orderStatusHistory.create).mockResolvedValue({} as any);
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
    expect(body.order).toBeDefined();
    expect(body.order.orderNumber).toBe('SHOF-20260322-A1B2');

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { razorpayOrderId: 'order_abc' },
      data: expect.objectContaining({
        status: 'captured',
        razorpayPaymentId: 'pay_xyz',
      }),
    });

    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 't1',
        userId: 'u1',
        status: 'payment_received',
      }),
    });
  });

  it('calls pauseManager.provideInput with correct taskId', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ userId: 'u1' });
    vi.mocked(prisma.payment.update).mockResolvedValue({
      id: 'p1', amountCents: 100, serviceFeeCents: 0, totalCents: 100, bookingSummary: 'test',
    } as any);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o1', orderNumber: 'SHOF-TEST' } as any);
    vi.mocked(prisma.orderStatusHistory.create).mockResolvedValue({} as any);
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
