import { describe, it, expect } from 'vitest';
import { isInternalToolLabel } from './internal-message-filter';

describe('isInternalToolLabel', () => {
  it('filters "Browser: <toolname>" labels', () => {
    expect(isInternalToolLabel('Browser: report_intent')).toBe(true);
    expect(isInternalToolLabel('Browser: playwright-browser_navigate')).toBe(true);
    expect(isInternalToolLabel('Browser: browser_snapshot')).toBe(true);
    expect(isInternalToolLabel('Browser: browser_click')).toBe(true);
    expect(isInternalToolLabel('Browser: some-unknown-tool')).toBe(true);
  });

  it('filters raw tool names', () => {
    expect(isInternalToolLabel('browser_navigate')).toBe(true);
    expect(isInternalToolLabel('browser_snapshot')).toBe(true);
    expect(isInternalToolLabel('browser_click')).toBe(true);
    expect(isInternalToolLabel('mcp__playwright__browser_navigate')).toBe(true);
    expect(isInternalToolLabel('playwright__browser_type')).toBe(true);
    expect(isInternalToolLabel('report_intent')).toBe(true);
  });

  it('filters status labels', () => {
    expect(isInternalToolLabel('Agent starting...')).toBe(true);
    expect(isInternalToolLabel('Starting...')).toBe(true);
    expect(isInternalToolLabel('Thinking...')).toBe(true);
  });

  it('filters empty/undefined messages', () => {
    expect(isInternalToolLabel(undefined)).toBe(true);
    expect(isInternalToolLabel('')).toBe(true);
    expect(isInternalToolLabel('   ')).toBe(true);
  });

  it('allows natural language messages through', () => {
    expect(isInternalToolLabel('Opening Zomato in a new tab...')).toBe(false);
    expect(isInternalToolLabel('I found 3 hotels under ₹4000/night')).toBe(false);
    expect(isInternalToolLabel('Adding butter chicken to your cart')).toBe(false);
    expect(isInternalToolLabel('Your order has been placed successfully!')).toBe(false);
    expect(isInternalToolLabel('Browser is loading the page, please wait...')).toBe(false);
    expect(isInternalToolLabel('I need to navigate to zomato.com to find restaurants')).toBe(false);
  });

  it('allows multi-word messages with "Browser" in them', () => {
    expect(isInternalToolLabel('Browser is ready')).toBe(false);
    expect(isInternalToolLabel('The browser has loaded the page')).toBe(false);
  });
});
