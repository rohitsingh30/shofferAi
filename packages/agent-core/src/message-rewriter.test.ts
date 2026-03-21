import { describe, it, expect, vi } from 'vitest';
import { MessageRewriter } from './message-rewriter';
import type { LLMClient } from './llm-client';

/** Create a mock LLM client that returns a fixed response */
function mockLLM(response: string): LLMClient {
  return {
    chat: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: response }],
      stopReason: 'end_turn',
      usage: { inputTokens: 50, outputTokens: 10 },
    }),
  };
}

describe('MessageRewriter', () => {
  describe('regex fast path (no LLM call)', () => {
    it('suppresses obviously internal messages without LLM call', async () => {
      const llm = mockLLM('should not be called');
      const rewriter = new MessageRewriter({ llmClient: llm });

      expect(await rewriter.rewrite('Browser: browser_click')).toBeNull();
      expect(await rewriter.rewrite('I can see the page has loaded')).toBeNull();
      expect(await rewriter.rewrite('Let me click on the search button')).toBeNull();
      expect(await rewriter.rewrite('')).toBeNull();
      expect(await rewriter.rewrite(undefined as unknown as string)).toBeNull();

      // LLM should NOT have been called for any of these
      expect(llm.chat).not.toHaveBeenCalled();
    });
  });

  describe('AI rewrite path', () => {
    it('returns rewritten text when LLM returns user-facing content', async () => {
      const llm = mockLLM('Found 3 hotels under ₹4000 in Mumbai.');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('Here are 3 hotels under ₹4000/night in Mumbai.');
      expect(result).toBe('Found 3 hotels under ₹4000 in Mumbai.');
      expect(llm.chat).toHaveBeenCalledTimes(1);
    });

    it('suppresses when LLM returns SUPPRESS', async () => {
      const llm = mockLLM('SUPPRESS');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('The price is within budget and this looks good.');
      expect(result).toBeNull();
    });

    it('suppresses case-insensitive SUPPRESS', async () => {
      const llm = mockLLM('suppress');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('Some ambiguous message');
      expect(result).toBeNull();
    });

    it('suppresses if LLM rewrite is itself narration', async () => {
      // LLM might rewrite into something that's still narration
      const llm = mockLLM('I can see several options available.');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('The page shows multiple options to choose from.');
      expect(result).toBeNull();
    });
  });

  describe('fallback on error', () => {
    it('returns original message when LLM call fails', async () => {
      const llm: LLMClient = {
        chat: vi.fn().mockRejectedValue(new Error('API timeout')),
      };
      const rewriter = new MessageRewriter({ llmClient: llm });

      // Message that passes regex → LLM fails → returns original
      const result = await rewriter.rewrite('Your order total is ₹567.');
      expect(result).toBe('Your order total is ₹567.');
    });
  });

  describe('empty/null responses', () => {
    it('suppresses when LLM returns empty text', async () => {
      const llm = mockLLM('');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('Some message');
      expect(result).toBeNull();
    });

    it('suppresses when LLM returns whitespace', async () => {
      const llm = mockLLM('   ');
      const rewriter = new MessageRewriter({ llmClient: llm });

      const result = await rewriter.rewrite('Some message');
      expect(result).toBeNull();
    });
  });
});
