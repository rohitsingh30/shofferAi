import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ShofferAI collects, uses, and protects your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main id="main" className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Home</Link>
        <h1 className="mt-4 mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 14, 2026</p>

        <article className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">What we collect</h2>
            <p>Your name, email, hashed password, and saved delivery addresses.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">How we use it</h2>
            <p>To sign you in, scope grocery searches to the right pincode, and auto-fill checkout forms on partner sites.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Third parties</h2>
            <p>Razorpay (payments), Google Sign-In (optional auth), partner sites you choose to shop on.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Cookies</h2>
            <p>One session cookie (HttpOnly, Secure, SameSite=Lax). No third-party trackers.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Data deletion</h2>
            <p>Email <a href="mailto:privacy@docx.co.in" className="text-primary hover:underline">privacy@docx.co.in</a> to delete your account within 30 days.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
            <p>Questions? <a href="mailto:privacy@docx.co.in" className="text-primary hover:underline">privacy@docx.co.in</a></p>
          </section>
        </article>
      </main>
    </div>
  );
}
