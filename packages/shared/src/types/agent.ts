import { z } from 'zod';

export const TaskStatus = z.enum([
  'pending',
  'running',
  'paused_for_input',
  'completed',
  'failed',
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const StepStatus = z.enum([
  'pending',
  'running',
  'paused_for_input',
  'completed',
  'failed',
  'skipped',
]);
export type StepStatus = z.infer<typeof StepStatus>;

export const WorkflowType = z.enum([
  'hotel_booking',
  'grocery_order',
  'food_delivery',
  'bill_payment',
  'generic',
]);
export type WorkflowType = z.infer<typeof WorkflowType>;

export interface AgentTask {
  id: string;
  userId: string;
  description: string;
  workflowType: WorkflowType;
  status: TaskStatus;
  steps: AgentStep[];
  result?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentStep {
  id: string;
  taskId: string;
  stepNumber: number;
  action: string;
  status: StepStatus;
  requiresConfirmation: boolean;
  inputNeeded?: string;
  userInput?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface AgentMessage {
  id: string;
  taskId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserInputRequest {
  taskId: string;
  stepId: string;
  question: string;
  inputType: 'otp' | 'confirmation' | 'choice' | 'freetext' | 'payment';
  options?: string[];
  timeout?: number;
}

export interface UserInputResponse {
  taskId: string;
  stepId: string;
  value: string;
}
