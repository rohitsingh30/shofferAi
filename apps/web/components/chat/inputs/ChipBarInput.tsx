'use client';

import { useState, useEffect, useRef } from 'react';

interface ChipBarInputProps {
  options: string[];
  multiSelect?: boolean;
  onSubmit: (value: string) => void;
  /** When true, hides the submit button and auto-submits on selection (used inside LayoutInput) */
  inline?: boolean;
}

export function ChipBarInput({
  options,
  multiSelect = true,
  onSubmit,
  inline = false,
}: ChipBarInputProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const didSubmit = useRef(false);

  function toggle(option: string) {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      );
    } else {
      setSelected((prev) => (prev[0] === option ? [] : [option]));
    }
  }

  // Auto-submit when inline (inside LayoutInput) — fires on every selection change
  useEffect(() => {
    if (!inline || selected.length === 0) return;
    // Small debounce so user can multi-select quickly
    const timer = setTimeout(() => {
      onSubmit(multiSelect ? JSON.stringify(selected) : selected[0]);
    }, 400);
    return () => clearTimeout(timer);
  }, [inline, selected, multiSelect, onSubmit]);

  function handleSubmit() {
    if (selected.length === 0) return;
    onSubmit(
      multiSelect ? JSON.stringify(selected) : selected[0],
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={
                active
                  ? 'rounded-full border border-primary bg-primary/20 text-primary px-4 py-2 text-sm font-medium transition-all'
                  : 'rounded-full border border-white/[0.15] bg-white/[0.03] px-4 py-2 text-sm text-foreground/70 cursor-pointer transition-all hover:border-primary/40'
              }
            >
              {active ? `✓ ${option}` : option}
            </button>
          );
        })}
      </div>

      {!inline && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="mt-3 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      )}
    </div>
  );
}
