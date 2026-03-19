import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: authUser.userId },
    });

    if (!profile) {
      console.log('[profile] GET user=%s — not found', authUser.userId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('[profile] GET user=%s OK', authUser.userId);
    return NextResponse.json({
      ...profile,
      addresses: JSON.parse(profile.addresses),
      preferences: JSON.parse(profile.preferences),
    });
  } catch (error) {
    console.error('[profile] GET user=%s ERROR:', authUser.userId, error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { phone, addresses, preferences } = await request.json();
    console.log('[profile] PUT user=%s', authUser.userId);

    const profile = await prisma.profile.upsert({
      where: { userId: authUser.userId },
      update: {
        phone: phone !== undefined ? phone : undefined,
        addresses: addresses !== undefined ? JSON.stringify(addresses) : undefined,
        preferences: preferences !== undefined ? JSON.stringify(preferences) : undefined,
      },
      create: {
        userId: authUser.userId,
        phone,
        addresses: JSON.stringify(addresses || []),
        preferences: JSON.stringify(preferences || {}),
      },
    });

    console.log('[profile] PUT user=%s OK', authUser.userId);
    return NextResponse.json({
      ...profile,
      addresses: JSON.parse(profile.addresses),
      preferences: JSON.parse(profile.preferences),
    });
  } catch (error) {
    console.error('[profile] PUT user=%s ERROR:', authUser.userId, error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
