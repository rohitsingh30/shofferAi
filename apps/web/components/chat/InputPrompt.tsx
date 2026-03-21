'use client';

import { useState, useRef, useEffect } from 'react';
import { renderMarkdown } from './render-markdown';
import { CardGridInput } from './inputs/CardGridInput';
import { CarouselInput } from './inputs/CarouselInput';
import { ChipBarInput } from './inputs/ChipBarInput';
import { AddressInput } from './inputs/AddressInput';
import { CalendarInput } from './inputs/CalendarInput';
import { StepperInput } from './inputs/StepperInput';
import { SliderInput } from './inputs/SliderInput';
import { TextInput as RichTextInput } from './inputs/TextInput';
import { LayoutInput } from './inputs/LayoutInput';
import { ProductCardInput } from './inputs/ProductCardInput';
import type { ProductCardData } from '@shofferai/shared';

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
  product?: ProductCardData;
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
      case 'card_grid': {
        const cards = richProps.cards || [];
        // Fallback: if card_grid requested but no cards data, parse numbered items
        // from the question text and render as multi-select choice buttons
        if (cards.length === 0 && question) {
          const parsed = question.split(/\n/).filter((l: string) => /^\s*\d+[.)]\s/.test(l))
            .map((l: string, i: number) => ({
              id: String(i + 1),
              label: l.replace(/^\s*\d+[.)]\s*/, '').trim(),
            }));
          if (parsed.length >= 2) {
            return (
              <CardGridInput
                cards={parsed}
                showQuantity={richProps.show_quantity ?? true}
                allowCustom={richProps.allow_custom}
                multiSelect={richProps.multi_select ?? true}
                onSubmit={onSubmit}
              />
            );
          }
        }
        return (
          <CardGridInput
            cards={cards}
            showQuantity={richProps.show_quantity}
            allowCustom={richProps.allow_custom}
            multiSelect={richProps.multi_select}
            onSubmit={onSubmit}
          />
        );
      }
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
      case 'product_card':
        return richProps.product ? (
          <ProductCardInput
            product={richProps.product}
            onSubmit={onSubmit}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3.5">
      {/* Icon — uses violet to match the theme, amber only for OTP */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-md ${
        inputType === 'otp'
          ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
          : inputType === 'confirmation'
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20'
          : 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/20'
      }`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 rounded-2xl rounded-tl-md bg-white/[0.03] ring-1 ring-white/[0.06] overflow-hidden">
        <div className="p-4">
          <p className="mb-3 whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-zinc-200">{renderMarkdown(cleanQuestion)}</p>

          {/* Rich input types */}
          {isRichType(inputType) ? (
            renderRichInput()
          ) : inputType === 'choice' && options && options.length > 0 ? (
            /* Choice: clickable option cards */
            <div className="space-y-1.5">
              {options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => onSubmit(option)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.06] active:scale-[0.99]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-zinc-400 transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                    {i + 1}
                  </span>
                  <span className="text-zinc-300 transition-colors group-hover:text-white">
                    {option}
                  </span>
                  <svg className="ml-auto h-4 w-4 text-transparent transition-all group-hover:text-primary/60 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-30"
                >
                  Send
                </button>
              </form>
            </div>
          ) : inputType === 'confirmation' ? (
            /* Confirmation: Yes / Cancel */
            <div className="flex gap-2.5">
              <button
                onClick={() => onSubmit('yes')}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
              >
                ✓ Yes, proceed
              </button>
              <button
                onClick={() => onSubmit('no')}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          ) : inputType === 'otp' ? (
            /* OTP: monospace 6-digit input */
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-44 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-center font-mono text-xl tracking-[0.5em] text-white placeholder:text-zinc-700 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-30"
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
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-30"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const RICH_TYPES = new Set(['card_grid', 'carousel', 'chip_bar', 'address', 'calendar', 'stepper', 'slider', 'text', 'layout', 'product_card']);
function isRichType(type: string): boolean {
  return RICH_TYPES.has(type);
}
