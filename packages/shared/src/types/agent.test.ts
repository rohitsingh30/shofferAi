import { describe, it, expect } from 'vitest';
import { TaskStatus, StepStatus, WorkflowType } from './agent';

describe('TaskStatus schema', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['pending', 'running', 'paused_for_input', 'completed', 'failed']) {
      expect(TaskStatus.parse(s)).toBe(s);
    }
  });

  it('rejects invalid string', () => {
    expect(() => TaskStatus.parse('invalid')).toThrow();
  });
});

describe('StepStatus schema', () => {
  it('accepts all valid statuses including skipped', () => {
    for (const s of ['pending', 'running', 'paused_for_input', 'completed', 'failed', 'skipped']) {
      expect(StepStatus.parse(s)).toBe(s);
    }
  });

  it('rejects invalid string', () => {
    expect(() => StepStatus.parse('cancelled')).toThrow();
  });
});

describe('WorkflowType schema', () => {
  it('accepts all valid workflow types', () => {
    for (const t of ['hotel_booking', 'grocery_order', 'food_delivery', 'bill_payment', 'generic']) {
      expect(WorkflowType.parse(t)).toBe(t);
    }
  });

  it('rejects invalid string', () => {
    expect(() => WorkflowType.parse('ride_hailing')).toThrow();
  });
});
