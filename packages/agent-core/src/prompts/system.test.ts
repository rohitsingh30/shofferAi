import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, SYSTEM_PROMPT } from './system';

describe('SYSTEM_PROMPT', () => {
  it('contains key instructions', () => {
    expect(SYSTEM_PROMPT).toContain('ShofferAI');
    expect(SYSTEM_PROMPT).toContain('ask_user');
    expect(SYSTEM_PROMPT).toContain('confirm_action');
    expect(SYSTEM_PROMPT).toContain('handoff_to_browser_agent');
    expect(SYSTEM_PROMPT).toContain('rsinghtomar3011@gmail.com');
  });
});

describe('buildSystemPrompt', () => {
  it('includes base system prompt', () => {
    const result = buildSystemPrompt({});
    expect(result).toContain('ShofferAI');
    expect(result).toContain('USER CONTEXT');
  });

  it('includes user name when provided', () => {
    const result = buildSystemPrompt({ name: 'Rohit' });
    expect(result).toContain("User's name: Rohit");
  });

  it('includes address labels when provided', () => {
    const result = buildSystemPrompt({ addressLabels: ['Home', 'Office'] });
    expect(result).toContain('Saved addresses: Home, Office');
  });

  it('includes credential labels when provided', () => {
    const result = buildSystemPrompt({
      credentialLabels: [
        { id: 'c1', label: 'HDFC Visa 4242', type: 'card' },
      ],
    });
    expect(result).toContain('HDFC Visa 4242');
    expect(result).toContain('ID: c1');
  });

  it('includes preferences when provided', () => {
    const result = buildSystemPrompt({
      preferences: { language: 'en', defaultCity: 'Mumbai' },
    });
    expect(result).toContain('Preferences:');
    expect(result).toContain('"language":"en"');
  });

  it('does not include all skill summaries (removed for latency)', () => {
    const skills = [
      { name: 'booking-hotel', description: 'Book hotels', triggers: [], siteUrl: '', requiresAuth: false, params: [], instructions: '' },
    ];
    const result = buildSystemPrompt({}, skills);
    // Skill summaries deliberately removed — matchSkill() picks the skill before the LLM sees anything.
    // Injecting 500+ summaries added ~20k tokens per call (86% of input was wasted).
    expect(result).not.toContain('AVAILABLE SKILLS');
  });

  it('includes active skill instructions when provided', () => {
    const skill = {
      name: 'booking-hotel',
      description: 'Book hotels',
      triggers: [],
      siteUrl: '',
      requiresAuth: false,
      params: [],
      instructions: '## Steps\n### 1. Search hotels',
    };
    const result = buildSystemPrompt({}, [], skill);
    expect(result).toContain('ACTIVE SKILL: booking-hotel');
    expect(result).toContain('Search hotels');
  });

  it('omits sections when data is not provided', () => {
    const result = buildSystemPrompt({});
    expect(result).not.toContain("User's name:");
    expect(result).not.toContain('Saved addresses:');
    expect(result).not.toContain('Saved payment methods');
    expect(result).not.toContain('Preferences:');
  });
});
