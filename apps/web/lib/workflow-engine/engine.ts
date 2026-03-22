import type { PrismaClient } from '@prisma/client';
import { TaskStateMachine } from './state-machine';
import { PauseResumeManager } from './pause-resume';
import { logger } from '@shofferai/shared';
import type { TaskStatus, StepStatus, WorkflowType } from '@shofferai/shared';

export class WorkflowEngine {
  private pauseManager: PauseResumeManager;

  constructor(private prisma: PrismaClient) {
    this.pauseManager = new PauseResumeManager();
  }

  getPauseManager(): PauseResumeManager {
    return this.pauseManager;
  }

  async createTask(
    userId: string,
    description: string,
    workflowType?: WorkflowType
  ): Promise<string> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        description,
        workflowType: workflowType || 'generic',
        status: 'pending',
      },
    });

    logger.info('Task created', { taskId: task.id, userId, description });
    return task.id;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id: taskId } });
    TaskStateMachine.validateTaskTransition(task.status as TaskStatus, status);

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });
  }

  async addStep(
    taskId: string,
    action: string,
    options?: { requiresConfirmation?: boolean }
  ): Promise<string> {
    const stepCount = await this.prisma.taskStep.count({ where: { taskId } });

    const step = await this.prisma.taskStep.create({
      data: {
        taskId,
        stepNumber: stepCount + 1,
        action,
        status: 'pending',
        requiresConfirmation: options?.requiresConfirmation || false,
      },
    });

    return step.id;
  }

  async updateStepStatus(
    stepId: string,
    status: StepStatus,
    data?: { result?: object; error?: string; userInput?: string; inputNeeded?: string }
  ): Promise<void> {
    const step = await this.prisma.taskStep.findUniqueOrThrow({ where: { id: stepId } });
    TaskStateMachine.validateStepTransition(step.status as StepStatus, status);

    await this.prisma.taskStep.update({
      where: { id: stepId },
      data: {
        status,
        result: data?.result ? JSON.parse(JSON.stringify(data.result)) : undefined,
        error: data?.error,
        userInput: data?.userInput,
        inputNeeded: data?.inputNeeded,
        startedAt: status === 'running' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });
  }

  async addMessage(
    taskId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.prisma.message.create({
      data: {
        taskId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  async getTask(taskId: string) {
    return this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async getUserTasks(userId: string, limit = 20) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });
  }

  /**
   * Load recent task context for a user — gives the agent memory across tasks.
   * Returns a compact string summarising the last few tasks' conversation,
   * plus the most recent matched skill ID for fallback skill matching.
   */
  async loadPreviousContext(
    userId: string,
    options?: { maxTasks?: number; windowMinutes?: number; excludeTaskId?: string }
  ): Promise<{ contextText: string; lastSkillId: string | null }> {
    const maxTasks = options?.maxTasks ?? 3;
    const windowMinutes = options?.windowMinutes ?? 60;
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

    const recentTasks = await this.prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: cutoff },
        status: { in: ['completed', 'failed', 'running'] },
        ...(options?.excludeTaskId ? { id: { not: options.excludeTaskId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: maxTasks,
      include: {
        messages: {
          where: { role: { in: ['user', 'assistant'] } },
          orderBy: { createdAt: 'asc' },
          take: 10, // max 10 messages per task
        },
      },
    });

    if (recentTasks.length === 0) {
      return { contextText: '', lastSkillId: null };
    }

    // Build compact context — newest task first
    const parts: string[] = [];
    let lastSkillId: string | null = null;

    for (const task of recentTasks) {
      if (!lastSkillId && task.matchedSkillId) {
        lastSkillId = task.matchedSkillId;
      }

      const msgs = task.messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 300)}`)
        .join('\n');

      if (msgs) {
        const skillTag = task.matchedSkillId ? ` [skill: ${task.matchedSkillId}]` : '';
        parts.push(`--- Task: "${task.description.slice(0, 100)}"${skillTag} (${task.status}) ---\n${msgs}`);
      }
    }

    // Truncate total context to ~2000 chars to stay within token budget
    let contextText = parts.join('\n\n');
    if (contextText.length > 2000) {
      contextText = contextText.slice(0, 2000) + '\n... (truncated)';
    }

    return { contextText, lastSkillId };
  }

  /** Store the matched skill ID on a task (for future context lookups). */
  async setTaskSkill(taskId: string, skillId: string): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: { matchedSkillId: skillId },
    });
  }
}
