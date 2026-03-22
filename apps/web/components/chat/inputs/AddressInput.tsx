'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AddressFormFields,
  EMPTY_ADDRESS_FORM,
  type AddressFormData,
} from '@/components/AddressFormFields';

interface SavedAddress {
  label: string;
  address: string;
  flatNo?: string;
  name?: string;
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

async function saveAddressToProfile(address: AddressFormData) {
  try {
    const res = await fetch('/api/profile');
    let addresses: SavedAddress[] = [];
    if (res.ok) {
      const p = await res.json();
      addresses = Array.isArray(p.addresses) ? p.addresses : [];
    }
    const fullAddress = [address.flatNo, address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ');
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

  const [form, setForm] = useState<AddressFormData>(EMPTY_ADDRESS_FORM);

  const handleSubmit = useCallback(() => {
    if (mode === 'saved' && selectedIdx !== null && addresses[selectedIdx]) {
      onSubmit(JSON.stringify(addresses[selectedIdx]));
    } else if (mode === 'new' && form.line1.trim() && form.pincode.trim()) {
      const obj = {
        ...form,
        label: form.label || 'Custom',
        name: form.name?.trim() || undefined,
        flatNo: form.flatNo?.trim() || undefined,
        line1: form.line1.trim(),
        line2: form.line2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        contactNumber: form.contactNumber?.trim() || undefined,
        address: [form.flatNo?.trim(), form.line1.trim(), form.line2?.trim(), form.city.trim(), form.state.trim(), form.pincode.trim()].filter(Boolean).join(', '),
      };
      onSubmit(JSON.stringify(obj));
      saveAddressToProfile(obj);
    }
  }, [mode, selectedIdx, addresses, form, onSubmit]);

  const canSubmit = (mode === 'saved' && selectedIdx !== null) || (mode === 'new' && form.line1.trim() && form.pincode.trim());

  const [showFade, setShowFade] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 4;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setShowFade(hasOverflow && !atBottom);
  }, []);

  useEffect(() => { checkScroll(); }, [addresses.length, checkScroll]);

  const hiddenCount = addresses.length > 3 && showFade ? addresses.length - 3 : 0;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Saved addresses — scrollable when many, with fade hint */}
      {addresses.length > 0 && (
        <div className="relative">
          <div
            ref={listRef}
            onScroll={checkScroll}
            className="flex flex-col gap-1.5 max-h-[11.5rem] overflow-y-auto overscroll-contain pr-0.5 scroll-smooth"
          >
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
          {showFade && (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent rounded-b-lg" />
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => listRef.current?.scrollBy({ top: 120, behavior: 'smooth' })}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[10px] text-white/50 hover:text-white/70 hover:bg-white/[0.12] transition-all backdrop-blur-sm"
                >
                  {hiddenCount} more ↓
                </button>
              )}
            </>
          )}
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

      {/* Address form — uses shared AddressFormFields */}
      {showNew && (
        <div className="rounded-lg bg-white/[0.02] p-3">
          <AddressFormFields
            value={form}
            onChange={(v) => { setForm(v); setMode('new'); }}
            variant="chat"
          />
        </div>
      )}

      {/* Submit */}
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
