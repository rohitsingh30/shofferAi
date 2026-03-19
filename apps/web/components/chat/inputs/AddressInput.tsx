'use client';

import { useState, useCallback } from 'react';

interface AddressInputProps {
  saved?: Array<{ label: string; address: string }>;
  onSubmit: (value: string) => void;
}

const ICON_MAP: Record<string, string> = { Home: '🏠', Office: '🏢' };

export function AddressInput({ saved = [], onSubmit }: AddressInputProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(saved.length ? 0 : null);
  const [mode, setMode] = useState<'saved' | 'location' | 'new'>('saved');
  const [locating, setLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMode('location');
      return;
    }
    setLocating(true);
    setMode('location');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationAddress(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
    );
  }, []);

  const handleSubmit = () => {
    if (mode === 'new' && newAddress.trim()) {
      onSubmit(JSON.stringify({ label: newLabel.trim() || 'Custom', address: newAddress.trim() }));
    } else if (mode === 'location' && locationAddress.trim()) {
      onSubmit(JSON.stringify({ label: 'Current Location', address: locationAddress.trim() }));
    } else if (mode === 'saved' && selectedIdx !== null && saved[selectedIdx]) {
      onSubmit(JSON.stringify(saved[selectedIdx]));
    }
  };

  const canSubmit =
    (mode === 'saved' && selectedIdx !== null) ||
    (mode === 'location' && locationAddress.trim().length > 0) ||
    (mode === 'new' && newAddress.trim().length > 0);

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
                    : 'border-white/[0.08] bg-white/[0.03]'
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

      {/* Current location */}
      <button
        type="button"
        onClick={handleCurrentLocation}
        className={`rounded-lg border border-dashed p-3 text-sm text-left transition-all ${
          mode === 'location'
            ? 'border-primary/60 bg-primary/10 text-white'
            : 'border-white/[0.15] bg-white/[0.02] text-white/60 hover:text-white/80'
        }`}
      >
        {locating ? '📍 Detecting location…' : '📍 Use current location'}
      </button>

      {mode === 'location' && !locating && (
        <input
          type="text"
          placeholder="Enter address or coordinates"
          value={locationAddress}
          onChange={(e) => setLocationAddress(e.target.value)}
          className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60"
        />
      )}

      {/* Add new address toggle */}
      <button
        type="button"
        onClick={() => { setShowNewForm((v) => !v); if (!showNewForm) setMode('new'); }}
        className="text-sm text-white/50 hover:text-white/80 text-left transition-colors"
      >
        {showNewForm ? '− Cancel new address' : '+ Add new address'}
      </button>

      {showNewForm && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Label (e.g. Home, Office)"
            value={newLabel}
            onChange={(e) => { setNewLabel(e.target.value); setMode('new'); }}
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60"
          />
          <textarea
            placeholder="Full address"
            rows={3}
            value={newAddress}
            onChange={(e) => { setNewAddress(e.target.value); setMode('new'); }}
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 resize-none"
          />
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
