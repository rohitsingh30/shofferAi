import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your ShofferAI password.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <main id="main" className="w-full max-w-md rounded-2xl border border-border bg-panel p-8 shadow-xl">
        <h1 className="mb-3 text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          We&apos;re still wiring up self-service password reset. For now, please email{' '}
          <a href="mailto:support@docx.co.in" className="text-primary hover:underline">
            support@docx.co.in
          </a>{' '}
          with the address you signed up with and we&apos;ll get you back in.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          ← Back to sign in
        </Link>
      </main>
    </div>
  );
}
