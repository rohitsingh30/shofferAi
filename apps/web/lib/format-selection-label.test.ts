import { describe, it, expect } from 'vitest';
import { formatSelectionLabel } from './format-selection-label';

describe('formatSelectionLabel', () => {
  // ── Card-based inputs (card_grid, carousel, product_card) ──
  describe('card selection', () => {
    const cards = [
      { id: 'milk-1', label: 'Amul Taaza 500ml' },
      { id: 'milk-2', label: 'Mother Dairy Full Cream 1L' },
    ];

    it('returns card label when card id matches', () => {
      expect(
        formatSelectionLabel({ inputType: 'card_grid', cards }, 'milk-1'),
      ).toBe('Amul Taaza 500ml');
    });

    it('returns card label for carousel', () => {
      expect(
        formatSelectionLabel({ inputType: 'carousel', cards }, 'milk-2'),
      ).toBe('Mother Dairy Full Cream 1L');
    });

    it('returns raw value when card id not found', () => {
      expect(
        formatSelectionLabel({ inputType: 'card_grid', cards }, 'unknown-id'),
      ).toBe('unknown-id');
    });
  });

  // ── Choice / chip_bar (1-based index) ──
  describe('option selection', () => {
    const options = ['Red', 'Green', 'Blue'];

    it('returns option text for 1-based index', () => {
      expect(
        formatSelectionLabel({ inputType: 'choice', options }, '2'),
      ).toBe('Green');
    });

    it('returns raw value for out-of-range index', () => {
      expect(
        formatSelectionLabel({ inputType: 'choice', options }, '99'),
      ).toBe('99');
    });

    it('works for chip_bar type too', () => {
      expect(
        formatSelectionLabel({ inputType: 'chip_bar', options }, '1'),
      ).toBe('Red');
    });
  });

  // ── Address ── THE BUG THIS SUITE WAS CREATED TO CATCH
  describe('address selection', () => {
    it('formats address with label and address', () => {
      const value = JSON.stringify({
        label: 'Home',
        address: 'C 502, Honer Aquantis, Tellapur, K.V.Rangareddy, Telangana, 500019',
      });
      expect(
        formatSelectionLabel({ inputType: 'address' }, value),
      ).toBe('📍 Home — C 502, Honer Aquantis, Tellapur, K.V.Rangareddy, Telangana, 500019');
    });

    it('formats address without label', () => {
      const value = JSON.stringify({
        address: '42 MG Road, Bengaluru, 560001',
      });
      expect(
        formatSelectionLabel({ inputType: 'address' }, value),
      ).toBe('📍 42 MG Road, Bengaluru, 560001');
    });

    it('never shows raw JSON for a valid address object', () => {
      const value = JSON.stringify({
        label: 'Work',
        address: '123 Tech Park',
        flatNo: 'B-301',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
      });
      const result = formatSelectionLabel({ inputType: 'address' }, value);
      expect(result).not.toContain('{');
      expect(result).not.toContain('}');
      expect(result).toContain('Work');
    });

    it('falls back gracefully for non-JSON address value', () => {
      expect(
        formatSelectionLabel({ inputType: 'address' }, 'some plain text address'),
      ).toBe('some plain text address');
    });
  });

  // ── Calendar / date ──
  describe('calendar selection', () => {
    it('formats date range', () => {
      const value = JSON.stringify({ start: '2026-03-22', end: '2026-03-25' });
      expect(
        formatSelectionLabel({ inputType: 'calendar' }, value),
      ).toBe('📅 2026-03-22 → 2026-03-25');
    });

    it('formats single date from JSON', () => {
      const value = JSON.stringify({ start: '2026-03-22' });
      expect(
        formatSelectionLabel({ inputType: 'calendar' }, value),
      ).toBe('📅 2026-03-22');
    });

    it('formats plain date string', () => {
      expect(
        formatSelectionLabel({ inputType: 'calendar' }, '2026-03-22'),
      ).toBe('📅 2026-03-22');
    });
  });

  // ── Stepper / counter ──
  describe('stepper selection', () => {
    it('formats counter values', () => {
      const value = JSON.stringify({ Adults: 2, Children: 1, Infants: 0 });
      expect(
        formatSelectionLabel({ inputType: 'stepper' }, value),
      ).toBe('2 Adults, 1 Children');
    });

    it('handles single counter', () => {
      const value = JSON.stringify({ Guests: 3 });
      expect(
        formatSelectionLabel({ inputType: 'stepper' }, value),
      ).toBe('3 Guests');
    });
  });

  // ── Confirmation ──
  describe('confirmation', () => {
    it('formats true as Yes', () => {
      expect(
        formatSelectionLabel({ inputType: 'confirmation' }, 'true'),
      ).toBe('✅ Yes');
    });

    it('formats false as No', () => {
      expect(
        formatSelectionLabel({ inputType: 'confirmation' }, 'false'),
      ).toBe('❌ No');
    });
  });

  // ── Fallback: unknown JSON ──
  describe('unknown JSON fallback', () => {
    it('extracts label from unknown JSON object', () => {
      const value = JSON.stringify({ label: 'Express Delivery', eta: '30min' });
      expect(
        formatSelectionLabel({ inputType: 'some_new_type' }, value),
      ).toBe('Express Delivery');
    });

    it('extracts name from unknown JSON object', () => {
      const value = JSON.stringify({ name: 'John Doe', phone: '9876543210' });
      expect(
        formatSelectionLabel({ inputType: 'some_new_type' }, value),
      ).toBe('John Doe');
    });

    it('joins array of labelled objects', () => {
      const value = JSON.stringify([
        { label: 'Milk' },
        { label: 'Bread' },
      ]);
      expect(
        formatSelectionLabel({ inputType: 'some_new_type' }, value),
      ).toBe('Milk, Bread');
    });
  });

  // ── Layout (single-section and multi-section) ──
  describe('layout selection', () => {
    it('formats single-section layout with address', () => {
      const value = JSON.stringify({
        address: {
          label: 'Home',
          address: 'C 502, Honer Aquantis, Tellapur, K.V.Rangareddy, Telangana, 500019',
        },
      });
      expect(
        formatSelectionLabel({ inputType: 'layout' }, value),
      ).toBe('📍 Home — C 502, Honer Aquantis, Tellapur, K.V.Rangareddy, Telangana, 500019');
    });

    it('formats address without label in layout', () => {
      const value = JSON.stringify({
        address: { address: '42 MG Road, Bengaluru, 560001' },
      });
      expect(
        formatSelectionLabel({ inputType: 'layout' }, value),
      ).toBe('📍 42 MG Road, Bengaluru, 560001');
    });

    it('never shows [object Object] for nested address', () => {
      const value = JSON.stringify({
        address: { label: 'Office', flatNo: 'B-301', address: '123 Tech Park' },
      });
      const result = formatSelectionLabel({ inputType: 'layout' }, value);
      expect(result).not.toContain('[object Object]');
      expect(result).toContain('Office');
    });

    it('formats multi-section layout with address and cuisine', () => {
      const value = JSON.stringify({
        address: { label: 'Home', address: '123 Main St' },
        cuisine: 'Biryani',
      });
      const result = formatSelectionLabel({ inputType: 'layout' }, value);
      expect(result).toContain('Home');
      expect(result).toContain('Biryani');
    });

    it('falls back for malformed layout JSON', () => {
      expect(
        formatSelectionLabel({ inputType: 'layout' }, '{broken'),
      ).toBe('{broken');
    });
  });

  // ── Fallback: nested address object (safety net) ──
  describe('fallback with nested address object', () => {
    it('does not show [object Object] when address is nested', () => {
      const value = JSON.stringify({
        address: { label: 'Home', address: '123 Main St' },
      });
      const result = formatSelectionLabel({ inputType: 'unknown_type' }, value);
      expect(result).not.toContain('[object Object]');
    });
  });

  // ── Plain text passthrough ──
  describe('plain text', () => {
    it('passes through plain text unchanged', () => {
      expect(
        formatSelectionLabel({ inputType: 'text' }, 'Hello world'),
      ).toBe('Hello world');
    });

    it('passes through OTP unchanged', () => {
      expect(
        formatSelectionLabel({ inputType: 'otp' }, '123456'),
      ).toBe('123456');
    });
  });

  // ── Malformed JSON ──
  describe('malformed JSON', () => {
    it('returns raw value for malformed JSON in address', () => {
      expect(
        formatSelectionLabel({ inputType: 'address' }, '{broken json'),
      ).toBe('{broken json');
    });

    it('returns raw value for malformed JSON in fallback', () => {
      expect(
        formatSelectionLabel({ inputType: 'unknown' }, '{not: valid}'),
      ).toBe('{not: valid}');
    });
  });
});
