import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpay, RAZORPAY_KEY_ID } from '@/lib/razorpay';
import { track } from '@/lib/telemetry';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId, amountCents, serviceFeeCents = 0, bookingSummary } = await request.json();

  if (!taskId || !amountCents || !bookingSummary) {
    return NextResponse.json(
      { error: 'taskId, amountCents, and bookingSummary are required' },
      { status: 400 },
    );
  }

  const totalCents = amountCents + serviceFeeCents;

  try {
    console.log('[payment/create] taskId=%s user=%s amount=%d paise', taskId, authUser.userId, totalCents);
    const order = await getRazorpay().orders.create({
      amount: totalCents,
      currency: 'INR',
      receipt: `task_${taskId}`,
      notes: {
        taskId,
        userId: authUser.userId,
      },
    });
    console.log('[payment/create] taskId=%s razorpay orderId=%s', taskId, order.id);

    await prisma.payment.create({
      data: {
        taskId,
        userId: authUser.userId,
        status: 'pending',
        amountCents,
        serviceFeeCents,
        totalCents,
        currency: 'INR',
        razorpayOrderId: order.id,
        bookingSummary: typeof bookingSummary === 'string'
          ? bookingSummary
          : JSON.stringify(bookingSummary),
      },
    });
    console.log('[payment/create] taskId=%s DB record created', taskId);

    track({ event: 'payment_created', category: 'payment', userId: authUser.userId, taskId, metadata: { amountCents: totalCents, orderId: order.id } });
    return NextResponse.json({
      orderId: order.id,
      amount: totalCents,
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Payment creation failed';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[payment/create] taskId=%s ERROR: %s\n%s', taskId, msg, stack);
    track({ event: 'error', category: 'payment', userId: authUser.userId, taskId, success: false, metadata: { error: msg } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
