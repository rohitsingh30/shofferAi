import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CredentialVault } from '@/lib/credential-vault';
import { getAuthUser } from '@/lib/auth-helper';
import type { CredentialType, CredentialData } from '@shofferai/shared';

const vault = new CredentialVault(prisma);

export async function GET(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const credentials = await vault.list(authUser.userId);
    console.log('[credentials] GET user=%s count=%d', authUser.userId, credentials.length);
    return NextResponse.json(credentials);
  } catch (error) {
    console.error('[credentials] GET user=%s ERROR:', authUser.userId, error);
    return NextResponse.json({ error: 'Failed to list credentials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, label, data, lastFour } = await request.json() as {
    type: CredentialType;
    label: string;
    data: CredentialData;
    lastFour?: string;
  };

  if (!type || !label || !data) {
    return NextResponse.json(
      { error: 'type, label, and data are required' },
      { status: 400 }
    );
  }

  try {
    const id = await vault.store(authUser.userId, type, label, data, lastFour);
    console.log('[credentials] POST user=%s type=%s label=%s id=%s', authUser.userId, type, label, id);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[credentials] POST user=%s ERROR:', authUser.userId, error);
    return NextResponse.json({ error: 'Failed to store credential' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    await vault.delete(id, authUser.userId);
    console.log('[credentials] DELETE user=%s id=%s', authUser.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[credentials] DELETE user=%s id=%s ERROR:', authUser.userId, id, error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}
