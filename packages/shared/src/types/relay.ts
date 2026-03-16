export interface MCPToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// Cloud → Laptop
export interface ToolCallRequest {
  id: string;
  type: 'tool_call';
  name: string;
  args: Record<string, unknown>;
  sessionId?: string; // Tab isolation: each session gets its own browser tab
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

// Laptop → Cloud: session lifecycle ack
export interface SessionEndResponse {
  id: string;
  type: 'session_end_ack';
}

// Bidirectional
export interface HeartbeatPing {
  type: 'ping';
  timestamp: number;
}

export interface HeartbeatPong {
  type: 'pong';
  timestamp: number;
}

export type RelayMessage =
  | ToolCallRequest
  | ToolCallResponse
  | ToolListRequest
  | ToolListResponse
  | SessionEndRequest
  | SessionEndResponse
  | HeartbeatPing
  | HeartbeatPong;

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
