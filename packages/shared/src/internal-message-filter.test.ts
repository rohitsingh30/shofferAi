import { describe, it, expect } from 'vitest';
import { isInternalToolLabel, isAgentNarration, shouldSuppressMessage } from './internal-message-filter';
import { generateAllVectors, VECTOR_STATS } from './internal-message-filter.fixtures';

// 10,000+ DATA-DRIVEN TESTS
const ALL_VECTORS = generateAllVectors();

describe('shouldSuppressMessage — 10K vectors', () => {
  it.each(ALL_VECTORS)(
    '%s → %s (%s)',
    (message, expected) => {
      expect(shouldSuppressMessage(message)).toBe(expected);
    },
  );
});

describe('isInternalToolLabel — unit', () => {
  it('returns true for undefined/empty', () => {
    expect(isInternalToolLabel(undefined)).toBe(true);
    expect(isInternalToolLabel('')).toBe(true);
    expect(isInternalToolLabel('   ')).toBe(true);
  });

  it('returns false for natural language', () => {
    expect(isInternalToolLabel('Your order is ready')).toBe(false);
    expect(isInternalToolLabel('Browser is loading')).toBe(false);
  });
});

describe('isAgentNarration — unit', () => {
  it('returns true for undefined/empty', () => {
    expect(isAgentNarration(undefined)).toBe(true);
    expect(isAgentNarration('')).toBe(true);
  });
});
