import { logger, UserInputTimeoutError } from '@shofferai/shared';
import type { UserInputRequest, UserInputResponse } from '@shofferai/shared';

interface PendingInput {
  request: UserInputRequest;
  resolve: (response: UserInputResponse) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

// Store pendingInputs directly on globalThis so every route bundle
// shares the exact same Map, even if Next.js evaluates this module
// separately per server chunk.
const g = globalThis as unknown as {
  __shofferai_pendingInputs?: Map<string, PendingInput>;
};
if (!g.__shofferai_pendingInputs) {
  g.__shofferai_pendingInputs = new Map();
}
const SHARED_PENDING: Map<string, PendingInput> = g.__shofferai_pendingInputs;

export class PauseResumeManager {
  private defaultTimeout: number;

  constructor(options?: { defaultTimeoutMs?: number }) {
    this.defaultTimeout = options?.defaultTimeoutMs || 5 * 60 * 1000; // 5 minutes
  }

  waitForInput(request: UserInputRequest): Promise<UserInputResponse> {
    const key = `${request.taskId}:${request.stepId}`;

    return new Promise<UserInputResponse>((resolve, reject) => {
      const timeout = request.timeout || this.defaultTimeout;

      const timeoutId = setTimeout(() => {
        SHARED_PENDING.delete(key);
        reject(new UserInputTimeoutError(request.taskId, request.stepId));
      }, timeout);

      SHARED_PENDING.set(key, {
        request,
        resolve,
        reject,
        timeoutId,
      });

      logger.info('Waiting for user input', {
        taskId: request.taskId,
        stepId: request.stepId,
        inputType: request.inputType,
        question: request.question,
        pendingCount: SHARED_PENDING.size,
      });
    });
  }

  provideInput(taskId: string, stepId: string, value: string): boolean {
    const key = `${taskId}:${stepId}`;
    const pending = SHARED_PENDING.get(key);

    if (!pending) {
      logger.warn('No pending input found', {
        taskId,
        stepId,
        pendingCount: SHARED_PENDING.size,
        pendingKeys: Array.from(SHARED_PENDING.keys()),
      });
      return false;
    }

    clearTimeout(pending.timeoutId);
    SHARED_PENDING.delete(key);

    pending.resolve({
      taskId,
      stepId,
      value,
    });

    logger.info('User input provided', { taskId, stepId });
    return true;
  }

  cancelPending(taskId: string): void {
    for (const [key, pending] of SHARED_PENDING) {
      if (key.startsWith(`${taskId}:`)) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error('Task cancelled'));
        SHARED_PENDING.delete(key);
      }
    }
  }

  hasPendingInput(taskId: string): boolean {
    for (const key of SHARED_PENDING.keys()) {
      if (key.startsWith(`${taskId}:`)) {
        return true;
      }
    }
    return false;
  }
}
