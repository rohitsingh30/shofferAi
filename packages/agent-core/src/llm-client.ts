import type { MessageParam, Tool, ContentBlock } from '@anthropic-ai/sdk/resources/messages';

export interface LLMResponse {
  content: ContentBlock[];
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number };
}

export interface LLMChatParams {
  system: string;
  messages: MessageParam[];
  tools?: Tool[];
  maxTokens?: number;
}

export interface LLMClient {
  chat(params: LLMChatParams): Promise<LLMResponse>;
}

export type LLMProvider = 'azure-openai';

/**
 * Create LLM client (Azure OpenAI).
 */
export function createLLMClient(options?: {
  provider?: LLMProvider;
  apiKey?: string;
  model?: string;
}): LLMClient {
  const { AzureOpenAIClient } = require('./azure-openai-client');
  return new AzureOpenAIClient({ apiKey: options?.apiKey, model: options?.model });
}
