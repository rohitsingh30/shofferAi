export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface MCPHostLike {
  connect(): Promise<void>;
  getTools(): MCPTool[];
  getToolsAsAnthropicFormat(): AnthropicTool[];
  isMCPTool(toolName: string): boolean;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  disconnect(): Promise<void>;
}
