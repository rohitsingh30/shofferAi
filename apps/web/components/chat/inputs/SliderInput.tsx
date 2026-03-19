'use client';

import { useState } from 'react';

interface SliderInputProps {
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  onSubmit: (value: string) => void;
}

function formatValue(v: number): string {
  const formatted = v.toLocaleString('en-IN');
  return v >= 100 ? `₹${formatted}` : formatted;
}

export function SliderInput({
  min = 0,
  max = 100,
  step = 1,
  presets,
  onSubmit,
}: SliderInputProps) {
  const [value, setValue] = useState(min);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#7c5cfc]"
        />
        <span className="min-w-20 text-right text-xl font-semibold text-white">
          {formatValue(value)}
        </span>
      </div>

      <div className="flex justify-between text-xs text-white/40">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                value === p
                  ? 'bg-[#7c5cfc] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {formatValue(p)}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onSubmit(String(value))}
        className="mt-1 w-full rounded-lg bg-[#7c5cfc] py-2 text-sm font-medium text-white transition hover:bg-[#6a4be0]"
      >
        Continue →
      </button>
    </div>
  );
}
