import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const DEV_USER = {
  name: 'Demo User',
  email: 'demo@shofferai.com',
  password: 'demo1234',
};

/**
 * Gate: only enabled when NODE_ENV !== 'production' OR the operator has
 * explicitly opted in via ENABLE_DEV_LOGIN=1 (e.g. for E2E test environments
 * that run against prod-like builds).
 *
 * In a vanilla production deploy this returns 404 — anyone hitting it
 * cannot upsert/authenticate as the demo user.
 *
 * Reported as BUG-010 in the bug-hunt session: previously this endpoint
 * was wide-open in prod, returning the demo password to any caller.
 */
function devLoginEnabled(): boolean {
  if (process.env.ENABLE_DEV_LOGIN === '1') return true;
  return process.env.NODE_ENV !== 'production';
}

export async function POST() {
  if (!devLoginEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(DEV_USER.password, 12);

  // Upsert: create if missing, reset password if exists
  await prisma.user.upsert({
    where: { email: DEV_USER.email },
    update: { passwordHash },
    create: {
      name: DEV_USER.name,
      email: DEV_USER.email,
      passwordHash,
      profile: { create: {} },
    },
  });

  return NextResponse.json({
    email: DEV_USER.email,
    password: DEV_USER.password,
  });
}
