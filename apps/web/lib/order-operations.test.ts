import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma before importing the module
const mockOrder = {
  id: 'order-1',
  orderNumber: 'SHOF-20260322-A1B2',
  status: 'order_placed',
  statusMessage: null,
  targetSite: 'flipkart',
  targetOrderId: 'OD12345',
  targetOrderUrl: null,
  targetTrackingUrl: null,
  estimatedDelivery: null,
  actualDelivery: null,
  totalCents: 189900,
  productAmountCents: 179900,
  serviceFeeCents: 10000,
  userId: 'user-1',
  taskId: 'task-1',
  paymentId: 'pay-1',
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/razorpay', () => ({
  getRazorpay: vi.fn(() => ({
    payments: { refund: vi.fn() },
  })),
}));

vi.mock('@/lib/telemetry', () => ({
  track: vi.fn(),
}));

import { handleOrderStatusUpdate } from './order-operations';
import { prisma } from '@/lib/prisma';

describe('handleOrderStatusUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    vi.mocked(prisma.orderStatusHistory.create).mockResolvedValue({} as never);
  });

  it('returns null if order not found', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null as never);
    const result = await handleOrderStatusUpdate('nonexistent', 'shipped');
    expect(result).toBeNull();
  });

  it('updates order to shipped with timestamp', async () => {
    const result = await handleOrderStatusUpdate('order-1', 'shipped', {
      courierName: 'Delhivery',
      trackingNumber: 'AWB123',
    });

    expect(result).toEqual({
      orderNumber: 'SHOF-20260322-A1B2',
      status: 'shipped',
      message: 'Order shipped',
      targetTrackingUrl: undefined,
    });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.objectContaining({
        status: 'shipped',
        shippedAt: expect.any(Date),
      }),
    });

    expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        fromStatus: 'order_placed',
        toStatus: 'shipped',
        metadata: expect.stringContaining('Delhivery'),
      }),
    });
  });

  it('updates order to delivered with actualDelivery', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...mockOrder,
      status: 'out_for_delivery',
    } as never);

    const result = await handleOrderStatusUpdate('order-1', 'delivered', {
      message: 'Package delivered to front door',
    });

    expect(result?.status).toBe('delivered');

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.objectContaining({
        status: 'delivered',
        deliveredAt: expect.any(Date),
        actualDelivery: expect.any(Date),
      }),
    });
  });

  it('updates order to cancelled with timestamp', async () => {
    const result = await handleOrderStatusUpdate('order-1', 'cancelled', {
      message: 'User requested cancellation',
    });

    expect(result?.status).toBe('cancelled');

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.objectContaining({
        status: 'cancelled',
        cancelledAt: expect.any(Date),
      }),
    });
  });

  it('stores tracking URL when provided', async () => {
    await handleOrderStatusUpdate('order-1', 'shipped', {
      targetTrackingUrl: 'https://track.delhivery.com/AWB123',
    });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.objectContaining({
        targetTrackingUrl: 'https://track.delhivery.com/AWB123',
      }),
    });
  });

  it('records status history with courier metadata', async () => {
    await handleOrderStatusUpdate('order-1', 'shipped', {
      courierName: 'BlueDart',
      trackingNumber: 'BD999',
      targetTrackingUrl: 'https://bluedart.com/BD999',
    });

    expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        fromStatus: 'order_placed',
        toStatus: 'shipped',
        metadata: JSON.stringify({
          trackingNumber: 'BD999',
          courierName: 'BlueDart',
          targetTrackingUrl: 'https://bluedart.com/BD999',
        }),
      }),
    });
  });
});
