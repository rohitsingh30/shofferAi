import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of ShofferAI.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <main id="main" className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Home</Link>
        <h1 className="mt-4 mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 14, 2026</p>

        <article className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Service description</h2>
            <p>ShofferAI is a personal AI assistant that browses the web and executes shopping/ordering tasks on your behalf via your authorisation.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Account</h2>
            <p>You&apos;re responsible for keeping your password safe. You must be 18+ to sign up.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Partner sites</h2>
            <p>When ShofferAI adds items to your BigBasket / Zepto cart, those carts are governed by each partner&apos;s terms. ShofferAI is not the merchant of record.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Payments</h2>
            <p>Payments processed by Razorpay (or partner-side processors). Refunds are governed by the partner site&apos;s refund policy.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Limitations</h2>
            <p>Provided &ldquo;as is.&rdquo; Price comparisons are real-time best-effort; verify final price on the partner site before confirming.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Termination</h2>
            <p>Delete your account anytime by emailing <a href="mailto:support@docx.co.in" className="text-primary hover:underline">support@docx.co.in</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact</h2>
            <p><a href="mailto:support@docx.co.in" className="text-primary hover:underline">support@docx.co.in</a></p>
          </section>
        </article>
      </main>
    </div>
  );
}
