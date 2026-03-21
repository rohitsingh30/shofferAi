import type { LLMClient } from './llm-client';
import { createLLMClient } from './llm-client';
import { logger } from '@shofferai/shared';
import type { SkillParam } from './skills/types';

const EXTRACTION_SYSTEM_PROMPT = `You extract parameter values from a user's message for a concierge AI service.

Given a list of parameter definitions and a user message, extract any values that are present.

RESPOND WITH ONLY a valid JSON object. Keys = param names, values = extracted strings.
Omit any param that is NOT present in the message.

Examples:
User: "search for wireless earbuds under 2000 on flipkart"
Params: product (What to buy), budget (Max price)
→ {"product": "wireless earbuds", "budget": "2000"}

User: "order milk and bread from blinkit"
Params: items (What to order), address (Delivery address)
→ {"items": "milk, bread"}

User: "book a hotel in Goa for this weekend"
Params: destination, checkin_date, checkout_date, guests
→ {"destination": "Goa", "checkin_date": "this weekend"}

RULES:
- Extract ONLY values explicitly stated or clearly implied
- For budget: normalize to a number string ("under 2k" → "2000", "around 1.5k" → "1500")
- For items/products: use the user's exact phrasing
- Do NOT invent or guess values not in the message
- RESPOND WITH ONLY JSON — no explanation, no markdown`;

/**
 * Extracts skill parameter values from a user's message using a fast LLM call.
 *
 * Runs BEFORE the main agent loop so that `buildSystemPrompt` can inject
 * extracted values as facts — the main LLM never gets the chance to re-ask
 * for information the user already provided.
 */
export class ParamExtractor {
  private llm: LLMClient;

  constructor(options?: { model?: string; llmClient?: LLMClient }) {
    this.llm = options?.llmClient || createLLMClient({
      model: options?.model || process.env.REWRITER_MODEL || process.env.LLM_MODEL,
    });
  }

  /**
   * Extract param values from user message.
   * Returns a map of param name → extracted value (only for params found in the message).
   */
  async extract(
    userMessage: string,
    params: SkillParam[],
  ): Promise<Record<string, string>> {
    if (!userMessage?.trim() || !params?.length) return {};

    const paramList = params
      .map(p => `- ${p.name}: ${p.hint}`)
      .join('\n');

    try {
      const response = await this.llm.chat({
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [{
          role: 'user' as const,
          content: `Parameters:\n${paramList}\n\nUser message: "${userMessage}"`,
        }],
        maxTokens: 256,
      });

      const textBlock = response.content
        .find((b) => b.type === 'text') as { type: 'text'; text: string } | undefined;
      const text = textBlock?.text?.trim();

      if (!text) return {};

      // Strip markdown fences if the LLM wraps the JSON
      const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const extracted = JSON.parse(cleaned);

      // Validate: only keep string values for known param names
      const paramNames = new Set(params.map(p => p.name));
      const result: Record<string, string> = {};
      for (const [key, val] of Object.entries(extracted)) {
        if (paramNames.has(key) && typeof val === 'string' && val.trim()) {
          result[key] = val.trim();
        }
      }

      logger.info('[param-extractor] extracted', { params: result });
      return result;
    } catch (err) {
      logger.warn('[param-extractor] extraction failed, falling back to LLM reasoning', { error: err });
      return {};
    }
  }
}
