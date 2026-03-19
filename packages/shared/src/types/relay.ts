import type { RichInputType, InputSection, CardItem, InputSavedAddress, CounterConfig } from './agent';

export interface MCPToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// ─── Legacy MCP Relay Messages (kept for backward compat) ─────────────────

// Cloud → Laptop
export interface ToolCallRequest {
  id: string;
  type: 'tool_call';
  name: string;
  args: Record<string, unknown>;
  sessionId?: string;
}

export interface ToolListRequest {
  id: string;
  type: 'tool_list';
}

// Laptop → Cloud
export interface ToolCallResponse {
  id: string;
  type: 'tool_result';
  result: unknown;
  error?: string;
}

export interface ToolListResponse {
  id: string;
  type: 'tool_list_result';
  tools: MCPToolInfo[];
}

// Cloud → Laptop: session lifecycle
export interface SessionEndRequest {
  id: string;
  type: 'session_end';
  sessionId: string;
}

export interface SessionEndResponse {
  id: string;
  type: 'session_end_ack';
}

// ─── Task-Level Relay Messages (Copilot CLI architecture) ─────────────────

/** Skill info passed during task handoff */
export interface TaskSkillInfo {
  name: string;
  siteUrl: string;
  instructions: string;
  requiresAuth: boolean;
  params: Array<{ name: string; required: boolean; hint: string }>;
}

/** Cloud → Laptop: hand off a task for autonomous execution */
export interface TaskHandoffMessage {
  id: string;
  type: 'task_handoff';
  taskId: string;
  userId: string;
  description: string;
  skill?: TaskSkillInfo;
  extractedParams: Record<string, string>;
  conversationContext?: string;
}

/** Laptop → Cloud: progress update (streamed to frontend as SSE) */
export interface TaskProgressMessage {
  id: string;
  type: 'task_progress';
  taskId: string;
  message: string;
  step?: string;
}

/** Laptop → Cloud: agent needs user input */
export interface TaskInputRequiredMessage {
  id: string;
  type: 'task_input_required';
  taskId: string;
  stepId: string;
  question: string;
  inputType: RichInputType;
  options?: string[];
  // Rich input props (forwarded to frontend widget)
  cards?: CardItem[];
  show_quantity?: boolean;
  allow_custom?: boolean;
  multi_select?: boolean;
  saved?: InputSavedAddress[];
  mode?: 'single' | 'range';
  shortcuts?: string[];
  counters?: CounterConfig[];
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  placeholder?: string;
  format_hint?: string;
  sections?: InputSection[];
}

/** Cloud → Laptop: user's response to an input request */
export interface TaskInputResponseMessage {
  id: string;
  type: 'task_input_response';
  taskId: string;
  stepId: string;
  value: string;
}

/** Laptop → Cloud: payment required before proceeding */
export interface TaskPaymentRequiredMessage {
  id: string;
  type: 'task_payment_required';
  taskId: string;
  stepId: string;
  amount: number;
  description: string;
  bookingSummary?: Record<string, unknown>;
}

/** Cloud → Laptop: payment confirmation */
export interface TaskPaymentResponseMessage {
  id: string;
  type: 'task_payment_response';
  taskId: string;
  stepId: string;
  confirmed: boolean;
  paymentId?: string;
}

/** Laptop → Cloud: task completed successfully */
export interface TaskCompleteMessage {
  id: string;
  type: 'task_complete';
  taskId: string;
  summary: string;
  result?: Record<string, unknown>;
}

/** Laptop → Cloud: task failed */
export interface TaskErrorMessage {
  id: string;
  type: 'task_error';
  taskId: string;
  error: string;
  recoverable: boolean;
}

/** Cloud → Laptop: cancel a running task */
export interface TaskCancelMessage {
  id: string;
  type: 'task_cancel';
  taskId: string;
  reason?: string;
}

// ─── Bidirectional ────────────────────────────────────────────────────────

export interface HeartbeatPing {
  type: 'ping';
  timestamp: number;
}

export interface HeartbeatPong {
  type: 'pong';
  timestamp: number;
}

// ─── Union Types ──────────────────────────────────────────────────────────

export type TaskRelayMessage =
  | TaskHandoffMessage
  | TaskProgressMessage
  | TaskInputRequiredMessage
  | TaskInputResponseMessage
  | TaskPaymentRequiredMessage
  | TaskPaymentResponseMessage
  | TaskCompleteMessage
  | TaskErrorMessage
  | TaskCancelMessage;

export type RelayMessage =
  | ToolCallRequest
  | ToolCallResponse
  | ToolListRequest
  | ToolListResponse
  | SessionEndRequest
  | SessionEndResponse
  | TaskRelayMessage
  | HeartbeatPing
  | HeartbeatPong;

// ─── Type Guards ──────────────────────────────────────────────────────────

// Legacy
export function isToolCallRequest(msg: RelayMessage): msg is ToolCallRequest {
  return msg.type === 'tool_call';
}

export function isToolListRequest(msg: RelayMessage): msg is ToolListRequest {
  return msg.type === 'tool_list';
}

export function isToolCallResponse(msg: RelayMessage): msg is ToolCallResponse {
  return msg.type === 'tool_result';
}

export function isToolListResponse(msg: RelayMessage): msg is ToolListResponse {
  return msg.type === 'tool_list_result';
}

export function isSessionEndRequest(msg: RelayMessage): msg is SessionEndRequest {
  return msg.type === 'session_end';
}

export function isHeartbeatPing(msg: RelayMessage): msg is HeartbeatPing {
  return msg.type === 'ping';
}

export function isHeartbeatPong(msg: RelayMessage): msg is HeartbeatPong {
  return msg.type === 'pong';
}

// Task-level
export function isTaskHandoff(msg: RelayMessage): msg is TaskHandoffMessage {
  return msg.type === 'task_handoff';
}

export function isTaskProgress(msg: RelayMessage): msg is TaskProgressMessage {
  return msg.type === 'task_progress';
}

export function isTaskInputRequired(msg: RelayMessage): msg is TaskInputRequiredMessage {
  return msg.type === 'task_input_required';
}

export function isTaskInputResponse(msg: RelayMessage): msg is TaskInputResponseMessage {
  return msg.type === 'task_input_response';
}

export function isTaskPaymentRequired(msg: RelayMessage): msg is TaskPaymentRequiredMessage {
  return msg.type === 'task_payment_required';
}

export function isTaskPaymentResponse(msg: RelayMessage): msg is TaskPaymentResponseMessage {
  return msg.type === 'task_payment_response';
}

export function isTaskComplete(msg: RelayMessage): msg is TaskCompleteMessage {
  return msg.type === 'task_complete';
}

export function isTaskError(msg: RelayMessage): msg is TaskErrorMessage {
  return msg.type === 'task_error';
}

export function isTaskCancel(msg: RelayMessage): msg is TaskCancelMessage {
  return msg.type === 'task_cancel';
}

/** Check if a message is any task-level message */
export function isTaskMessage(msg: RelayMessage): msg is TaskRelayMessage {
  return msg.type.startsWith('task_');
}
