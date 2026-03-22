'use client';

import { useState, useCallback } from 'react';
import { CardGridInput } from './CardGridInput';
import { CarouselInput } from './CarouselInput';
import { ChipBarInput } from './ChipBarInput';
import { AddressInput } from './AddressInput';
import { CalendarInput } from './CalendarInput';
import { StepperInput } from './StepperInput';
import { SliderInput } from './SliderInput';
import { TextInput } from './TextInput';

interface SectionConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  collapsed?: boolean;
  // Widget-specific props passed through
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
}

interface LayoutInputProps {
  sections: SectionConfig[];
  onSubmit: (value: string) => void;
}

export function LayoutInput({ sections, onSubmit }: LayoutInputProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) {
      init[s.name] = !s.collapsed;
    }
    return init;
  });

  const setSectionValue = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleSection = useCallback((name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const requiredSections = sections.filter(s => s.required === true);
  const allRequiredFilled = requiredSections.every(s => values[s.name]);

  const handleSubmit = () => {
    // Parse each section value from JSON string to object
    const result: Record<string, unknown> = {};
    for (const s of sections) {
      if (values[s.name]) {
        try {
          result[s.name] = JSON.parse(values[s.name]);
        } catch {
          result[s.name] = values[s.name];
        }
      }
    }
    onSubmit(JSON.stringify(result));
  };

  const renderSection = (section: SectionConfig) => {
    // Capture value without triggering parent submit — LayoutInput has its own submit
    const onSectionValue = (val: string) => setSectionValue(section.name, val);

    const completed = !!values[section.name];

    switch (section.type) {
      case 'card_grid':
        return (
          <CardGridInput
            cards={section.cards || []}
            showQuantity={section.show_quantity}
            allowCustom={section.allow_custom}
            multiSelect={section.multi_select}
            onSubmit={onSectionValue}
          />
        );
      case 'carousel':
        return (
          <CarouselInput
            cards={section.cards || []}
            multiSelect={section.multi_select}
            allowCustom={section.allow_custom}
            onSubmit={onSectionValue}
          />
        );
      case 'chip_bar':
        return (
          <ChipBarInput
            options={section.options || []}
            multiSelect={section.multi_select}
            onSubmit={onSectionValue}
            inline
          />
        );
      case 'address':
        return (
          <AddressInput
            saved={section.saved}
            onSubmit={onSectionValue}
          />
        );
      case 'calendar':
        return (
          <CalendarInput
            mode={section.mode}
            shortcuts={section.shortcuts}
            onSubmit={onSectionValue}
          />
        );
      case 'stepper':
        return (
          <StepperInput
            counters={section.counters || []}
            onSubmit={onSectionValue}
          />
        );
      case 'slider':
        return (
          <SliderInput
            min={section.min}
            max={section.max}
            step={section.step}
            presets={section.presets}
            onSubmit={onSectionValue}
          />
        );
      case 'text':
      case 'freetext':
        return (
          <TextInput
            placeholder={section.placeholder}
            formatHint={section.format_hint}
            onSubmit={onSectionValue}
          />
        );
      default:
        return (
          <TextInput
            placeholder={section.placeholder || 'Type your response...'}
            onSubmit={onSectionValue}
          />
        );
    }

    return null;
  };

  /** Show a human-readable summary of the completed value */
  function formatCompletedValue(raw: string): string {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.join(', ');
      if (typeof parsed === 'object' && parsed !== null) {
        // Address or complex object — show label or first value
        if (parsed.label) return `${parsed.label}${parsed.address ? ' — ' + parsed.address : ''}`;
        return Object.values(parsed).filter(Boolean).join(', ');
      }
      return String(parsed);
    } catch {
      return raw;
    }
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expanded[section.name];
        const completed = !!values[section.name];
        const isCollapsible = section.collapsed;
        const isRequired = section.required === true;

        return (
          <div key={section.name} className="space-y-2">
            {/* Section header */}
            <button
              type="button"
              onClick={() => isCollapsible ? toggleSection(section.name) : undefined}
              className={`flex w-full items-center gap-2 text-sm font-medium ${
                isCollapsible ? 'cursor-pointer hover:text-foreground' : 'cursor-default'
              } ${completed ? 'text-success' : 'text-foreground/70'}`}
            >
              {isCollapsible && (
                <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▸</span>
              )}
              <span>{section.label}</span>
              {isRequired && !completed && (
                <span className="text-xs text-destructive">*</span>
              )}
              {!isRequired && isCollapsible && !completed && !isExpanded && (
                <span className="text-[10px] text-muted-foreground/50 italic">optional</span>
              )}
              {completed && (
                <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Section content */}
            {isExpanded && !completed && (
              <div className="pl-1">
                {renderSection(section)}
              </div>
            )}

            {/* Completed summary — show selected value */}
            {completed && (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {formatCompletedValue(values[section.name])}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setValues(prev => {
                      const next = { ...prev };
                      delete next[section.name];
                      return next;
                    });
                    setExpanded(prev => ({ ...prev, [section.name]: true }));
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✎ Edit
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allRequiredFilled}
        className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  );
}
