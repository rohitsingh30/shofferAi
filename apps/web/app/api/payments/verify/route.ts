import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { workflowEngine } from '@/lib/singletons';
import { track } from '@/lib/telemetry';
import { getAuthUser } from '@/lib/auth-helper';
import { generateOrderNumber } from '@shofferai/shared';

export async function POST(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    taskId,
    stepId = 'payment',
    // Optional: cart/order context from frontend
    items,
    targetSite,
    deliveryAddress,
  } = await request.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !taskId) {
    return NextResponse.json(
      { error: 'All Razorpay fields and taskId are required' },
      { status: 400 },
    );
  }

  // Verify Razorpay signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[payment/verify] RAZORPAY_KEY_SECRET not configured');
    return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error('[payment/verify] taskId=%s SIGNATURE MISMATCH', taskId);
    track({ event: 'payment_signature_invalid', category: 'payment', userId: authUser.userId, taskId, success: false });
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  try {
    console.log('[payment/verify] taskId=%s orderId=%s paymentId=%s — signature valid', taskId, razorpay_order_id, razorpay_payment_id);
    // Update payment record
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    });
    console.log('[payment/verify] taskId=%s DB updated to captured', taskId);

    // ─── Create Order record ───────────────────────────────────────
    let order = null;
    try {
      // Parse items from bookingSummary if not provided directly
      let orderItems = items;
      if (!orderItems) {
        try {
          const parsed = JSON.parse(payment.bookingSummary);
          orderItems = parsed.items || [{ name: parsed.name || payment.bookingSummary, qty: 1, priceCents: payment.amountCents }];
        } catch {
          orderItems = [{ name: payment.bookingSummary, qty: 1, priceCents: payment.amountCents }];
        }
      }
      const itemCount = Array.isArray(orderItems) ? orderItems.reduce((sum: number, i: { qty?: number; quantity?: number }) => sum + (i.qty || i.quantity || 1), 0) : 1;
      const site = targetSite || inferTargetSite(payment.bookingSummary);

      // Generate order number with retry on collision
      let orderNumber: string;
      let retries = 0;
      while (true) {
        orderNumber = generateOrderNumber();
        const exists = await prisma.order.findUnique({ where: { orderNumber } });
        if (!exists) break;
        if (++retries > 3) throw new Error('Order number collision after 3 retries');
      }

      order = await prisma.order.create({
        data: {
          orderNumber,
          taskId,
          userId: authUser.userId,
          paymentId: payment.id,
          status: 'payment_received',
          targetSite: site,
          items: JSON.stringify(orderItems),
          itemCount,
          deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
          productAmountCents: payment.amountCents,
          serviceFeeCents: payment.serviceFeeCents,
          totalCents: payment.totalCents,
        },
      });

      // Record initial status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: 'created',
          toStatus: 'payment_received',
          message: `Payment of ₹${(payment.totalCents / 100).toFixed(0)} received via Razorpay`,
        },
      });

      console.log('[payment/verify] taskId=%s order=%s created (status=payment_received)', taskId, order.orderNumber);
    } catch (orderErr) {
      // Order creation failure should NOT block payment verification
      console.error('[payment/verify] taskId=%s order creation failed (non-blocking):', taskId, orderErr);
    }

    // Resume the agent — it's been waiting for payment confirmation
    const pauseManager = workflowEngine.getPauseManager();
    await pauseManager.provideInput(taskId, stepId, 'confirmed');
    console.log('[payment/verify] taskId=%s stepId=%s agent resumed', taskId, stepId);

    track({ event: 'payment_verified', category: 'payment', userId: authUser.userId, taskId, metadata: { razorpayPaymentId: razorpay_payment_id, orderNumber: order?.orderNumber } });
    return NextResponse.json({
      success: true,
      order: order ? {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      } : null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification failed';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[payment/verify] taskId=%s ERROR: %s\n%s', taskId, msg, stack);
    track({ event: 'error', category: 'payment', userId: authUser.userId, taskId, success: false, metadata: { error: msg } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Best-effort guess of target site from booking summary text */
function inferTargetSite(summary: string): string {
  const lower = summary.toLowerCase();
  if (lower.includes('flipkart')) return 'flipkart';
  if (lower.includes('blinkit')) return 'blinkit';
  if (lower.includes('swiggy')) return 'swiggy';
  if (lower.includes('amazon')) return 'amazon';
  if (lower.includes('booking.com') || lower.includes('hotel')) return 'booking.com';
  if (lower.includes('zomato')) return 'zomato';
  return 'unknown';
}
