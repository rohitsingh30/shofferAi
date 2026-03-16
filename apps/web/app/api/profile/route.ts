import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Parse JSON strings for the response
  return NextResponse.json({
    ...profile,
    addresses: JSON.parse(profile.addresses),
    preferences: JSON.parse(profile.preferences),
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phone, addresses, preferences } = await request.json();

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      phone: phone !== undefined ? phone : undefined,
      addresses: addresses !== undefined ? JSON.stringify(addresses) : undefined,
      preferences: preferences !== undefined ? JSON.stringify(preferences) : undefined,
    },
    create: {
      userId: session.user.id,
      phone,
      addresses: JSON.stringify(addresses || []),
      preferences: JSON.stringify(preferences || {}),
    },
  });

  return NextResponse.json({
    ...profile,
    addresses: JSON.parse(profile.addresses),
    preferences: JSON.parse(profile.preferences),
  });
}
