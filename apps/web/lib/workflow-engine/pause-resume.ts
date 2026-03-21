import { logger, UserInputTimeoutError } from '@shofferai/shared';
import type { UserInputRequest, UserInputResponse } from '@shofferai/shared';
import { prisma } from '@/lib/prisma';

const DEFAULT_POLL_INTERVAL_MS = 1000;

export class PauseResumeManager {
  private defaultTimeout: number;
  private pollInterval: number;

  constructor(options?: { defaultTimeoutMs?: number; pollIntervalMs?: number }) {
    this.defaultTimeout = options?.defaultTimeoutMs || 5 * 60 * 1000; // 5 minutes
    this.pollInterval = options?.pollIntervalMs || DEFAULT_POLL_INTERVAL_MS;
  }

  /**
   * Register a pending input in the DB, then poll until `response` is set.
   * Works across Cloud Run instances because PostgreSQL is shared state.
   */
  async waitForInput(request: UserInputRequest): Promise<UserInputResponse> {
    const { taskId, stepId } = request;
    const timeout = request.timeout || this.defaultTimeout;

    // Upsert so retries/re-deliveries don't fail with unique constraint
    await prisma.pendingInput.upsert({
      where: { taskId_stepId: { taskId, stepId } },
      create: {
        taskId,
        stepId,
        question: request.question ?? null,
        inputType: request.inputType ?? null,
        options: request.options ? JSON.stringify(request.options) : null,
      },
      update: {
        question: request.question ?? null,
        inputType: request.inputType ?? null,
        options: request.options ? JSON.stringify(request.options) : null,
        response: null, // reset if re-waiting
      },
    });

    logger.info('Waiting for user input (DB)', {
      taskId,
      stepId,
      inputType: request.inputType,
      question: request.question,
    });

    // Poll DB until response is set or timeout
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const row = await prisma.pendingInput.findUnique({
        where: { taskId_stepId: { taskId, stepId } },
      });

      // Row deleted → cancelled
      if (!row) {
        throw new Error('Pending input cancelled');
      }

      // Response arrived
      if (row.response !== null) {
        // Clean up
        await prisma.pendingInput.delete({
          where: { taskId_stepId: { taskId, stepId } },
        }).catch(() => {/* already deleted */});

        return { taskId, stepId, value: row.response };
      }

      await new Promise(r => setTimeout(r, this.pollInterval));
    }

    // Timeout — clean up
    await prisma.pendingInput.delete({
      where: { taskId_stepId: { taskId, stepId } },
    }).catch(() => {});

    throw new UserInputTimeoutError(taskId, stepId, request.inputType, timeout);
  }

  /**
   * Deliver the user's response. Works from ANY Cloud Run instance
   * because it writes directly to the shared PostgreSQL row.
   */
  async provideInput(taskId: string, stepId: string, value: string): Promise<boolean> {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      await prisma.pendingInput.update({
        where: { taskId_stepId: { taskId, stepId } },
        data: { response: strValue },
      });
      logger.info('User input provided (DB)', { taskId, stepId });
      return true;
    } catch {
      logger.warn('No pending input found (DB)', { taskId, stepId });
      return false;
    }
  }

  async cancelPending(taskId: string): Promise<void> {
    await prisma.pendingInput.deleteMany({ where: { taskId } });
  }

  async hasPendingInput(taskId: string): Promise<boolean> {
    const count = await prisma.pendingInput.count({
      where: { taskId, response: null },
    });
    return count > 0;
  }
}
