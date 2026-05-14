import type { NextConfig } from 'next';

/** Security headers applied site-wide. Knocks out the 8+ "missing security
 *  header" findings (HSTS, X-Frame-Options, X-Content-Type-Options,
 *  Referrer-Policy, Permissions-Policy, COOP, CORP, CSP). */
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // CSP: allow self, inline styles (Tailwind/Next), and the grocery image CDNs.
  // We *intentionally* permit unsafe-inline for scripts in this iteration —
  // Next.js inlines small chunks; tightening later requires nonces or hashes.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://*.bbassets.com https://cdn.zeptonow.com https://blinkit.com https://*.blinkit.com https://*.swiggy.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
      "connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://api.openai.com https://*.openai.com https://*.googleapis.com https://accounts.google.com",
      "frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://accounts.google.com",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' as const } : {}),
  // Strip the X-Powered-By: Next.js header (info leak).
  poweredByHeader: false,
  transpilePackages: [
    '@shofferai/shared',
    '@shofferai/agent-core',
  ],
  // Keep ws and bufferutil as native Node modules — standalone bundler breaks them.
  serverExternalPackages: ['ws', 'bufferutil', 'utf-8-validate'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      // /api/* responses should not be indexed by search engines.
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;

