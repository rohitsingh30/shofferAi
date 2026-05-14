import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your ShofferAI account, addresses, and preferences.',
  alternates: { canonical: '/settings' },
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage your account, saved addresses, and preferences.
      </p>

      <section className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-3 text-base font-semibold">Account</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Email</dt>
            <dd className="text-zinc-200">{session.user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Name</dt>
            <dd className="text-zinc-200">{session.user.name || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-2 text-base font-semibold">Saved addresses</h2>
        <p className="text-sm text-muted-foreground">
          Manage your delivery addresses from the chat — type &ldquo;edit my addresses&rdquo;.
        </p>
      </section>

      <section className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-2 text-base font-semibold">Help &amp; legal</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </li>
          <li>
            <a href="mailto:support@docx.co.in" className="text-primary hover:underline">Contact support</a>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
        <h2 className="mb-2 text-base font-semibold text-red-300">Delete account</h2>
        <p className="text-sm text-zinc-400">
          Email{' '}
          <a href="mailto:privacy@docx.co.in" className="text-primary hover:underline">privacy@docx.co.in</a>{' '}
          to delete your account and associated data within 30 days.
        </p>
      </section>
    </main>
  );
}
