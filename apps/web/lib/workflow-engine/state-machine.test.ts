import { describe, it, expect } from 'vitest';
import { TaskStateMachine } from './state-machine';

describe('TaskStateMachine - task transitions', () => {
  const validTransitions: [string, string][] = [
    ['pending', 'running'],
    ['running', 'paused_for_input'],
    ['running', 'completed'],
    ['running', 'failed'],
    ['paused_for_input', 'running'],
    ['failed', 'pending'],
  ];

  for (const [from, to] of validTransitions) {
    it(`allows ${from} → ${to}`, () => {
      expect(TaskStateMachine.canTransitionTask(from as any, to as any)).toBe(true);
    });
  }

  const invalidTransitions: [string, string][] = [
    ['pending', 'completed'],
    ['pending', 'failed'],
    ['completed', 'running'],
    ['completed', 'failed'],
    ['completed', 'pending'],
    ['failed', 'completed'],
  ];

  for (const [from, to] of invalidTransitions) {
    it(`rejects ${from} → ${to}`, () => {
      expect(TaskStateMachine.canTransitionTask(from as any, to as any)).toBe(false);
    });
  }

  it('validateTaskTransition does not throw on valid transition', () => {
    expect(() => TaskStateMachine.validateTaskTransition('pending', 'running')).not.toThrow();
  });

  it('validateTaskTransition throws on invalid transition', () => {
    expect(() => TaskStateMachine.validateTaskTransition('pending', 'completed'))
      .toThrow('Invalid task transition: pending → completed');
  });
});

describe('TaskStateMachine - step transitions', () => {
  const validTransitions: [string, string][] = [
    ['pending', 'running'],
    ['pending', 'skipped'],
    ['running', 'paused_for_input'],
    ['running', 'completed'],
    ['running', 'failed'],
    ['paused_for_input', 'running'],
    ['failed', 'pending'],
  ];

  for (const [from, to] of validTransitions) {
    it(`allows ${from} → ${to}`, () => {
      expect(TaskStateMachine.canTransitionStep(from as any, to as any)).toBe(true);
    });
  }

  const invalidTransitions: [string, string][] = [
    ['completed', 'running'],
    ['skipped', 'running'],
    ['skipped', 'pending'],
    ['pending', 'completed'],
  ];

  for (const [from, to] of invalidTransitions) {
    it(`rejects ${from} → ${to}`, () => {
      expect(TaskStateMachine.canTransitionStep(from as any, to as any)).toBe(false);
    });
  }

  it('validateStepTransition throws on invalid transition', () => {
    expect(() => TaskStateMachine.validateStepTransition('completed', 'running'))
      .toThrow('Invalid step transition: completed → running');
  });
});
