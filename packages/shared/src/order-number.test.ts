import { describe, it, expect } from 'vitest';
import { generateOrderNumber } from './order-number';

describe('generateOrderNumber', () => {
  it('matches SHOF-YYYYMMDD-XXXX format', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^SHOF-\d{8}-[0-9A-F]{4}$/);
  });

  it('uses today\'s date', () => {
    const num = generateOrderNumber();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(num).toContain(today);
  });

  it('generates distinct numbers (high probability)', () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 50; i++) {
      numbers.add(generateOrderNumber());
    }
    // With 65K combinations per day, 50 should almost always be unique
    expect(numbers.size).toBeGreaterThanOrEqual(48);
  });
});
