import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const DEV_USER = {
  name: 'Demo User',
  email: 'demo@shofferai.com',
  password: 'demo1234',
};

export async function POST() {
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
