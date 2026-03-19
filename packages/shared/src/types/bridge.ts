/**
 * Bridge MCP ↔ TaskManager local WebSocket protocol.
 *
 * The Bridge MCP Server is spawned by Copilot CLI (as a grandchild of TaskManager).
 * It connects to TaskManager via a local WebSocket on `ws://localhost:{BRIDGE_WS_PORT}`.
 * Messages are routed by taskId.
 */

import type { RichInputType, CardItem, InputSavedAddress, CounterConfig, InputSection } from './agent';

// ─── Bridge MCP → TaskManager ─────────────────────────────────────────────

export interface BridgeRegisterMessage {
  type: 'bridge_register';
  taskId: string;
}

export interface BridgeAskUserMessage {
  type: 'bridge_ask_user';
  taskId: string;
  stepId: string;
  question: string;
  inputType: RichInputType;
  options?: string[];
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

export interface BridgeRequestPaymentMessage {
  type: 'bridge_request_payment';
  taskId: string;
  stepId: string;
  amount: number;
  description: string;
  bookingSummary?: Record<string, unknown>;
}

export interface BridgeProgressMessage {
  type: 'bridge_progress';
  taskId: string;
  message: string;
  step?: string;
}

export interface BridgeCompleteMessage {
  type: 'bridge_complete';
  taskId: string;
  summary: string;
  result?: Record<string, unknown>;
}

export interface BridgeErrorMessage {
  type: 'bridge_error';
  taskId: string;
  error: string;
  recoverable: boolean;
}

// ─── TaskManager → Bridge MCP ─────────────────────────────────────────────

export interface BridgeInputResponseMessage {
  type: 'bridge_input_response';
  taskId: string;
  stepId: string;
  value: string;
}

export interface BridgePaymentResponseMessage {
  type: 'bridge_payment_response';
  taskId: string;
  stepId: string;
  confirmed: boolean;
  paymentId?: string;
}

export interface BridgeCancelMessage {
  type: 'bridge_cancel';
  taskId: string;
  reason?: string;
}

export interface BridgeRegisteredMessage {
  type: 'bridge_registered';
  taskId: string;
}

// ─── Union Types ──────────────────────────────────────────────────────────

/** Messages sent from Bridge MCP Server → TaskManager */
export type BridgeOutgoingMessage =
  | BridgeRegisterMessage
  | BridgeAskUserMessage
  | BridgeRequestPaymentMessage
  | BridgeProgressMessage
  | BridgeCompleteMessage
  | BridgeErrorMessage;

/** Messages sent from TaskManager → Bridge MCP Server */
export type BridgeIncomingMessage =
  | BridgeRegisteredMessage
  | BridgeInputResponseMessage
  | BridgePaymentResponseMessage
  | BridgeCancelMessage;

export type BridgeMessage = BridgeOutgoingMessage | BridgeIncomingMessage;

// ─── Type Guards ──────────────────────────────────────────────────────────

export function isBridgeRegister(msg: BridgeMessage): msg is BridgeRegisterMessage {
  return msg.type === 'bridge_register';
}

export function isBridgeAskUser(msg: BridgeMessage): msg is BridgeAskUserMessage {
  return msg.type === 'bridge_ask_user';
}

export function isBridgeRequestPayment(msg: BridgeMessage): msg is BridgeRequestPaymentMessage {
  return msg.type === 'bridge_request_payment';
}

export function isBridgeProgress(msg: BridgeMessage): msg is BridgeProgressMessage {
  return msg.type === 'bridge_progress';
}

export function isBridgeComplete(msg: BridgeMessage): msg is BridgeCompleteMessage {
  return msg.type === 'bridge_complete';
}

export function isBridgeError(msg: BridgeMessage): msg is BridgeErrorMessage {
  return msg.type === 'bridge_error';
}

export function isBridgeInputResponse(msg: BridgeMessage): msg is BridgeInputResponseMessage {
  return msg.type === 'bridge_input_response';
}

export function isBridgePaymentResponse(msg: BridgeMessage): msg is BridgePaymentResponseMessage {
  return msg.type === 'bridge_payment_response';
}

export function isBridgeCancel(msg: BridgeMessage): msg is BridgeCancelMessage {
  return msg.type === 'bridge_cancel';
}
