import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-primary">Shoffer</span>
          <span className="text-accent">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Now executing real workflows
        </div>

        <h1 className="mb-4 max-w-3xl text-center text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          The AI assistant that
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> actually does things</span>
        </h1>

        <p className="mb-10 max-w-xl text-center text-lg leading-relaxed text-muted-foreground">
          Stop copy-pasting between AI and websites. Tell ShofferAI what you need
          and it handles the entire workflow — from searching to booking to payment.
        </p>

        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25"
          >
            Start for free
          </Link>
          <Link
            href="#how"
            className="rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold transition-all hover:bg-card-hover hover:border-muted-foreground/30"
          >
            See how it works
          </Link>
        </div>

        {/* Demo prompt examples */}
        <div className="mt-16 w-full max-w-2xl" id="how">
          <div className="rounded-2xl border border-border bg-card p-1">
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try saying...
            </div>
            <div className="space-y-2 px-3 pb-3">
              {[
                { text: 'Book me a hotel in Goa for this weekend under ₹4000/night', icon: '🏨' },
                { text: 'Order milk and bread from Blinkit', icon: '🛒' },
                { text: 'Order butter chicken from Zomato', icon: '🍛' },
                { text: 'Buy wireless earbuds under ₹2000 from Flipkart', icon: '🛍️' },
                { text: 'Buy a kurta from Myntra under ₹1500', icon: '👕' },
              ].map((prompt) => (
                <Link
                  key={prompt.text}
                  href="/register"
                  className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3.5 text-sm transition-all hover:bg-input"
                >
                  <span className="text-lg">{prompt.icon}</span>
                  <span className="text-muted-foreground">{prompt.text}</span>
                  <svg className="ml-auto h-4 w-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {[
            {
              title: 'Real browser actions',
              desc: 'Not just suggestions — ShofferAI actually clicks, types, and navigates websites for you.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
              ),
            },
            {
              title: 'Your data stays yours',
              desc: 'Payment info is encrypted. The AI never sees your card numbers — it just fills the forms.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ),
            },
            {
              title: 'Asks when it should',
              desc: 'OTP codes, payment confirmations, choosing between options — it pauses and checks with you.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              ),
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-white/[0.08] bg-[#1a1a24] p-6 transition-all duration-200 hover:border-primary/25 hover:bg-[#1e1e2e] hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/20 group-hover:ring-primary/20">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm font-medium tracking-tight">
            <span className="text-primary">Shoffer</span>
            <span className="text-accent">AI</span>
            <span className="ml-2 text-muted-foreground/50">— AI that acts, not just answers.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60">
            <span>Privacy</span>
            <span>Terms</span>
            <span>&copy; {new Date().getFullYear()} ShofferAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
