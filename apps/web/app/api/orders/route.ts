import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

  const where: Record<string, unknown> = { userId: authUser.userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        statusMessage: true,
        targetSite: true,
        targetOrderId: true,
        items: true,
        itemCount: true,
        productAmountCents: true,
        serviceFeeCents: true,
        totalCents: true,
        estimatedDelivery: true,
        deliveredAt: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  // Parse JSON items for each order
  const parsed = orders.map((o) => ({
    ...o,
    items: safeParseJSON(o.items),
  }));

  return NextResponse.json({
    orders: parsed,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

function safeParseJSON(str: string): unknown {
  try { return JSON.parse(str); } catch { return str; }
}
