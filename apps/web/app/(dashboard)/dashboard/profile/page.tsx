'use client';

import { useState, useEffect, useCallback } from 'react';

interface Address {
  id?: string;
  label: string;
  flatNo?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface ProfileData {
  phone: string;
  addresses: Address[];
}

interface Credential {
  id: string;
  type: string;
  label: string;
  lastFour: string | null;
  createdAt: string;
}

interface UserInfo {
  name: string;
  email: string;
}

const emptyAddressForm: Omit<Address, 'id'> = {
  label: 'Home',
  flatNo: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [cardForm, setCardForm] = useState({
    label: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
  });
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handlePincodeResult = useCallback((city: string, state: string) => {
    setAddressForm((prev) => ({
      ...prev,
      city: prev.city || city,
      state: prev.state || state,
    }));
  }, []);

  usePincodeLookup(addressForm.pincode, handlePincodeResult);

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch('/api/credentials').then((r) => r.json()),
      fetch('/api/auth/session').then((r) => r.json()),
    ]).then(([profileData, credData, session]) => {
      setProfile(profileData);
      setCredentials(credData);
      if (session?.user) {
        setUser({ name: session.user.name || 'User', email: session.user.email || '' });
      }
    });
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: editPhone,
        addresses: profile?.addresses || [],
      }),
    });
    const updated = await fetch('/api/profile').then((r) => r.json());
    setProfile(updated);
    setEditingProfile(false);
    setSavingProfile(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.line1.trim() || !addressForm.pincode.trim()) return;
    setSavingAddress(true);
    const newAddress: Address = {
      id: crypto.randomUUID(),
      label: addressForm.label.trim() || 'Home',
      flatNo: addressForm.flatNo?.trim() || undefined,
      line1: addressForm.line1.trim(),
      line2: addressForm.line2?.trim() || undefined,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
    };
    const updatedAddresses = [...(profile?.addresses || []), newAddress];
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });
    const updated = await fetch('/api/profile').then((r) => r.json());
    setProfile(updated);
    setAddressForm(emptyAddressForm);
    setShowAddAddress(false);
    setSavingAddress(false);
  };

  const handleDeleteAddress = async (addressId: string | undefined, index: number) => {
    if (!profile) return;
    const updatedAddresses = profile.addresses.filter((a, i) =>
      addressId ? a.id !== addressId : i !== index,
    );
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });
    const updated = await fetch('/api/profile').then((r) => r.json());
    setProfile(updated);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const lastFour = cardForm.cardNumber.slice(-4);

    await fetch('/api/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'card',
        label: cardForm.label || `Card ending ${lastFour}`,
        lastFour,
        data: {
          cardNumber: cardForm.cardNumber,
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear,
          cvv: cardForm.cvv,
          nameOnCard: cardForm.nameOnCard,
        },
      }),
    });

    const creds = await fetch('/api/credentials').then((r) => r.json());
    setCredentials(creds);
    setShowAddCard(false);
    setCardForm({ label: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', nameOnCard: '' });
    setSaving(false);
  };

  const handleDeleteCredential = async (id: string) => {
    await fetch(`/api/credentials?id=${id}`, { method: 'DELETE' });
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Profile & Credentials</h1>

        <div className="space-y-5">
          {/* User Identity Card */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{user?.name || 'Loading...'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>
          </section>

          {/* Profile Details */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Personal Details</h2>
              {!editingProfile && (
                <button
                  onClick={() => {
                    setEditPhone(profile?.phone || '');
                    setEditingProfile(true);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary/10 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              profile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-background/50 px-4 py-3">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-background/50 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <p className="text-xs text-muted-foreground">Addresses</p>
                      </div>
                      {!showAddAddress && (
                        <button
                          onClick={() => setShowAddAddress(true)}
                          className="rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary/10 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {profile.addresses.length === 0 && !showAddAddress ? (
                      <p className="text-sm font-medium text-muted-foreground">None saved</p>
                    ) : (
                      <div className="space-y-2">
                        {profile.addresses.map((a, i) => (
                          <div
                            key={a.id || i}
                            className="flex items-start justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  {a.label}
                                </span>
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {[a.flatNo, a.line1, a.line2].filter(Boolean).join(', ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {[a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(a.id, i)}
                              className="ml-2 shrink-0 rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showAddAddress && (
                      <form onSubmit={handleAddAddress} className="mt-3 space-y-2.5 border-t border-border pt-3">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            placeholder="Label (Home, Office...)"
                            className="col-span-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            value={addressForm.flatNo || ''}
                            onChange={(e) => setAddressForm({ ...addressForm, flatNo: e.target.value })}
                            placeholder="Flat / House No."
                            className="col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <input
                          value={addressForm.line1}
                          onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                          placeholder="Address line 1 *"
                          required
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          value={addressForm.line2 || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                          placeholder="Address line 2 (optional)"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({
                              ...addressForm,
                              pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                              ...(e.target.value.replace(/\D/g, '').length < 6 ? { city: '', state: '' } : {}),
                            })}
                            placeholder="Pincode *"
                            required
                            maxLength={6}
                            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder="City"
                            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            placeholder="State"
                            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={savingAddress}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            {savingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddAddress(false); setAddressForm(emptyAddressForm); }}
                            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )
            )}
          </section>

          {/* Payment Methods */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Encrypted with AES-256-GCM. The AI never sees your card numbers.
                </p>
              </div>
              {!showAddCard && (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Add Card
                </button>
              )}
            </div>

            {credentials.length === 0 && !showAddCard ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <svg className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                <p className="text-sm text-muted-foreground">No payment methods saved</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Add a card to let ShofferAI handle payments for you
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3 transition-colors hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cred.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {cred.lastFour ? `•••• •••• •••• ${cred.lastFour}` : cred.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCredential(cred.id)}
                      className="rounded-lg px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddCard && (
              <form onSubmit={handleSaveCard} className="mt-4 space-y-3 border-t border-border pt-4">
                <input
                  value={cardForm.label}
                  onChange={(e) => setCardForm({ ...cardForm, label: e.target.value })}
                  placeholder="Card label (e.g., HDFC Visa)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  value={cardForm.nameOnCard}
                  onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                  placeholder="Name on card"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Card number"
                  required
                  maxLength={16}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                    placeholder="MM"
                    required
                    maxLength={2}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                    placeholder="YYYY"
                    required
                    maxLength={4}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                    placeholder="CVV"
                    required
                    maxLength={4}
                    type="password"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
