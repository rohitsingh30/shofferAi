import { describe, it, expect } from 'vitest';
import {
  looksLikeProductPresentation,
  extractProductData,
  inferStoreFromSkill,
  SHOPPING_SKILLS,
} from './product-parser';

describe('product-parser', () => {
  describe('SHOPPING_SKILLS', () => {
    it('contains expected skills', () => {
      expect(SHOPPING_SKILLS.has('flipkart-shopping')).toBe(true);
      expect(SHOPPING_SKILLS.has('amazon-shopping')).toBe(true);
      expect(SHOPPING_SKILLS.has('blinkit-grocery')).toBe(true);
      expect(SHOPPING_SKILLS.has('random-skill')).toBe(false);
    });
  });

  describe('inferStoreFromSkill', () => {
    it('maps known skills to store names', () => {
      expect(inferStoreFromSkill('flipkart-shopping')).toBe('Flipkart');
      expect(inferStoreFromSkill('amazon-shopping')).toBe('Amazon');
      expect(inferStoreFromSkill('blinkit-grocery')).toBe('Blinkit');
    });

    it('returns "Store" for unknown skills', () => {
      expect(inferStoreFromSkill('unknown-skill')).toBe('Store');
    });
  });

  describe('looksLikeProductPresentation', () => {
    it('detects a Flipkart product listing', () => {
      const text = `realme Buds T200x — ₹1,399 (MRP ₹2,499, 44% off)
- ⭐ 4.3 rating · 1.3L+ reviews
- 25dB ANC · 12.4mm drivers · 48hrs playback · BT 5.4 · IP55
- 🚚 Delivery by 25 Mar, Wed
- 💳 ₹70 off with Flipkart Axis/SBI cards (effective ₹1,329)
- ✅ Added to cart — Flipkart Assured

Would you like to proceed to checkout, or keep browsing?`;
      expect(looksLikeProductPresentation(text)).toBe(true);
    });

    it('detects a product with MRP + rating + delivery', () => {
      const text = `boAt Airdopes 161 — ₹899 (MRP ₹2,999 · 70% off)
⭐ 4.1 rating · 15.5L+ reviews
Delivery: 24 Mar, Tue
1 Year Warranty`;
      expect(looksLikeProductPresentation(text)).toBe(true);
    });

    it('rejects plain text without price', () => {
      expect(looksLikeProductPresentation('Hello, how can I help you?')).toBe(false);
    });

    it('rejects short text', () => {
      expect(looksLikeProductPresentation('₹100')).toBe(false);
    });

    it('rejects text with price but no other indicators', () => {
      expect(looksLikeProductPresentation('The total cost is ₹1,399 for this service.')).toBe(false);
    });

    it('detects product with offers + specs (no explicit MRP)', () => {
      const text = `OnePlus Nord Buds 2r — ₹1,799
- Dual Mic · AI Crystal Clear
- 12.4mm titanium drivers
- ₹90 off with HDFC Bank
- 🚚 Delivery by 26 Mar`;
      expect(looksLikeProductPresentation(text)).toBe(true);
    });
  });

  describe('extractProductData', () => {
    const flipkartText = `realme Buds T200x — ₹1,399 (MRP ₹2,499, 44% off)
- ⭐ 4.3 rating · 1.3L+ reviews
- 25dB ANC · 12.4mm drivers · 48hrs playback · BT 5.4 · IP55
- 🚚 Delivery by 25 Mar, Wed
- 💳 ₹70 off with Flipkart Axis/SBI cards (effective ₹1,329)
- ✅ Added to cart — Flipkart Assured

Would you like to proceed to checkout, or keep browsing?`;

    it('extracts name', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.name).toBe('realme Buds T200x');
    });

    it('extracts price', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.price).toBe(1399);
    });

    it('extracts MRP', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.mrp).toBe(2499);
    });

    it('extracts discount', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.discount).toBe('44% off');
    });

    it('extracts rating', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.rating).toBe(4.3);
    });

    it('extracts rating count', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.ratingCount).toBe('1.3L+ reviews');
    });

    it('extracts delivery', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.delivery).toBe('25 Mar, Wed');
    });

    it('extracts specs (split on ·)', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.specs).toBeDefined();
      expect(product.specs!.length).toBeGreaterThanOrEqual(3);
      expect(product.specs).toContain('25dB ANC');
      expect(product.specs).toContain('12.4mm drivers');
    });

    it('extracts offers', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.offers).toBeDefined();
      expect(product.offers!.length).toBeGreaterThanOrEqual(1);
      expect(product.offers![0]).toMatch(/₹70 off/);
    });

    it('sets store correctly', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.store).toBe('Flipkart');
    });

    it('generates an id', () => {
      const product = extractProductData(flipkartText, 'Flipkart');
      expect(product.id).toMatch(/^product-\d+$/);
    });

    it('handles minimal product text', () => {
      const text = `boAt Airdopes 161 — ₹899`;
      const product = extractProductData(text, 'Amazon');
      expect(product.name).toBe('boAt Airdopes 161');
      expect(product.price).toBe(899);
      expect(product.store).toBe('Amazon');
    });
  });
});
