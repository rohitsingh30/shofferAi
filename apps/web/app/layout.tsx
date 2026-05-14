import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientErrorReporter } from '@/components/ClientErrorReporter';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shofferai-666049409637.asia-south1.run.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ShofferAI — Your AI That Actually Does Things',
    template: '%s · ShofferAI',
  },
  description:
    'Personal AI assistant that browses the web, compares prices across stores, and executes shopping/booking tasks on your behalf.',
  applicationName: 'ShofferAI',
  authors: [{ name: 'ShofferAI Team' }],
  keywords: ['AI assistant', 'shopping AI', 'price comparison', 'grocery AI', 'BigBasket', 'Zepto', 'cross-store comparison'],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'ShofferAI — Your AI That Actually Does Things',
    description:
      'Compare prices across stores, add to cart in one tap, and let the AI shop for you.',
    url: SITE_URL,
    siteName: 'ShofferAI',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShofferAI — Your AI That Actually Does Things',
    description: 'Compare prices across stores and shop with one tap.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        {/* Skip-to-content link for keyboard / screen-reader users (a11y). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ClientErrorReporter />
        {children}
      </body>
    </html>
  );
}

