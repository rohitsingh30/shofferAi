import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';

/** Security headers applied to every response. We use middleware (not the
 *  next.config.ts `headers()` hook) because Next.js standalone + static
 *  prerender bypasses that config — middleware runs on every request and
 *  always inserts headers.
 *
 *  See QA report v4 for the list of findings these headers close out
 *  (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
 *  Permissions-Policy, COOP, CORP, CSP). */
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.bbassets.com https://cdn.zeptonow.com https://blinkit.com https://*.blinkit.com https://*.swiggy.com https://*.googleusercontent.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
    "connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://api.openai.com https://*.openai.com https://*.googleapis.com https://accounts.google.com",
    "frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://accounts.google.com",
  ].join('; '),
};

const PROTECTED_MATCHER = ['/dashboard', '/api/agent/', '/api/profile/', '/api/credentials/', '/api/admin/'];

function applyHeaders(res: NextResponse, pathname: string): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  if (pathname.startsWith('/api/')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

function isProtected(pathname: string): boolean {
  return PROTECTED_MATCHER.some((p) => pathname === p || pathname.startsWith(p));
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Auth gate: if the path is protected, run NextAuth's auth() — it
  // handles redirect-to-login. We then apply security headers to whatever
  // response NextAuth returns (or to the next default response).
  if (isProtected(pathname)) {
    const session = await auth();
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return applyHeaders(NextResponse.redirect(url), pathname);
    }
  }

  return applyHeaders(NextResponse.next(), pathname);
}

export const config = {
  // Run on everything except Next.js internals and static files. The
  // negative lookahead ensures we set security headers on every page +
  // API + asset response (HTML, JSON, even CSS/JS get the headers since
  // they're served by the same origin).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
};
