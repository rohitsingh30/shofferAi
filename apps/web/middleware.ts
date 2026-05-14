import { NextResponse, type NextRequest } from 'next/server';

/** Security headers applied to every response via middleware.
 *
 *  We do NOT import `auth` here — NextAuth's auth() pulls in PrismaAdapter
 *  + bcrypt which are Node-only and break Edge runtime. Auth gating is
 *  handled server-side in the dashboard layout (`if (!session?.user)
 *  redirect('/login')`), so we don't lose protection. */
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

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
};
