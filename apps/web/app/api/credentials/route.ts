import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CredentialVault } from '@/lib/credential-vault';
import type { CredentialType, CredentialData } from '@shofferai/shared';

const vault = new CredentialVault(prisma);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const credentials = await vault.list(session.user.id);
  return NextResponse.json(credentials);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
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

  const id = await vault.store(session.user.id, type, label, data, lastFour);
  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await vault.delete(id, session.user.id);
  return NextResponse.json({ success: true });
}
