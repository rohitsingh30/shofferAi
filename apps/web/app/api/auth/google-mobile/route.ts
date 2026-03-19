import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { track } from '@/lib/telemetry';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || '');

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 400 });
  }

  // Verify token with Google and get user info
  const googleRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!googleRes.ok) {
    return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
  }

  const googleUser = await googleRes.json();
  const { id: googleId, email, name, picture } = googleUser;

  if (!email) {
    return NextResponse.json({ error: 'No email in Google account' }, { status: 400 });
  }

  // Find or create user + link Google account
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        image: picture,
        accounts: {
          create: {
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            access_token: accessToken,
          },
        },
      },
    });
  } else {
    // Link Google account if not already linked
    const existing = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
        },
      },
    });
    if (!existing) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleId,
          access_token: accessToken,
        },
      });
    }
    if (!user.image && picture) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: picture },
      });
    }
  }

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  track({
    event: 'user_login',
    category: 'auth',
    userId: user.id,
    metadata: { provider: 'google-mobile' },
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
  });
}
