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
