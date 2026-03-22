import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: authUser.userId },
    include: {
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payment: {
        select: {
          razorpayPaymentId: true,
          razorpayOrderId: true,
          paidAt: true,
          currency: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    items: safeParseJSON(order.items),
    deliveryAddress: order.deliveryAddress ? safeParseJSON(order.deliveryAddress) : null,
  });
}

function safeParseJSON(str: string): unknown {
  try { return JSON.parse(str); } catch { return str; }
}
