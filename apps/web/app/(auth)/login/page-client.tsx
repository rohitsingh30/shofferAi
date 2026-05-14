'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10 p-12 lg:flex relative">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

        {/* Logo — pinned top */}
        <div className="absolute left-12 top-12 z-10 text-xl font-bold tracking-tight">
          <span className="text-primary">Shoffer</span>
          <span className="text-accent">AI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-3xl font-bold leading-tight">
            Your AI assistant that<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">actually does things.</span>
          </p>
          <p className="mt-4 text-muted-foreground">
            Book hotels, order groceries, pay bills — just tell ShofferAI what you need
            and watch it work.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              { icon: '🏨', text: 'Books hotels and flights for you' },
              { icon: '🛒', text: 'Orders groceries in under 30 seconds' },
              { icon: '🔒', text: 'Your card details are always encrypted' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 backdrop-blur-sm transition-colors hover:bg-card/70">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — pinned bottom */}
        <p className="absolute bottom-12 left-12 z-10 text-sm text-muted-foreground/60">
          Powered by browser automation + AI reasoning
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="text-2xl font-bold">
              <span className="text-primary">Shoffer</span>
              <span className="text-accent">AI</span>
            </span>
          </div>

          <h2 className="mb-2 text-2xl font-bold">Welcome back</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-card-hover hover:border-muted-foreground/30"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                spellCheck={false}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-end -mt-2">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                const res = await fetch('/api/auth/dev-login', { method: 'POST' });
                const { email: devEmail, password: devPassword } = await res.json();
                const result = await signIn('credentials', {
                  email: devEmail,
                  password: devPassword,
                  redirect: false,
                });
                if (result?.error) {
                  setError('Dev login failed');
                  setLoading(false);
                } else {
                  router.push('/dashboard');
                }
              } catch {
                setError('Dev login failed');
                setLoading(false);
              }
            }}
            className="w-full rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 px-4 py-3 text-sm font-medium text-amber-600 transition-all hover:bg-amber-500/10 hover:border-amber-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Dev Login (demo@shofferai.com)'}
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
