import type { LLMClient } from './llm-client';
import { createLLMClient } from './llm-client';
import { shouldSuppressMessage } from '@shofferai/shared';
import { logger } from '@shofferai/shared';

/**
 * System prompt for the message rewriter LLM.
 * Kept minimal to reduce latency and cost.
 */
const REWRITER_SYSTEM_PROMPT = `You filter internal messages from a browser automation agent before showing them to a user of a concierge AI service called ShofferAI.

RESPOND WITH EXACTLY ONE OF:
1. SUPPRESS — if the message is internal narration, browser actions, reasoning, or technical details
2. A clean 1-2 sentence rewrite — if the message has genuinely useful info for the user

Rules:
- Internal = "I can see...", "Let me click...", "The page shows...", "Navigating to...", "I can get/fetch/provide those...", step references, selector names, any browser mechanics, capability offers about internal data
- ALWAYS SUPPRESS these (system bounce-back responses):
  • Any mention of "image URL(s)", "image src", "browser_snapshot" — these are internal technical terms
  • "The system says/rejected/wants..." — references to internal validation
  • "I have reached the question limit" / "cannot ask more questions" — internal limits
  • "According to the skill/instructions..." — internal workflow references
  • "I should/need to extract/get the [technical thing]" — internal task planning
  • "Which product/result are you referring to?" when responding to an internal bounce — not a real user question
- ALWAYS SUPPRESS short status messages like "On it!", "Finding...", "Searching...", "Got it! Getting..." — these have zero useful information
- Useful = SPECIFIC search results with names/prices, availability, order status with details, confirmation with specifics, errors that affect the user
- Write as the AI assistant ("I found..." not "The agent found...")
- Never mention browser, tabs, clicking, navigating, selectors, or internal tools
- Never refer to "the user" in third person
- NEVER invent, fabricate, or add information not present in the original message. If the original says "Finding earbuds" do NOT list actual product names or prices — just SUPPRESS it.
- The rewrite must be SHORTER than or equal in length to the original. Never expand a short message into a long one.
- When in doubt, SUPPRESS
- RESPOND ONLY with "SUPPRESS" or the rewritten text — nothing else`;

/**
 * AI-powered message rewriter that classifies browser agent messages
 * and either suppresses internal narration or rewrites them into
 * clean user-facing text.
 *
 * Two-tier architecture:
 * 1. Fast path: regex `shouldSuppressMessage()` catches ~90% instantly (free)
 * 2. AI path: LLM classifies + rewrites the remaining ~10% (~200ms per call)
 */
export class MessageRewriter {
  private llm: LLMClient;

  constructor(options?: { model?: string; llmClient?: LLMClient }) {
    this.llm = options?.llmClient || createLLMClient({
      model: options?.model || process.env.REWRITER_MODEL || process.env.LLM_MODEL,
    });
  }

  /**
   * Process a browser agent message. Returns:
   * - null → suppress (don't show to user)
   * - string → rewritten user-facing text
   */
  async rewrite(message: string): Promise<string | null> {
    if (!message?.trim()) return null;

    // Fast path: regex catches obviously internal messages (free, <1ms)
    if (shouldSuppressMessage(message)) {
      logger.debug('[rewriter] regex-suppressed', { message: message.slice(0, 80) });
      return null;
    }

    try {
      const response = await this.llm.chat({
        system: REWRITER_SYSTEM_PROMPT,
        messages: [{ role: 'user' as const, content: message }],
        maxTokens: 256,
      });

      const textBlock = response.content
        .find((b) => b.type === 'text') as { type: 'text'; text: string } | undefined;
      const text = textBlock?.text?.trim();

      if (!text || /^suppress$/i.test(text)) {
        logger.debug('[rewriter] ai-suppressed', { message: message.slice(0, 80) });
        return null;
      }

      // If the LLM echoed back something that looks like narration, suppress
      if (shouldSuppressMessage(text)) {
        logger.debug('[rewriter] ai-rewrite still narration, suppressing', { rewrite: text.slice(0, 80) });
        return null;
      }

      // Hallucination guard: if the rewrite is significantly longer than the original,
      // the LLM likely fabricated content (e.g., invented product lists from "On it!")
      if (text.length > message.length * 2.5 && text.length > 100) {
        logger.warn('[rewriter] hallucination guard: rewrite much longer than original, suppressing', {
          originalLen: message.length,
          rewriteLen: text.length,
          rewrite: text.slice(0, 100),
        });
        return null;
      }

      logger.info('[rewriter] rewritten', { from: message.slice(0, 60), to: text.slice(0, 60) });
      return text;
    } catch (error) {
      // Safety: suppress on AI failure — never leak unfiltered agent messages
      logger.warn('[rewriter] LLM call failed, suppressing for safety', { error, message: message.slice(0, 100) });
      return null;
    }
  }
}

/** Lazy singleton — created on first use */
let _instance: MessageRewriter | null = null;

export function getMessageRewriter(): MessageRewriter {
  if (!_instance) {
    _instance = new MessageRewriter();
  }
  return _instance;
}
