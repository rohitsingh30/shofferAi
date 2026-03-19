'use client';

import { useEffect, useRef, useState } from 'react';

interface TextInputProps {
  placeholder?: string;
  formatHint?: string;
  onSubmit: (value: string) => void;
}

export function TextInput({ placeholder, formatHint, onSubmit }: TextInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#7c5cfc]"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="shrink-0 rounded-lg bg-[#7c5cfc] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6a4be0] disabled:opacity-40"
        >
          Send
        </button>
      </div>

      {formatHint && (
        <p className="text-xs text-white/40">{formatHint}</p>
      )}
    </div>
  );
}
