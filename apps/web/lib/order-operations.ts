import { prisma } from '@/lib/prisma';
import { getRazorpay } from '@/lib/razorpay';
import { track } from '@/lib/telemetry';

/**
 * Handle checkout failure: update order status, initiate Razorpay refund,
 * and return data for the order_failed SSE event.
 */
export async function handleCheckoutFailure(
  orderId: string,
  reason: string,
): Promise<{ orderNumber: string; refundAmountCents: number } | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) {
      console.error('[auto-refund] order %s not found', orderId);
      return null;
    }

    // Update order status
    const prevStatus = order.status;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'checkout_failed',
        statusMessage: reason,
        statusUpdatedAt: new Date(),
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: prevStatus,
        toStatus: 'checkout_failed',
        message: reason,
      },
    });

    // Initiate Razorpay refund (full amount including service fee on checkout failure)
    if (order.payment.razorpayPaymentId) {
      try {
        const refund = await getRazorpay().payments.refund(order.payment.razorpayPaymentId, {
          amount: order.totalCents,
          notes: { orderId, orderNumber: order.orderNumber, reason },
        });
        console.log('[auto-refund] order=%s razorpay refundId=%s', order.orderNumber, refund.id);

        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: 'refunded' },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'refunded', statusMessage: `Refund initiated: ${reason}` },
        });

        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: 'checkout_failed',
            toStatus: 'refunded',
            message: `Full refund of ₹${(order.totalCents / 100).toFixed(0)} initiated`,
            metadata: JSON.stringify({ razorpayRefundId: refund.id }),
          },
        });
      } catch (refundErr) {
        const msg = refundErr instanceof Error ? refundErr.message : 'Refund API failed';
        console.error('[auto-refund] order=%s Razorpay refund failed: %s', order.orderNumber, msg);
        // Don't throw — order is already marked checkout_failed.
        // Admin can manually process refund later.
      }
    }

    track({
      event: 'order_checkout_failed',
      category: 'payment',
      userId: order.userId,
      taskId: order.taskId,
      success: false,
      metadata: { orderId, orderNumber: order.orderNumber, reason },
    });

    return {
      orderNumber: order.orderNumber,
      refundAmountCents: order.totalCents,
    };
  } catch (err) {
    console.error('[auto-refund] orderId=%s unexpected error:', orderId, err);
    return null;
  }
}

/**
 * Update an order when checkout succeeds on the target site.
 */
export async function handleCheckoutSuccess(
  orderId: string,
  data: {
    targetOrderId?: string;
    targetOrderUrl?: string;
    targetTrackingUrl?: string;
    estimatedDelivery?: string;
  },
): Promise<{ orderNumber: string } | null> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return null;

    const prevStatus = order.status;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'order_placed',
        statusMessage: data.targetOrderId ? `Placed on target site: ${data.targetOrderId}` : 'Order placed',
        statusUpdatedAt: new Date(),
        targetOrderId: data.targetOrderId || order.targetOrderId,
        targetOrderUrl: data.targetOrderUrl || order.targetOrderUrl,
        targetTrackingUrl: data.targetTrackingUrl || order.targetTrackingUrl,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : order.estimatedDelivery,
        placedAt: new Date(),
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: prevStatus,
        toStatus: 'order_placed',
        message: data.targetOrderId ? `Order placed: ${data.targetOrderId}` : 'Order placed on target site',
        metadata: JSON.stringify(data),
      },
    });

    track({
      event: 'order_placed',
      category: 'payment',
      userId: order.userId,
      taskId: order.taskId,
      metadata: { orderId, orderNumber: order.orderNumber, ...data },
    });

    return { orderNumber: order.orderNumber };
  } catch (err) {
    console.error('[order-ops] orderId=%s handleCheckoutSuccess error:', orderId, err);
    return null;
  }
}

/** Valid transitions for handleOrderStatusUpdate. */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  order_placed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
};

/** Timestamp field to set for each status. */
const STATUS_TIMESTAMP_FIELD: Record<string, string> = {
  shipped: 'shippedAt',
  delivered: 'deliveredAt',
  cancelled: 'cancelledAt',
};

/**
 * Handle a delivery status update (shipped, out_for_delivery, delivered, cancelled).
 * Validates the transition, updates the Order, and records history.
 */
export async function handleOrderStatusUpdate(
  orderId: string,
  newStatus: string,
  data: {
    trackingNumber?: string;
    courierName?: string;
    targetTrackingUrl?: string;
    message?: string;
  } = {},
): Promise<{
  orderNumber: string;
  status: string;
  message: string;
  targetTrackingUrl?: string;
} | null> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error('[order-ops] handleOrderStatusUpdate: order %s not found', orderId);
      return null;
    }

    // Validate transition
    const allowed = STATUS_TRANSITIONS[order.status];
    if (allowed && !allowed.includes(newStatus)) {
      console.warn(
        '[order-ops] invalid transition %s → %s for order %s',
        order.status,
        newStatus,
        order.orderNumber,
      );
      // Allow anyway but log the warning — agent may have stale state
    }

    const prevStatus = order.status;
    const now = new Date();

    // Build update data
    const updateData: Record<string, unknown> = {
      status: newStatus,
      statusMessage: data.message || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      statusUpdatedAt: now,
    };

    if (data.targetTrackingUrl) {
      updateData.targetTrackingUrl = data.targetTrackingUrl;
    }

    // Set the appropriate timestamp
    const tsField = STATUS_TIMESTAMP_FIELD[newStatus];
    if (tsField) {
      updateData[tsField] = now;
    }

    // For delivered, also set actualDelivery
    if (newStatus === 'delivered') {
      updateData.actualDelivery = now;
    }

    await prisma.order.update({ where: { id: orderId }, data: updateData });

    // Record status history
    const metadata: Record<string, unknown> = {};
    if (data.trackingNumber) metadata.trackingNumber = data.trackingNumber;
    if (data.courierName) metadata.courierName = data.courierName;
    if (data.targetTrackingUrl) metadata.targetTrackingUrl = data.targetTrackingUrl;

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: prevStatus,
        toStatus: newStatus,
        message: data.message || `${newStatus.replace(/_/g, ' ')}`,
        metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : undefined,
      },
    });

    track({
      event: `order_${newStatus}`,
      category: 'order',
      userId: order.userId,
      taskId: order.taskId,
      metadata: { orderId, orderNumber: order.orderNumber, fromStatus: prevStatus, ...data },
    });

    return {
      orderNumber: order.orderNumber,
      status: newStatus,
      message: data.message || `Order ${newStatus.replace(/_/g, ' ')}`,
      targetTrackingUrl: data.targetTrackingUrl || order.targetTrackingUrl || undefined,
    };
  } catch (err) {
    console.error('[order-ops] orderId=%s handleOrderStatusUpdate error:', orderId, err);
    return null;
  }
}
