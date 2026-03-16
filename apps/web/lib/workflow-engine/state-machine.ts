import type { TaskStatus, StepStatus } from '@shofferai/shared';

const VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ['running'],
  running: ['paused_for_input', 'completed', 'failed'],
  paused_for_input: ['running'],
  completed: [],
  failed: ['pending'], // Allow retry
};

const VALID_STEP_TRANSITIONS: Record<StepStatus, StepStatus[]> = {
  pending: ['running', 'skipped'],
  running: ['paused_for_input', 'completed', 'failed'],
  paused_for_input: ['running'],
  completed: [],
  failed: ['pending'], // Allow retry
  skipped: [],
};

export class TaskStateMachine {
  static canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
    return VALID_TASK_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static canTransitionStep(from: StepStatus, to: StepStatus): boolean {
    return VALID_STEP_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static validateTaskTransition(from: TaskStatus, to: TaskStatus): void {
    if (!this.canTransitionTask(from, to)) {
      throw new Error(`Invalid task transition: ${from} → ${to}`);
    }
  }

  static validateStepTransition(from: StepStatus, to: StepStatus): void {
    if (!this.canTransitionStep(from, to)) {
      throw new Error(`Invalid step transition: ${from} → ${to}`);
    }
  }
}
