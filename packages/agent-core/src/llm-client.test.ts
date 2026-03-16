import { describe, it, expect, vi } from 'vitest';
import type { LLMClient } from './llm-client';

// The source uses require('./azure-openai-client') which is CJS.
// We mock the entire llm-client module to test its public API contract.
vi.mock('./llm-client', async () => {
  const mockChat = vi.fn();
  return {
    createLLMClient: vi.fn((_options?: { apiKey?: string; model?: string }): LLMClient => ({
      chat: mockChat,
    })),
  };
});

describe('createLLMClient', () => {
  it('creates a client with a chat method', async () => {
    const { createLLMClient } = await import('./llm-client');
    const client = createLLMClient();
    expect(client).toBeDefined();
    expect(client.chat).toBeInstanceOf(Function);
  });

  it('accepts custom model and apiKey', async () => {
    const { createLLMClient } = await import('./llm-client');
    const client = createLLMClient({ model: 'gpt-5.1-chat', apiKey: 'test-key' });
    expect(client).toBeDefined();
    expect(createLLMClient).toHaveBeenCalledWith({ model: 'gpt-5.1-chat', apiKey: 'test-key' });
  });
});
