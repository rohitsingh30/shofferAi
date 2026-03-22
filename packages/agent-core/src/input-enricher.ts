import type { LLMClient } from './llm-client';
import { createLLMClient } from './llm-client';
import { logger } from '@shofferai/shared';
import type { ProductCardData, CardItem, RichInputType } from '@shofferai/shared';

// ─── Types ──────────────────────────────────────────────────────────

export interface InputEnrichRequest {
  question: string;
  inputType: RichInputType;
  options?: string[];
  cards?: CardItem[];
  product?: ProductCardData;
}

export interface InputEnrichResult extends InputEnrichRequest {
  enriched: boolean;
}

interface EnricherContext {
  skillName?: string;
  progressMessages: string[];
}

// ─── System Prompt ──────────────────────────────────────────────────

const ENRICHER_SYSTEM_PROMPT = `You are an input enricher for ShofferAI, an AI concierge that does real browser tasks.

A browser agent searched a shopping site and is now asking the user a question. But the agent sent a PLAIN TEXT question instead of structured data. Your job: extract product/item data from the conversation context and return structured JSON.

RESPOND WITH ONLY valid JSON — no markdown, no explanation, no backticks.

Rules:
1. If the context describes a SINGLE product the user should confirm, return a product_card:
   {"inputType":"product_card","question":"<clean question>","product":{"id":"<slug>","name":"<full name>","image":"","url":"<product page URL if mentioned, or null>","price":<number>,"mrp":<number or null>,"discount":"<X% off or null>","rating":<number or null>,"ratingCount":"<e.g. 4.2L or null>","delivery":"<date or null>","deliveryFree":<bool>,"specs":["spec1","spec2"],"offers":["offer1"],"color":"<if mentioned>","store":"<site name>"}}

2. If the context describes MULTIPLE products to choose from, return a carousel:
   {"inputType":"carousel","question":"<clean question>","cards":[{"id":"1","label":"<name>","subtitle":"<price + key detail>","image":"","badge":"⭐ <rating>"},{"id":"2",...}]}

3. If you can't extract enough data (no price, no product name), return:
   {"inputType":"text","question":"<original question>"}

Extract REAL values from the context. Never invent prices, ratings, or specs not mentioned.
For prices, use numbers without currency symbol (e.g. 1499 not ₹1,499).
For store, infer from context (Flipkart, Blinkit, Swiggy, Zomato, Myntra, etc.).`;

// ─── Enricher Class ─────────────────────────────────────────────────

const SHOPPING_SKILLS = new Set([
  'flipkart-shopping', 'myntra-shopping', 'amazon-shopping',
  'blinkit-grocery', 'zepto-grocery', 'swiggy-instamart',
]);

/** Input types that are already structured — skip enrichment */
const STRUCTURED_TYPES = new Set<RichInputType>([
  'carousel', 'card_grid', 'product_card', 'chip_bar',
  'address', 'calendar', 'stepper', 'slider', 'layout',
]);

export class InputEnricher {
  private llm: LLMClient;

  constructor(options?: { model?: string; llmClient?: LLMClient }) {
    this.llm = options?.llmClient || createLLMClient({
      model: options?.model || process.env.REWRITER_MODEL || process.env.LLM_MODEL,
    });
  }

  /**
   * Enrich a bare ask_user into a structured input type if possible.
   * Fast path: already structured → passthrough (~0ms).
   * Enrich path: bare text + shopping skill → LLM extraction (~200-400ms).
   */
  async enrich(
    input: InputEnrichRequest,
    context: EnricherContext,
  ): Promise<InputEnrichResult> {
    // Fast path: already has structured data
    if (STRUCTURED_TYPES.has(input.inputType)) {
      return { ...input, enriched: false };
    }
    if (input.product) {
      return { ...input, inputType: 'product_card', enriched: false };
    }
    if (input.cards && input.cards.length > 0) {
      return { ...input, enriched: false };
    }

    // Only enrich for shopping skills
    if (!context.skillName || !SHOPPING_SKILLS.has(context.skillName)) {
      return { ...input, enriched: false };
    }

    // Only enrich if we have progress context to extract from
    if (context.progressMessages.length === 0) {
      logger.debug('[enricher] no progress context, skipping');
      return { ...input, enriched: false };
    }

    // Build context from accumulated progress messages
    const progressContext = context.progressMessages
      .slice(-10)  // Last 10 messages max
      .join('\n');

    try {
      const response = await this.llm.chat({
        system: ENRICHER_SYSTEM_PROMPT,
        messages: [{
          role: 'user' as const,
          content: `CONVERSATION CONTEXT (agent progress messages):\n${progressContext}\n\nAGENT'S QUESTION TO USER:\n${input.question}`,
        }],
        maxTokens: 1024,
      });

      const textBlock = response.content
        .find((b) => b.type === 'text') as { type: 'text'; text: string } | undefined;
      const raw = textBlock?.text?.trim();

      if (!raw) {
        logger.warn('[enricher] empty LLM response');
        return { ...input, enriched: false };
      }

      // Strip markdown code fences if present
      const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

      const parsed = JSON.parse(jsonStr);

      // Validate the response has the expected shape
      if (!parsed.inputType || !parsed.question) {
        logger.warn('[enricher] invalid LLM response shape', { parsed });
        return { ...input, enriched: false };
      }

      // If LLM couldn't extract data, it returns inputType: "text"
      if (parsed.inputType === 'text') {
        logger.debug('[enricher] LLM returned text (not enough data to enrich)');
        return { ...input, enriched: false };
      }

      logger.info(`[enricher] enriched ${input.inputType} → ${parsed.inputType} (product: ${parsed.product?.name}, cards: ${parsed.cards?.length ?? 0})`);

      return {
        question: parsed.question,
        inputType: parsed.inputType as RichInputType,
        cards: parsed.cards,
        product: parsed.product,
        options: parsed.options,
        enriched: true,
      };
    } catch (error) {
      logger.warn('[enricher] failed, passing through', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { ...input, enriched: false };
    }
  }
}

// ─── Singleton ──────────────────────────────────────────────────────

let _instance: InputEnricher | null = null;

export function getInputEnricher(): InputEnricher {
  if (!_instance) {
    _instance = new InputEnricher();
  }
  return _instance;
}
