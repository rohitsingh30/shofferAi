import type { Metadata } from 'next';

/* The (auth) route group keeps a clean layout for sign-in / sign-up flows.
 * Per-page <title> overrides come from each page's metadata.ts (since the
 * page.tsx files are 'use client', we colocate metadata in layout.tsx). */
export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to ShofferAI to start shopping with your AI assistant.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
