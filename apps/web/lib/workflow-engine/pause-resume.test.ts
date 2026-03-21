import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PauseResumeManager } from './pause-resume';
import { UserInputTimeoutError } from '@shofferai/shared';

// In-memory Map simulating PostgreSQL PendingInput table
const fakeDb = new Map<string, Record<string, unknown>>();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pendingInput: {
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const key = `${where.taskId_stepId.taskId}:${where.taskId_stepId.stepId}`;
        const existing = fakeDb.get(key);
        if (existing) {
          Object.assign(existing, update);
        } else {
          fakeDb.set(key, { ...create, response: null });
        }
        return fakeDb.get(key);
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const key = `${where.taskId_stepId.taskId}:${where.taskId_stepId.stepId}`;
        return fakeDb.get(key) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const key = `${where.taskId_stepId.taskId}:${where.taskId_stepId.stepId}`;
        const existing = fakeDb.get(key);
        if (!existing) throw new Error('Not found');
        Object.assign(existing, data);
        return existing;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const key = `${where.taskId_stepId.taskId}:${where.taskId_stepId.stepId}`;
        fakeDb.delete(key);
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        for (const key of [...fakeDb.keys()]) {
          if (key.startsWith(`${where.taskId}:`)) fakeDb.delete(key);
        }
      }),
      count: vi.fn(async ({ where }: any) => {
        let count = 0;
        for (const [key, val] of fakeDb) {
          if (key.startsWith(`${where.taskId}:`) && val.response === null) count++;
        }
        return count;
      }),
    },
  },
}));

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

describe('PauseResumeManager (DB-backed)', () => {
  let manager: PauseResumeManager;

  beforeEach(() => {
    fakeDb.clear();
    // 50ms poll interval + 500ms timeout for fast tests
    manager = new PauseResumeManager({ defaultTimeoutMs: 500, pollIntervalMs: 50 });
  });

  it('waitForInput resolves when provideInput is called', async () => {
    const promise = manager.waitForInput({
      taskId: 't1',
      stepId: 's1',
      question: 'Enter OTP',
      inputType: 'otp',
    });

    // Simulate user responding after a brief delay
    setTimeout(async () => {
      await manager.provideInput('t1', 's1', '123456');
    }, 100);

    const result = await promise;
    expect(result).toEqual({ taskId: 't1', stepId: 's1', value: '123456' });
  });

  it('provideInput returns false when no pending input', async () => {
    expect(await manager.provideInput('t1', 's1', 'val')).toBe(false);
  });

  it('waitForInput rejects with UserInputTimeoutError after timeout', async () => {
    await expect(
      manager.waitForInput({
        taskId: 't1',
        stepId: 's1',
        question: 'Confirm?',
        inputType: 'confirmation',
      })
    ).rejects.toThrow(UserInputTimeoutError);
  });

  it('respects custom timeout from request', async () => {
    const start = Date.now();
    await expect(
      manager.waitForInput({
        taskId: 't1',
        stepId: 's1',
        question: 'Pay?',
        inputType: 'payment',
        timeout: 200,
      })
    ).rejects.toThrow(UserInputTimeoutError);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(150);
    expect(elapsed).toBeLessThan(500);
  });

  it('cancelPending causes waitForInput to reject', async () => {
    const promise = manager.waitForInput({
      taskId: 't1',
      stepId: 's1',
      question: 'Q1',
      inputType: 'freetext',
    });

    setTimeout(async () => {
      await manager.cancelPending('t1');
    }, 100);

    await expect(promise).rejects.toThrow('Pending input cancelled');
  });

  it('cancelPending only affects the specified taskId', async () => {
    // Create two pending inputs for different tasks
    const p1 = manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });
    const p2 = manager.waitForInput({
      taskId: 't2', stepId: 's1', question: 'Q', inputType: 'freetext',
    });

    // Cancel only t1
    setTimeout(async () => {
      await manager.cancelPending('t1');
    }, 100);

    await expect(p1).rejects.toThrow('Pending input cancelled');
    expect(await manager.hasPendingInput('t2')).toBe(true);

    // Clean up t2 and catch its rejection
    await manager.cancelPending('t2');
    await expect(p2).rejects.toThrow('Pending input cancelled');
  });

  it('hasPendingInput returns true when pending input exists', async () => {
    // Start waiting (don't await — it blocks)
    const p = manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });
    // Give upsert time to run
    await new Promise(r => setTimeout(r, 20));
    expect(await manager.hasPendingInput('t1')).toBe(true);

    // Clean up — cancel and catch the rejection
    await manager.cancelPending('t1');
    await expect(p).rejects.toThrow('Pending input cancelled');
  });

  it('hasPendingInput returns false when no pending input', async () => {
    expect(await manager.hasPendingInput('t1')).toBe(false);
  });

  it('hasPendingInput returns false after input is provided', async () => {
    const promise = manager.waitForInput({
      taskId: 't1', stepId: 's1', question: 'Q', inputType: 'freetext',
    });

    setTimeout(async () => {
      await manager.provideInput('t1', 's1', 'val');
    }, 50);

    await promise;
    expect(await manager.hasPendingInput('t1')).toBe(false);
  });
});
