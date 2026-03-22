'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Shared address form state & type                                   */
/* ------------------------------------------------------------------ */

export interface AddressFormData {
  label: string;
  name?: string;
  flatNo?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber?: string;
}

export const EMPTY_ADDRESS_FORM: AddressFormData = {
  label: 'Home',
  name: '',
  flatNo: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  contactNumber: '',
};

export const ADDRESS_LABELS = ['Home', 'Office', 'Other'] as const;
const ICONS: Record<string, string> = { Home: '🏠', Office: '🏢', Other: '📍' };

/* ------------------------------------------------------------------ */
/*  Pincode lookup hook (uses internal /api/pincode)                   */
/* ------------------------------------------------------------------ */

export function usePincodeLookup(
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

/* ------------------------------------------------------------------ */
/*  AddressFormFields — the unified field set                          */
/* ------------------------------------------------------------------ */

interface AddressFormFieldsProps {
  value: AddressFormData;
  onChange: (value: AddressFormData) => void;
  /** 'chat' = dark compact style, 'page' = standard card/form style */
  variant?: 'chat' | 'page';
  /** Hide the label row (e.g. when parent already shows label chips) */
  hideLabel?: boolean;
}

export function AddressFormFields({
  value,
  onChange,
  variant = 'page',
  hideLabel = false,
}: AddressFormFieldsProps) {
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-fill city/state from pincode
  const handlePincodeResult = useCallback(
    (city: string, state: string) => {
      onChange({ ...value, city: value.city || city, state: value.state || state });
    },
    // We intentionally only depend on pincode to avoid stale closures on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value.pincode],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPinError('');
    if (/^\d{6}$/.test(value.pincode)) {
      setPinLoading(true);
      timerRef.current = setTimeout(async () => {
        try {
          const r = await fetch(`/api/pincode?code=${value.pincode}`);
          const data = await r.json();
          if (data?.city) {
            handlePincodeResult(data.city, data.state);
          } else {
            setPinError('Not found — enter city & state manually');
          }
        } catch {
          setPinError('Lookup failed — enter manually');
        }
        setPinLoading(false);
      }, 300);
    } else {
      if (value.pincode.length < 6) {
        onChange({ ...value, city: '', state: '' });
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.pincode]);

  const set = (patch: Partial<AddressFormData>) => onChange({ ...value, ...patch });

  /* --- Style tokens by variant --- */
  const inp =
    variant === 'chat'
      ? 'w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all'
      : 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  const chipBase =
    variant === 'chat'
      ? 'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all'
      : 'rounded-full px-3 py-1.5 text-xs font-medium transition-all';

  const chipOn =
    variant === 'chat'
      ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
      : 'bg-primary/15 text-primary ring-1 ring-primary/40';

  const chipOff =
    variant === 'chat'
      ? 'bg-white/[0.05] text-white/40 hover:text-white/60'
      : 'bg-muted text-muted-foreground hover:text-foreground';

  const hintClass =
    variant === 'chat'
      ? 'text-[11px] text-white/30 -mt-1'
      : 'text-xs text-muted-foreground -mt-1';

  const errorClass =
    variant === 'chat'
      ? 'text-[11px] text-amber-400/80 -mt-1'
      : 'text-xs text-amber-500 -mt-1';

  return (
    <div className="flex flex-col gap-2">
      {/* Label chips */}
      {!hideLabel && (
        <div className="flex gap-1.5">
          {ADDRESS_LABELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => set({ label: l })}
              className={`${chipBase} ${value.label === l ? chipOn : chipOff}`}
            >
              {ICONS[l]} {l}
            </button>
          ))}
        </div>
      )}

      {/* Name + Phone row */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Contact name"
          value={value.name || ''}
          onChange={(e) => set({ name: e.target.value })}
          className={inp}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={value.contactNumber || ''}
          inputMode="tel"
          maxLength={10}
          onChange={(e) => set({ contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          className={inp}
        />
      </div>

      {/* Flat + Street row */}
      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <input
          type="text"
          placeholder="Flat / House #"
          value={value.flatNo || ''}
          onChange={(e) => set({ flatNo: e.target.value })}
          className={inp}
        />
        <input
          type="text"
          placeholder="Street, building, area *"
          value={value.line1}
          onChange={(e) => set({ line1: e.target.value })}
          className={inp}
        />
      </div>

      {/* Address line 2 */}
      <input
        type="text"
        placeholder="Landmark, nearby (optional)"
        value={value.line2 || ''}
        onChange={(e) => set({ line2: e.target.value })}
        className={inp}
      />

      {/* Pincode + City + State row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Pincode *"
            value={value.pincode}
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            className={inp}
          />
          {pinLoading && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30 animate-pulse">
              ···
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="City"
          value={value.city}
          onChange={(e) => set({ city: e.target.value })}
          className={inp}
        />
        <input
          type="text"
          placeholder="State"
          value={value.state}
          onChange={(e) => set({ state: e.target.value })}
          className={inp}
        />
      </div>

      {/* Pincode feedback */}
      {pinError && <p className={errorClass}>{pinError}</p>}
      {value.city && !pinLoading && !pinError && (
        <p className={hintClass}>📍 {[value.city, value.state].filter(Boolean).join(', ')}</p>
      )}
    </div>
  );
}
