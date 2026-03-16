import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PauseResumeManager } from './pause-resume';
import { UserInputTimeoutError } from '@shofferai/shared';

// Suppress logger output in tests
vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('PauseResumeManager', () => {
  let manager: PauseResumeManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new PauseResumeManager({ defaultTimeoutMs: 5000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waitForInput resolves when provideInput is called', async () => {
    const promise = manager.waitForInput({
      taskId: 't1',
      stepId: 's1',
      question: 'Enter OTP',
      inputType: 'otp',
    });

    const provided = manager.provideInput('t1', 's1', '123456');
    expect(provided).toBe(true);

    const result = await promise;
    expect(result).toEqual({ taskId: 't1', stepId: 's1', value: '123456' });
  });

  it('provideInput returns false when no pending input', () => {
    expect(manager.provideInput('t1', 's1', 'val')).toBe(false);
  });

  it('waitForInput rejects with UserInputTimeoutError after timeout', async () => {
    const promise = manager.waitForInput({
      taskId: 't1',
      stepId: 's1',
      question: 'Confirm?',
      inputType: 'confirmation',
    });

    vi.advanceTimersByTime(5001);

    await expect(promise).rejects.toThrow(UserInputTimeoutError);
  });

  it('respects custom timeout from request', async () => {
    const promise = manager.waitForInput({
      taskId: 't1',
      stepId: 's1',
      question: 'Pay?',
      inputType: 'payment',
      timeout: 1000,
    });

    vi.advanceTimersByTime(999);
    // Should not have timed out yet
    expect(manager.hasPendingInput('t1')).toBe(true);

    vi.advanceTimersByTime(2);
    await expect(promise).rejects.toThrow(UserInputTimeoutError);
  });

  it('cancelPending rejects all pending inputs for a taskId', async () => {
    const p1 = manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q1', inputType: 'freetext',
    });
    const p2 = manager.waitForInput({
      taskId: 't1', stepId: 's2', question: 'Q2', inputType: 'freetext',
    });

    manager.cancelPending('t1');

    await expect(p1).rejects.toThrow('Task cancelled');
    await expect(p2).rejects.toThrow('Task cancelled');
  });

  it('cancelPending only affects the specified taskId', async () => {
    const p1 = manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });
    manager.waitForInput({
      taskId: 't2', stepId: 's1', question: 'Q', inputType: 'freetext',
    });

    manager.cancelPending('t1');

    await expect(p1).rejects.toThrow('Task cancelled');
    expect(manager.hasPendingInput('t2')).toBe(true);
  });

  it('hasPendingInput returns true when pending input exists', () => {
    manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });
    expect(manager.hasPendingInput('t1')).toBe(true);
  });

  it('hasPendingInput returns false when no pending input', () => {
    expect(manager.hasPendingInput('t1')).toBe(false);
  });

  it('hasPendingInput returns false after input is provided', () => {
    manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });
    manager.provideInput('t1', 's1', 'val');
    expect(manager.hasPendingInput('t1')).toBe(false);
  });
});
