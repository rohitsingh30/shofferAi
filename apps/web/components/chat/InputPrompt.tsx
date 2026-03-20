'use client';

import { useState, useRef, useEffect } from 'react';
import { CardGridInput } from './inputs/CardGridInput';
import { CarouselInput } from './inputs/CarouselInput';
import { ChipBarInput } from './inputs/ChipBarInput';
import { AddressInput } from './inputs/AddressInput';
import { CalendarInput } from './inputs/CalendarInput';
import { StepperInput } from './inputs/StepperInput';
import { SliderInput } from './inputs/SliderInput';
import { TextInput as RichTextInput } from './inputs/TextInput';
import { LayoutInput } from './inputs/LayoutInput';

interface InputPromptProps {
  question: string;
  inputType: string;
  options?: string[];
  onSubmit: (value: string) => void;
  // Rich input props
  cards?: Array<{ id: string; label: string; emoji?: string; image?: string; subtitle?: string; badge?: string }>;
  show_quantity?: boolean;
  allow_custom?: boolean;
  multi_select?: boolean;
  saved?: Array<{ label: string; address: string }>;
  mode?: 'single' | 'range';
  shortcuts?: string[];
  counters?: Array<{ label: string; min?: number; max?: number; default?: number }>;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  placeholder?: string;
  format_hint?: string;
  sections?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    collapsed?: boolean;
    cards?: Array<{ id: string; label: string; emoji?: string; image?: string; subtitle?: string; badge?: string }>;
    show_quantity?: boolean;
    allow_custom?: boolean;
    multi_select?: boolean;
    options?: string[];
    saved?: Array<{ label: string; address: string }>;
    mode?: 'single' | 'range';
    shortcuts?: string[];
    counters?: Array<{ label: string; min?: number; max?: number; default?: number }>;
    min?: number;
    max?: number;
    step?: number;
    presets?: number[];
    placeholder?: string;
    format_hint?: string;
  }>;
}

export function InputPrompt({ question, inputType, options, onSubmit, ...richProps }: InputPromptProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputType !== 'choice' && inputType !== 'confirmation' && !isRichType(inputType)) {
      inputRef.current?.focus();
    }
  }, [inputType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  // Strip bullet/number prefixes from question when showing options separately
  const cleanQuestion = options?.length
    ? question.split('\n').filter(l => !/^\s*(?:[•\-*]|\d+[.)]\s)/.test(l)).join('\n').trim()
    : question;

  // Pick icon based on type
  const icon = inputType === 'otp' ? (
    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ) : inputType === 'confirmation' ? (
    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );

  // Render rich input widget
  const renderRichInput = () => {
    switch (inputType) {
      case 'card_grid':
        return (
          <CardGridInput
            cards={richProps.cards || []}
            showQuantity={richProps.show_quantity}
            allowCustom={richProps.allow_custom}
            multiSelect={richProps.multi_select}
            onSubmit={onSubmit}
          />
        );
      case 'carousel':
        return (
          <CarouselInput
            cards={richProps.cards || []}
            multiSelect={richProps.multi_select}
            allowCustom={richProps.allow_custom}
            onSubmit={onSubmit}
          />
        );
      case 'chip_bar':
        return (
          <ChipBarInput
            options={options || []}
            multiSelect={richProps.multi_select}
            onSubmit={onSubmit}
          />
        );
      case 'address':
        return (
          <AddressInput
            saved={richProps.saved}
            onSubmit={onSubmit}
          />
        );
      case 'calendar':
        return (
          <CalendarInput
            mode={richProps.mode}
            shortcuts={richProps.shortcuts}
            onSubmit={onSubmit}
          />
        );
      case 'stepper':
        return (
          <StepperInput
            counters={richProps.counters || []}
            onSubmit={onSubmit}
          />
        );
      case 'slider':
        return (
          <SliderInput
            min={richProps.min}
            max={richProps.max}
            step={richProps.step}
            presets={richProps.presets}
            onSubmit={onSubmit}
          />
        );
      case 'text':
        return (
          <RichTextInput
            placeholder={richProps.placeholder}
            formatHint={richProps.format_hint}
            onSubmit={onSubmit}
          />
        );
      case 'layout':
        return (
          <LayoutInput
            sections={richProps.sections || []}
            onSubmit={onSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3.5">
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/20">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 rounded-2xl rounded-tl-md border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <p className="mb-3 whitespace-pre-wrap text-sm font-medium leading-relaxed">{cleanQuestion}</p>

        {/* Rich input types */}
        {isRichType(inputType) ? (
          renderRichInput()
        ) : inputType === 'choice' && options && options.length > 0 ? (
          /* Choice: clickable option cards */
          <div className="space-y-2">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => onSubmit(option)}
                className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm transition-all duration-150 hover:border-primary/40 hover:bg-primary/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white/20 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                  {i + 1}
                </span>
                <span className="text-foreground/80 transition-colors group-hover:text-foreground">
                  {option}
                </span>
                <svg className="ml-auto h-4 w-4 text-muted-foreground/0 transition-all group-hover:text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
            {/* Freetext fallback for choice */}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Or type something else..."
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        ) : inputType === 'confirmation' ? (
          /* Confirmation: Yes / Cancel */
          <div className="flex gap-2">
            <button
              onClick={() => onSubmit('yes')}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20"
            >
              Yes, proceed
            </button>
            <button
              onClick={() => onSubmit('no')}
              className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.06]"
            >
              Cancel
            </button>
          </div>
        ) : inputType === 'otp' ? (
          /* OTP: monospace 6-digit input */
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-40 rounded-lg border border-border bg-input px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={6}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              Verify
            </button>
          </form>
        ) : (
          /* Freetext: standard text input */
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 rounded-lg border border-border bg-input px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const RICH_TYPES = new Set(['card_grid', 'carousel', 'chip_bar', 'address', 'calendar', 'stepper', 'slider', 'text', 'layout']);
function isRichType(type: string): boolean {
  return RICH_TYPES.has(type);
}
