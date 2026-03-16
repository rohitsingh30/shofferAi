import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getRazorpay, RAZORPAY_KEY_ID } from '@/lib/razorpay';
import { track } from '@/lib/telemetry';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
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
    // Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: totalCents, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `task_${taskId}`,
      notes: {
        taskId,
        userId: session.user.id,
      },
    });

    // Create Payment record in DB
    await prisma.payment.create({
      data: {
        taskId,
        userId: session.user.id,
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

    track({ event: 'payment_created', category: 'payment', userId: session.user.id, taskId, metadata: { amountCents: totalCents, orderId: order.id } });
    return NextResponse.json({
      orderId: order.id,
      amount: totalCents,
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Payment creation failed';
    track({ event: 'error', category: 'payment', userId: session.user.id, taskId, success: false, metadata: { error: msg } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
