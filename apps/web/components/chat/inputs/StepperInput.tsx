'use client';

import { useState } from 'react';

interface StepperInputProps {
  counters: Array<{ label: string; min?: number; max?: number; default?: number }>;
  onSubmit: (value: string) => void;
}

export function StepperInput({ counters, onSubmit }: StepperInputProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(counters.map((c) => [c.label, c.default ?? c.min ?? 0]))
  );

  const update = (label: string, delta: number, min: number, max: number) => {
    setValues((prev) => ({
      ...prev,
      [label]: Math.min(max, Math.max(min, (prev[label] ?? 0) + delta)),
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      {counters.map((c) => {
        const min = c.min ?? 0;
        const max = c.max ?? 99;
        const val = values[c.label] ?? 0;

        return (
          <div key={c.label} className="flex items-center justify-between">
            <span className="text-sm text-white/80">{c.label}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update(c.label, -1, min, max)}
                disabled={val <= min}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]/30 disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-8 text-center text-lg font-medium text-white">
                {val}
              </span>

              <button
                type="button"
                onClick={() => update(c.label, 1, min, max)}
                disabled={val >= max}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-medium text-white transition hover:bg-[var(--color-primary)]/30 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onSubmit(JSON.stringify(values))}
        className="mt-1 w-full rounded-lg bg-[#7c5cfc] py-2 text-sm font-medium text-white transition hover:bg-[#6a4be0]"
      >
        Continue →
      </button>
    </div>
  );
}
