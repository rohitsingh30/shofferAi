import { describe, it, expect } from 'vitest';
import {
  isDateParam,
  generateDateVariants,
  detectTemplateBindings,
  templatizeArgs,
  resolveTemplateArgs,
} from './template';

describe('isDateParam', () => {
  it('returns true for date-related param names', () => {
    expect(isDateParam('checkin')).toBe(true);
    expect(isDateParam('checkout')).toBe(true);
    expect(isDateParam('check_in')).toBe(true);
    expect(isDateParam('check_out')).toBe(true);
    expect(isDateParam('date')).toBe(true);
    expect(isDateParam('departure')).toBe(true);
    expect(isDateParam('arrival')).toBe(true);
  });

  it('returns false for non-date params', () => {
    expect(isDateParam('destination')).toBe(false);
    expect(isDateParam('guests')).toBe(false);
    expect(isDateParam('budget')).toBe(false);
  });
});

describe('generateDateVariants', () => {
  it('generates multiple format variants for a date', () => {
    const variants = generateDateVariants('2026-03-15');
    expect(variants).toContain('2026-03-15');
    expect(variants).toContain('March 15');
    expect(variants).toContain('15 Mar');
    expect(variants).toContain('Mar 15, 2026');
    expect(variants).toContain('15/03/2026');
    expect(variants).toContain('03/15/2026');
  });

  it('returns only input for invalid date', () => {
    const variants = generateDateVariants('not-a-date');
    expect(variants).toEqual(['not-a-date']);
  });

  it('returns unique variants', () => {
    const variants = generateDateVariants('2026-03-15');
    const unique = new Set(variants);
    expect(unique.size).toBe(variants.length);
  });
});

describe('detectTemplateBindings', () => {
  it('detects exact match binding', () => {
    const bindings = detectTemplateBindings(
      { text: 'Mumbai' },
      { destination: 'Mumbai' }
    );
    expect(bindings.text).toBe('destination');
  });

  it('detects substring match binding', () => {
    const bindings = detectTemplateBindings(
      { url: 'https://booking.com/search?ss=Mumbai' },
      { destination: 'Mumbai' }
    );
    expect(bindings.url).toBe('destination:substring');
  });

  it('detects date variant binding', () => {
    const bindings = detectTemplateBindings(
      { text: 'March 15' },
      { checkin: '2026-03-15' }
    );
    expect(bindings.text).toBe('checkin:date');
  });

  it('returns null for non-matching args', () => {
    const bindings = detectTemplateBindings(
      { ref: 'abc123', element: 'button' },
      { destination: 'Mumbai' }
    );
    expect(bindings.ref).toBeNull();
    expect(bindings.element).toBeNull();
  });

  it('returns null for non-string values', () => {
    const bindings = detectTemplateBindings(
      { count: 5 },
      { guests: '2' }
    );
    expect(bindings.count).toBeNull();
  });
});

describe('templatizeArgs', () => {
  it('replaces param values with {{param}} placeholders', () => {
    const result = templatizeArgs(
      { text: 'Mumbai' },
      { text: 'destination' },
      { destination: 'Mumbai' }
    );
    expect(result.text).toBe('{{destination}}');
  });

  it('replaces substring matches', () => {
    const result = templatizeArgs(
      { url: 'https://booking.com/search?ss=Mumbai' },
      { url: 'destination:substring' },
      { destination: 'Mumbai' }
    );
    expect(result.url).toBe('https://booking.com/search?ss={{destination}}');
  });

  it('replaces date variant matches', () => {
    const result = templatizeArgs(
      { text: 'Arriving March 15' },
      { text: 'checkin:date' },
      { checkin: '2026-03-15' }
    );
    expect(result.text).toBe('Arriving {{checkin}}');
  });

  it('leaves null-bound args unchanged', () => {
    const result = templatizeArgs(
      { ref: 'abc', text: 'Mumbai' },
      { ref: null, text: 'destination' },
      { destination: 'Mumbai' }
    );
    expect(result.ref).toBe('abc');
  });
});

describe('resolveTemplateArgs', () => {
  it('replaces {{param}} with actual values', () => {
    const result = resolveTemplateArgs(
      { text: '{{destination}}', url: 'https://booking.com/search?ss={{destination}}' },
      { destination: 'Goa' }
    );
    expect(result.text).toBe('Goa');
    expect(result.url).toBe('https://booking.com/search?ss=Goa');
  });

  it('handles multiple params in one string', () => {
    const result = resolveTemplateArgs(
      { url: 'checkin={{checkin}}&checkout={{checkout}}' },
      { checkin: '2026-04-01', checkout: '2026-04-03' }
    );
    expect(result.url).toBe('checkin=2026-04-01&checkout=2026-04-03');
  });

  it('leaves non-template values unchanged', () => {
    const result = resolveTemplateArgs(
      { ref: 'abc', count: 5 },
      { destination: 'Mumbai' }
    );
    expect(result.ref).toBe('abc');
    expect(result.count).toBe(5);
  });
});
