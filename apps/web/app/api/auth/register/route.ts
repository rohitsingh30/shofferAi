import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { track } from '@/lib/telemetry';

// RFC-5321 maximum total email length. Common practice is 254 (3 + 64 + 1 + 252 cap).
const MAX_EMAIL = 254;
const MAX_NAME = 100;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
// Practical email regex — requires local + @ + domain + . + tld.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Tiny in-memory rate limit. 10 registrations per IP per hour. Best-effort —
// not a substitute for a proper edge rate limiter (e.g. Upstash) but stops
// brute-force enumeration in burst tests.
const REGISTER_RATE: Map<string, { count: number; first: number }> = (globalThis as unknown as { __regRate?: Map<string, { count: number; first: number }> }).__regRate ?? new Map();
(globalThis as unknown as { __regRate?: Map<string, { count: number; first: number }> }).__regRate = REGISTER_RATE;
const REGISTER_RATE_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_RATE_MAX = 10;

function ipFromHeaders(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = REGISTER_RATE.get(ip);
  if (!entry || now - entry.first > REGISTER_RATE_WINDOW_MS) {
    REGISTER_RATE.set(ip, { count: 1, first: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > REGISTER_RATE_MAX) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = ipFromHeaders(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Try again in an hour.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body must be valid JSON' }, { status: 400 });
    }
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 });
    }
    const { name, email, password } = body as { name?: unknown; email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required and must be strings' },
        { status: 400 },
      );
    }
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || trimmedEmail.length > MAX_EMAIL || !EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Email looks invalid' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD} characters` },
        { status: 400 },
      );
    }
    if (password.length > MAX_PASSWORD) {
      return NextResponse.json(
        { error: `Password must be at most ${MAX_PASSWORD} characters` },
        { status: 400 },
      );
    }
    if (password.trim().length === 0) {
      return NextResponse.json({ error: 'Password cannot be only whitespace' }, { status: 400 });
    }

    // Strip HTML/control chars from name to prevent stored XSS via the
    // dashboard greeting render. Also reject outright if the input
    // contained HTML tags (better signal to the user than silent strip).
    const rawName = typeof name === 'string' ? name : '';
    if (/<[^>]+>/.test(rawName)) {
      return NextResponse.json(
        { error: 'Name cannot contain HTML tags' },
        { status: 400 },
      );
    }
    const safeName = rawName
      .replace(/[\u0000-\u001F\u007F]+/g, '')    // strip control chars
      .trim()
      .slice(0, MAX_NAME);

    const lowerEmail = trimmedEmail.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: safeName || null,
        email: lowerEmail,
        passwordHash,
        profile: { create: {} },
      },
    });

    track({ event: 'user_register', category: 'auth', userId: user.id, metadata: { email: user.email } });
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    track({ event: 'error', category: 'auth', success: false, metadata: { error: 'registration_failed' } });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Reject non-POST so QA scans don't get noisy 500s.
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'POST' } });
}

