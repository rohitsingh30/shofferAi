import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white">Shoffer<span className="text-primary">AI</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-20">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-[140px]" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />
        </div>

        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
          Now executing real workflows
        </div>

        <h1 className="relative mb-5 max-w-3xl text-center text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          The AI assistant that
          <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> actually does things</span>
        </h1>

        <p className="relative mb-10 max-w-xl text-center text-lg leading-relaxed text-zinc-500">
          Stop copy-pasting between AI and websites. Tell ShofferAI what you need
          and it handles the entire workflow — from searching to booking to payment.
        </p>

        <div className="relative flex gap-4">
          <Link
            href="/register"
            className="rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
          >
            Start for free
          </Link>
          <Link
            href="#how"
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
          >
            See how it works
          </Link>
        </div>

        {/* Demo prompt examples */}
        <div className="relative mt-16 w-full max-w-2xl" id="how">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-500">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try saying...
            </div>
            <div className="space-y-1.5 px-3 pb-3">
              {[
                { text: 'Book me a hotel in Goa for this weekend under ₹4000/night', icon: '🏨' },
                { text: 'Order milk and bread from Blinkit', icon: '🛒' },
                { text: 'Order butter chicken from Zomato', icon: '🍛' },
                { text: 'Buy wireless earbuds under ₹2000 from Flipkart', icon: '🎧' },
                { text: 'Buy a kurta from Myntra under ₹1500', icon: '👕' },
              ].map((prompt) => (
                <Link
                  key={prompt.text}
                  href="/register"
                  className="group flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3.5 text-sm transition-all hover:bg-white/[0.06]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-base ring-1 ring-white/[0.06] transition-all group-hover:scale-110 group-hover:bg-primary/10">{prompt.icon}</span>
                  <span className="text-zinc-400 transition-colors group-hover:text-zinc-200">{prompt.text}</span>
                  <svg className="ml-auto h-4 w-4 text-zinc-800 transition-all group-hover:text-primary/50 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative mt-20 grid w-full max-w-4xl gap-4 md:grid-cols-3">
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
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/15 group-hover:ring-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold text-zinc-200">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium tracking-tight">
            <span className="text-white">Shoffer<span className="text-primary">AI</span></span>
            <span className="text-zinc-700">—</span>
            <span className="text-zinc-600">AI that acts, not just answers.</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-zinc-700">
            <span className="cursor-pointer transition-colors hover:text-zinc-400">Privacy</span>
            <span className="cursor-pointer transition-colors hover:text-zinc-400">Terms</span>
            <span>&copy; {new Date().getFullYear()} ShofferAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
