'use client';

import { useState, useEffect } from 'react';
import {
  AddressFormFields,
  EMPTY_ADDRESS_FORM,
  type AddressFormData,
} from '@/components/AddressFormFields';

interface Address {
  id?: string;
  label: string;
  name?: string;
  flatNo?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber?: string;
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [addressForm, setAddressForm] = useState<AddressFormData>(EMPTY_ADDRESS_FORM);
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
      label: addressForm.label || 'Home',
      name: addressForm.name?.trim() || undefined,
      line1: addressForm.line1.trim(),
      line2: addressForm.line2?.trim() || undefined,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      contactNumber: addressForm.contactNumber?.trim() || undefined,
    };
    const updatedAddresses = [...(profile?.addresses || []), newAddress];
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });
    const updated = await fetch('/api/profile').then((r) => r.json());
    setProfile(updated);
    setAddressForm(EMPTY_ADDRESS_FORM);
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

          {/* Saved Addresses */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Add Address
                </button>
              )}
            </div>

            {profile && profile.addresses.length === 0 && !showAddAddress && (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <svg className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-sm text-muted-foreground">No addresses saved</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Add an address for faster deliveries and bookings</p>
              </div>
            )}

            {profile && profile.addresses.length > 0 && (
              <div className="space-y-2">
                {profile.addresses.map((a, i) => (
                  <div
                    key={a.id || i}
                    className="group flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3 transition-colors hover:bg-background"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {a.label}
                          {a.name && (
                            <span className="ml-2 font-normal text-muted-foreground">· {a.name}</span>
                          )}
                          {a.contactNumber && (
                            <span className="ml-2 font-normal text-muted-foreground">· {a.contactNumber}</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[a.flatNo, a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(a.id, i)}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className={`space-y-3 ${profile && profile.addresses.length > 0 ? 'mt-4 border-t border-border pt-4' : ''}`}>
                <AddressFormFields
                  value={addressForm}
                  onChange={setAddressForm}
                  variant="page"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingAddress ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddAddress(false); setAddressForm(EMPTY_ADDRESS_FORM); }}
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
