import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { workflowEngine } from '@/lib/singletons';
import { track } from '@/lib/telemetry';
import { getAuthUser } from '@/lib/auth-helper';

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
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    });
    console.log('[payment/verify] taskId=%s DB updated to captured', taskId);

    // Resume the agent — it's been waiting for payment confirmation
    const pauseManager = workflowEngine.getPauseManager();
    pauseManager.provideInput(taskId, 'payment', 'confirmed');
    console.log('[payment/verify] taskId=%s agent resumed', taskId);

    track({ event: 'payment_verified', category: 'payment', userId: authUser.userId, taskId, metadata: { razorpayPaymentId: razorpay_payment_id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification failed';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[payment/verify] taskId=%s ERROR: %s\n%s', taskId, msg, stack);
    track({ event: 'error', category: 'payment', userId: authUser.userId, taskId, success: false, metadata: { error: msg } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
