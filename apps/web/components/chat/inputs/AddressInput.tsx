'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SavedAddress {
  label: string;
  address: string;
  flatNo?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactNumber?: string;
}

interface AddressInputProps {
  saved?: SavedAddress[];
  onSubmit: (value: string) => void;
}

const ICON_MAP: Record<string, string> = { Home: '🏠', Office: '🏢', Other: '📍' };
const LABEL_PRESETS = ['Home', 'Office', 'Other'];

// Indian states list for autofill fallback
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu and Kashmir', 'Ladakh',
];

async function lookupPincode(pincode: string): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length) {
      const po = data[0].PostOffice[0];
      return { city: po.District || po.Division, state: po.State };
    }
  } catch {
    // Silently fail — user can still type manually
  }
  return null;
}

async function saveAddressToProfile(address: {
  label: string;
  flatNo?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber?: string;
}) {
  try {
    // Fetch current profile
    const profileRes = await fetch('/api/profile');
    let addresses: SavedAddress[] = [];
    if (profileRes.ok) {
      const profile = await profileRes.json();
      addresses = Array.isArray(profile.addresses) ? profile.addresses : [];
    }

    // Check for duplicate label — update if exists, append if not
    const existingIdx = addresses.findIndex(a => a.label === address.label);
    const fullAddress = [address.flatNo, address.line1, address.line2, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');
    const newEntry: SavedAddress = { ...address, address: fullAddress };

    if (existingIdx >= 0) {
      addresses[existingIdx] = newEntry;
    } else {
      addresses.push(newEntry);
    }

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses }),
    });
  } catch {
    // Non-blocking — address still gets used even if save fails
  }
}

export function AddressInput({ saved = [], onSubmit }: AddressInputProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(saved.length ? 0 : null);
  const [mode, setMode] = useState<'saved' | 'new'>(saved.length ? 'saved' : 'new');
  const [showNewForm, setShowNewForm] = useState(!saved.length);

  // Structured form fields
  const [label, setLabel] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const pincodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autofill city/state from pincode
  useEffect(() => {
    if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
    setPincodeError('');

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      pincodeTimerRef.current = setTimeout(async () => {
        const result = await lookupPincode(pincode);
        if (result) {
          setCity(result.city);
          setState(result.state);
        } else {
          setPincodeError('Could not find pincode — please enter city & state manually');
        }
        setPincodeLoading(false);
      }, 300);
    }

    return () => { if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current); };
  }, [pincode]);

  const handleSubmit = useCallback(() => {
    if (mode === 'saved' && selectedIdx !== null && saved[selectedIdx]) {
      onSubmit(JSON.stringify(saved[selectedIdx]));
    } else if (mode === 'new' && line1.trim() && city.trim() && pincode.trim()) {
      const addressObj = {
        label: label.trim() || 'Custom',
        flatNo: flatNo.trim() || undefined,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        contactNumber: contactNumber.trim() || undefined,
        address: [flatNo.trim(), line1.trim(), line2.trim(), city.trim(), state.trim(), pincode.trim()]
          .filter(Boolean)
          .join(', '),
      };
      onSubmit(JSON.stringify(addressObj));
      // Auto-save in background
      saveAddressToProfile(addressObj);
    }
  }, [mode, selectedIdx, saved, label, flatNo, line1, line2, city, state, pincode, contactNumber, onSubmit]);

  const canSubmit =
    (mode === 'saved' && selectedIdx !== null) ||
    (mode === 'new' && line1.trim() && city.trim() && pincode.trim());

  const inputClass =
    'w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors';

  return (
    <div className="flex flex-col gap-3">
      {/* Saved addresses */}
      {saved.length > 0 && (
        <div className="flex flex-col gap-2">
          {saved.map((entry, i) => {
            const selected = mode === 'saved' && selectedIdx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedIdx(i); setMode('saved'); setShowNewForm(false); }}
                className={`rounded-lg border p-3 cursor-pointer transition-all flex items-start gap-3 text-left ${
                  selected
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]'
                }`}
              >
                {/* Radio dot */}
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? 'border-primary' : 'border-white/30'
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>

                <span className="text-2xl leading-none">{ICON_MAP[entry.label] ?? '🏠'}</span>

                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-white">{entry.label}</span>
                  <span className="text-xs text-white/50 line-clamp-2">{entry.address}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add new address toggle */}
      <button
        type="button"
        onClick={() => {
          const willShow = !showNewForm;
          setShowNewForm(willShow);
          if (willShow) setMode('new');
          else if (saved.length) setMode('saved');
        }}
        className={`rounded-lg border border-dashed p-3 text-sm text-left transition-all ${
          showNewForm
            ? 'border-primary/60 bg-primary/10 text-white'
            : 'border-white/[0.15] bg-white/[0.02] text-white/60 hover:text-white/80'
        }`}
      >
        {showNewForm ? '− Cancel new address' : '+ Add new address'}
      </button>

      {/* Structured address form */}
      {showNewForm && (
        <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
          {/* Label presets */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Save as</label>
            <div className="flex gap-2">
              {LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLabel(preset)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    label === preset
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80'
                  }`}
                >
                  {ICON_MAP[preset] ?? '📍'} {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Flat / House No */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Flat / House No.</label>
            <input
              type="text"
              placeholder="e.g. A-302, Flat 12B"
              value={flatNo}
              onChange={(e) => { setFlatNo(e.target.value); setMode('new'); }}
              className={inputClass}
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              Address Line 1 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Street, building, society name"
              value={line1}
              onChange={(e) => { setLine1(e.target.value); setMode('new'); }}
              className={inputClass}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Address Line 2</label>
            <input
              type="text"
              placeholder="Area, landmark (optional)"
              value={line2}
              onChange={(e) => { setLine2(e.target.value); setMode('new'); }}
              className={inputClass}
            />
          </div>

          {/* Pincode + City row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Pincode <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(val);
                    setMode('new');
                  }}
                  inputMode="numeric"
                  maxLength={6}
                  className={inputClass}
                />
                {pincodeLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                    ⏳
                  </span>
                )}
              </div>
              {pincodeError && (
                <p className="mt-1 text-xs text-amber-400">{pincodeError}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                City <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={pincodeLoading ? 'Auto-filling…' : 'City / District'}
                value={city}
                onChange={(e) => { setCity(e.target.value); setMode('new'); }}
                className={inputClass}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">State</label>
            <input
              type="text"
              placeholder={pincodeLoading ? 'Auto-filling…' : 'State'}
              value={state}
              onChange={(e) => { setState(e.target.value); setMode('new'); }}
              list="state-suggestions"
              className={inputClass}
            />
            <datalist id="state-suggestions">
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Contact Number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Contact Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={contactNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setContactNumber(val);
                setMode('new');
              }}
              inputMode="tel"
              maxLength={10}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40 self-end"
      >
        Continue →
      </button>
    </div>
  );
}
