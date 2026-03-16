import type { UserInputRequest, UserInputResponse } from './agent';

export type WSMessageType =
  | 'task_started'
  | 'step_update'
  | 'input_required'
  | 'input_response'
  | 'task_completed'
  | 'task_failed'
  | 'agent_message'
  | 'browser_screenshot';

export interface WSMessage {
  type: WSMessageType;
  taskId: string;
  payload: unknown;
}

export interface WSTaskStarted extends WSMessage {
  type: 'task_started';
  payload: { description: string; workflowType: string };
}

export interface WSStepUpdate extends WSMessage {
  type: 'step_update';
  payload: {
    stepNumber: number;
    action: string;
    status: string;
    totalSteps?: number;
  };
}

export interface WSInputRequired extends WSMessage {
  type: 'input_required';
  payload: UserInputRequest;
}

export interface WSInputResponse extends WSMessage {
  type: 'input_response';
  payload: UserInputResponse;
}

export interface WSTaskCompleted extends WSMessage {
  type: 'task_completed';
  payload: { result: Record<string, unknown>; summary: string };
}

export interface WSTaskFailed extends WSMessage {
  type: 'task_failed';
  payload: { error: string; step?: number };
}

export interface WSAgentMessage extends WSMessage {
  type: 'agent_message';
  payload: { role: 'assistant'; content: string };
}

export interface WSBrowserScreenshot extends WSMessage {
  type: 'browser_screenshot';
  payload: { screenshot: string }; // base64
}
