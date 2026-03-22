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

const ICONS: Record<string, string> = { Home: '🏠', Office: '🏢', Other: '📍' };
const LABELS = ['Home', 'Office', 'Other'] as const;

async function lookupPincode(pin: string): Promise<{ city: string; state: string } | null> {
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const d = await r.json();
    if (d?.[0]?.Status === 'Success' && d[0].PostOffice?.length) {
      const po = d[0].PostOffice[0];
      return { city: po.District || po.Division, state: po.State };
    }
  } catch { /* user can type manually */ }
  return null;
}

async function saveAddressToProfile(address: {
  label: string; flatNo?: string; line1: string;
  city: string; state: string; pincode: string; contactNumber?: string;
}) {
  try {
    const res = await fetch('/api/profile');
    let addresses: SavedAddress[] = [];
    if (res.ok) {
      const p = await res.json();
      addresses = Array.isArray(p.addresses) ? p.addresses : [];
    }
    const fullAddress = [address.flatNo, address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ');
    const entry: SavedAddress = { ...address, address: fullAddress };
    const idx = addresses.findIndex(a => a.label === address.label);
    if (idx >= 0) addresses[idx] = entry; else addresses.push(entry);
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addresses }) });
  } catch { /* non-blocking */ }
}

export function AddressInput({ saved: savedProp = [], onSubmit }: AddressInputProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(savedProp);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(savedProp.length ? 0 : null);
  const [mode, setMode] = useState<'saved' | 'new'>(savedProp.length ? 'saved' : 'new');
  const [showNew, setShowNew] = useState(!savedProp.length);

  // Fallback: fetch saved addresses from profile if none provided by LLM
  useEffect(() => {
    if (savedProp.length > 0) return;
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        const fetched: SavedAddress[] = Array.isArray(p?.addresses) ? p.addresses : [];
        if (fetched.length > 0) {
          setAddresses(fetched);
          setSelectedIdx(0);
          setMode('saved');
          setShowNew(false);
        }
      })
      .catch(() => { /* non-blocking */ });
  }, [savedProp.length]);

  const [label, setLabel] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPinError('');
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPinLoading(true);
      timerRef.current = setTimeout(async () => {
        const r = await lookupPincode(pincode);
        if (r) { setCity(r.city); setState(r.state); }
        else setPinError('Not found — enter city manually');
        setPinLoading(false);
      }, 300);
    } else { setCity(''); setState(''); }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pincode]);

  const handleSubmit = useCallback(() => {
    if (mode === 'saved' && selectedIdx !== null && addresses[selectedIdx]) {
      onSubmit(JSON.stringify(addresses[selectedIdx]));
    } else if (mode === 'new' && line1.trim() && pincode.trim()) {
      const obj = {
        label: label.trim() || 'Custom',
        flatNo: flatNo.trim() || undefined,
        line1: line1.trim(),
        city: city.trim(), state: state.trim(), pincode: pincode.trim(),
        contactNumber: contactNumber.trim() || undefined,
        address: [flatNo.trim(), line1.trim(), city.trim(), state.trim(), pincode.trim()].filter(Boolean).join(', '),
      };
      onSubmit(JSON.stringify(obj));
      saveAddressToProfile(obj);
    }
  }, [mode, selectedIdx, addresses, label, flatNo, line1, city, state, pincode, contactNumber, onSubmit]);

  const canSubmit = (mode === 'saved' && selectedIdx !== null) || (mode === 'new' && line1.trim() && pincode.trim());

  const inp = 'w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all';

  return (
    <div className="flex flex-col gap-2.5">
      {/* Saved addresses — scrollable when many */}
      {addresses.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto overscroll-contain pr-0.5">
          {addresses.map((entry, i) => {
            const on = mode === 'saved' && selectedIdx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedIdx(i); setMode('saved'); setShowNew(false); }}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all ${
                  on ? 'bg-primary/12 ring-1 ring-primary/40' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                  on ? 'border-primary bg-primary' : 'border-white/25'
                }`}>
                  {on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-base leading-none">{ICONS[entry.label] ?? '🏠'}</span>
                <span className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-white">{entry.label}</span>
                  <span className="ml-2 text-xs text-white/40 line-clamp-1">{entry.address}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* New address toggle */}
      <button
        type="button"
        onClick={() => { setShowNew(v => !v); if (!showNew) setMode('new'); else if (addresses.length) setMode('saved'); }}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
          showNew ? 'text-primary' : 'text-white/40 hover:text-white/60'
        }`}
      >
        <span className={`transition-transform ${showNew ? 'rotate-45' : ''}`}>+</span>
        <span>{showNew ? 'Cancel' : 'New address'}</span>
      </button>

      {/* Compact form */}
      {showNew && (
        <div className="flex flex-col gap-2 rounded-lg bg-white/[0.02] p-3">
          {/* Label chips */}
          <div className="flex gap-1.5">
            {LABELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  label === l
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                    : 'bg-white/[0.05] text-white/40 hover:text-white/60'
                }`}
              >
                {ICONS[l]} {l}
              </button>
            ))}
          </div>

          {/* Flat + Address on same conceptual group */}
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <input type="text" placeholder="Flat / House #" value={flatNo}
              onChange={e => { setFlatNo(e.target.value); setMode('new'); }} className={inp} />
            <input type="text" placeholder="Street, building, area *" value={line1}
              onChange={e => { setLine1(e.target.value); setMode('new'); }} className={inp} />
          </div>

          {/* Pincode + Contact row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input type="text" placeholder="Pincode *" value={pincode} inputMode="numeric" maxLength={6}
                onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setMode('new'); }} className={inp} />
              {pinLoading && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30 animate-pulse">···</span>}
            </div>
            <input type="tel" placeholder="Phone (optional)" value={contactNumber} inputMode="tel" maxLength={10}
              onChange={e => { setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setMode('new'); }} className={inp} />
          </div>

          {/* Pincode result or error — single line */}
          {pinError && <p className="text-[11px] text-amber-400/80 -mt-1">{pinError}</p>}
          {city && !pinLoading && (
            <p className="text-[11px] text-white/30 -mt-1">📍 {[city, state].filter(Boolean).join(', ')}</p>
          )}
        </div>
      )}

      {/* Submit — inline right */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="self-end rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-30"
      >
        Continue →
      </button>
    </div>
  );
}
