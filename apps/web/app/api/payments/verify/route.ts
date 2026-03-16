import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { workflowEngine } from '@/lib/singletons';
import { track } from '@/lib/telemetry';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
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
    return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    track({ event: 'payment_signature_invalid', category: 'payment', userId: session.user.id, taskId, success: false });
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  try {
    // Update payment record
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    });

    // Resume the agent — it's been waiting for payment confirmation
    const pauseManager = workflowEngine.getPauseManager();
    pauseManager.provideInput(taskId, 'payment', 'confirmed');

    track({ event: 'payment_verified', category: 'payment', userId: session.user.id, taskId, metadata: { razorpayPaymentId: razorpay_payment_id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Verification failed';
    track({ event: 'error', category: 'payment', userId: session.user.id, taskId, success: false, metadata: { error: msg } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
