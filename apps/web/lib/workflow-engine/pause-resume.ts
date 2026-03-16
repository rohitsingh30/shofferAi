import { logger, UserInputTimeoutError } from '@shofferai/shared';
import type { UserInputRequest, UserInputResponse } from '@shofferai/shared';

interface PendingInput {
  request: UserInputRequest;
  resolve: (response: UserInputResponse) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export class PauseResumeManager {
  private pendingInputs = new Map<string, PendingInput>();
  private defaultTimeout: number;

  constructor(options?: { defaultTimeoutMs?: number }) {
    this.defaultTimeout = options?.defaultTimeoutMs || 5 * 60 * 1000; // 5 minutes
  }

  waitForInput(request: UserInputRequest): Promise<UserInputResponse> {
    const key = `${request.taskId}:${request.stepId}`;

    return new Promise<UserInputResponse>((resolve, reject) => {
      const timeout = request.timeout || this.defaultTimeout;

      const timeoutId = setTimeout(() => {
        this.pendingInputs.delete(key);
        reject(new UserInputTimeoutError(request.taskId, request.stepId));
      }, timeout);

      this.pendingInputs.set(key, {
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
      });
    });
  }

  provideInput(taskId: string, stepId: string, value: string): boolean {
    const key = `${taskId}:${stepId}`;
    const pending = this.pendingInputs.get(key);

    if (!pending) {
      logger.warn('No pending input found', { taskId, stepId });
      return false;
    }

    clearTimeout(pending.timeoutId);
    this.pendingInputs.delete(key);

    pending.resolve({
      taskId,
      stepId,
      value,
    });

    logger.info('User input provided', { taskId, stepId });
    return true;
  }

  cancelPending(taskId: string): void {
    for (const [key, pending] of this.pendingInputs) {
      if (key.startsWith(`${taskId}:`)) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error('Task cancelled'));
        this.pendingInputs.delete(key);
      }
    }
  }

  hasPendingInput(taskId: string): boolean {
    for (const key of this.pendingInputs.keys()) {
      if (key.startsWith(`${taskId}:`)) {
        return true;
      }
    }
    return false;
  }
}
