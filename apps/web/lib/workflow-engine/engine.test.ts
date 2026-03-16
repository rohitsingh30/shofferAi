import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';
import { WorkflowEngine } from './engine';

// Suppress logger
vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

describe('WorkflowEngine', () => {
  let prisma: ReturnType<typeof mockDeep<PrismaClient>>;
  let engine: WorkflowEngine;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    engine = new WorkflowEngine(prisma);
  });

  describe('createTask', () => {
    it('creates a task with pending status and returns id', async () => {
      prisma.task.create.mockResolvedValue({ id: 'task-1' } as any);

      const id = await engine.createTask('user-1', 'Book hotel');
      expect(id).toBe('task-1');
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          description: 'Book hotel',
          workflowType: 'generic',
          status: 'pending',
        },
      });
    });

    it('defaults workflowType to generic', async () => {
      prisma.task.create.mockResolvedValue({ id: 'task-1' } as any);
      await engine.createTask('user-1', 'Test');
      expect(prisma.task.create.mock.calls[0][0].data.workflowType).toBe('generic');
    });

    it('uses provided workflowType', async () => {
      prisma.task.create.mockResolvedValue({ id: 'task-1' } as any);
      await engine.createTask('user-1', 'Book hotel', 'hotel_booking');
      expect(prisma.task.create.mock.calls[0][0].data.workflowType).toBe('hotel_booking');
    });
  });

  describe('updateTaskStatus', () => {
    it('validates transition and updates status', async () => {
      prisma.task.findUniqueOrThrow.mockResolvedValue({ id: 'task-1', status: 'pending' } as any);
      prisma.task.update.mockResolvedValue({} as any);

      await engine.updateTaskStatus('task-1', 'running');
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { status: 'running', completedAt: undefined },
      });
    });

    it('sets completedAt when status is completed', async () => {
      prisma.task.findUniqueOrThrow.mockResolvedValue({ id: 'task-1', status: 'running' } as any);
      prisma.task.update.mockResolvedValue({} as any);

      await engine.updateTaskStatus('task-1', 'completed');
      const updateData = prisma.task.update.mock.calls[0][0].data;
      expect(updateData.status).toBe('completed');
      expect(updateData.completedAt).toBeInstanceOf(Date);
    });

    it('throws on invalid transition', async () => {
      prisma.task.findUniqueOrThrow.mockResolvedValue({ id: 'task-1', status: 'pending' } as any);

      await expect(engine.updateTaskStatus('task-1', 'completed'))
        .rejects.toThrow('Invalid task transition');
    });
  });

  describe('addStep', () => {
    it('counts existing steps and sets stepNumber', async () => {
      prisma.taskStep.count.mockResolvedValue(3);
      prisma.taskStep.create.mockResolvedValue({ id: 'step-4' } as any);

      const id = await engine.addStep('task-1', 'Click button');
      expect(id).toBe('step-4');
      expect(prisma.taskStep.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-1',
          stepNumber: 4,
          action: 'Click button',
          status: 'pending',
          requiresConfirmation: false,
        },
      });
    });

    it('sets requiresConfirmation when provided', async () => {
      prisma.taskStep.count.mockResolvedValue(0);
      prisma.taskStep.create.mockResolvedValue({ id: 'step-1' } as any);

      await engine.addStep('task-1', 'Confirm payment', { requiresConfirmation: true });
      expect(prisma.taskStep.create.mock.calls[0][0].data.requiresConfirmation).toBe(true);
    });
  });

  describe('updateStepStatus', () => {
    it('validates transition and updates', async () => {
      prisma.taskStep.findUniqueOrThrow.mockResolvedValue({ id: 's1', status: 'pending' } as any);
      prisma.taskStep.update.mockResolvedValue({} as any);

      await engine.updateStepStatus('s1', 'running');
      const data = prisma.taskStep.update.mock.calls[0][0].data;
      expect(data.status).toBe('running');
      expect(data.startedAt).toBeInstanceOf(Date);
    });

    it('sets completedAt when status is completed', async () => {
      prisma.taskStep.findUniqueOrThrow.mockResolvedValue({ id: 's1', status: 'running' } as any);
      prisma.taskStep.update.mockResolvedValue({} as any);

      await engine.updateStepStatus('s1', 'completed');
      const data = prisma.taskStep.update.mock.calls[0][0].data;
      expect(data.completedAt).toBeInstanceOf(Date);
    });

    it('throws on invalid transition', async () => {
      prisma.taskStep.findUniqueOrThrow.mockResolvedValue({ id: 's1', status: 'completed' } as any);
      await expect(engine.updateStepStatus('s1', 'running'))
        .rejects.toThrow('Invalid step transition');
    });
  });

  describe('addMessage', () => {
    it('creates message with correct fields', async () => {
      prisma.message.create.mockResolvedValue({} as any);

      await engine.addMessage('task-1', 'user', 'Hello', { source: 'chat' });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-1',
          role: 'user',
          content: 'Hello',
          metadata: { source: 'chat' },
        },
      });
    });

    it('handles undefined metadata', async () => {
      prisma.message.create.mockResolvedValue({} as any);

      await engine.addMessage('task-1', 'assistant', 'Hi');
      expect(prisma.message.create.mock.calls[0][0].data.metadata).toBeUndefined();
    });
  });

  describe('getTask', () => {
    it('fetches task with steps and messages ordered', async () => {
      prisma.task.findUniqueOrThrow.mockResolvedValue({ id: 'task-1' } as any);

      await engine.getTask('task-1');
      expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        include: {
          steps: { orderBy: { stepNumber: 'asc' } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  });

  describe('getUserTasks', () => {
    it('fetches tasks for user with default limit', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await engine.getUserTasks('user-1');
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    });

    it('respects custom limit', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await engine.getUserTasks('user-1', 5);
      expect(prisma.task.findMany.mock.calls[0]?.[0]?.take).toBe(5);
    });
  });

  describe('getPauseManager', () => {
    it('returns PauseResumeManager instance', () => {
      const pm = engine.getPauseManager();
      expect(pm).toBeDefined();
      expect(typeof pm.waitForInput).toBe('function');
      expect(typeof pm.provideInput).toBe('function');
    });
  });
});
