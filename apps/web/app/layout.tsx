import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientErrorReporter } from '@/components/ClientErrorReporter';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ShofferAI — Your AI That Actually Does Things',
  description: 'Personal AI assistant that executes real-world tasks on your behalf',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        <ClientErrorReporter />
        {children}
      </body>
    </html>
  );
}
