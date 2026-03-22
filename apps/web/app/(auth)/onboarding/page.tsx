'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

function usePincodeLookup(
  pincode: string,
  onResult: (city: string, state: string) => void,
) {
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) return;
    let cancelled = false;
    fetch(`/api/pincode?code=${pincode}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.city) return;
        onResult(data.city, data.state);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pincode]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Pre-populate from existing profile so onboarding never wipes saved data
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.phone) setPhone(data.phone);
        if (Array.isArray(data.addresses) && data.addresses.length > 0) {
          const a = data.addresses[0];
          setAddress((prev) => ({
            ...prev,
            label: a.label || prev.label,
            line1: a.line1 || '',
            line2: a.line2 || '',
            city: a.city || '',
            state: a.state || '',
            pincode: a.pincode || '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  const handlePincodeResult = useCallback((city: string, state: string) => {
    setAddress((prev) => ({
      ...prev,
      city: prev.city || city,
      state: prev.state || state,
    }));
  }, []);

  usePincodeLookup(address.pincode, handlePincodeResult);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Only include fields the user actually filled in — never send
      // empty arrays that would overwrite agent-saved addresses.
      const body: Record<string, unknown> = {};
      if (phone) body.phone = phone;
      if (address.line1) {
        body.addresses = [{ ...address, id: crypto.randomUUID(), isDefault: true }];
      }
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome to ShofferAI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s set up your profile so I can help you better
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Phone Number</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Used for OTP verification when booking or ordering
                </p>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Default Address</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Used for deliveries and bookings
                </p>
              </div>
              <input
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                placeholder="Address line 1"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                value={address.line2}
                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                placeholder="Address line 2 (optional)"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <input
                value={address.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setAddress({
                    ...address,
                    pincode: val,
                    ...(val.length < 6 ? { city: '', state: '' } : {}),
                  });
                }}
                placeholder="Pincode"
                maxLength={6}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleComplete}
                    className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/50">
          You can always update these later in your profile settings
        </p>
      </div>
    </div>
  );
}
