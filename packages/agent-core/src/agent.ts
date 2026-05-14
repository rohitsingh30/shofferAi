/**
 * AgentExecutor — cloud chat loop, MCP tool dispatch.
 *
 * After the migration to the Browser Operations Service:
 *   - The LLM's tool list = cloud-side tools (ask_user, confirm_action,
 *     collect_payment, save_address, report_step, report_cart,
 *     report_price_comparison, update_order_status) + whatever MCP tools
 *     the host advertises (today: bigbasket.search, bigbasket.add_to_cart,
 *     bigbasket.get_cart, bigbasket.whoami, etc.).
 *   - Browser-side tools (anything not in CLOUD_TOOL_NAMES) are dispatched
 *     directly to mcpHost.callTool(). No `browse_website` mega-tool, no
 *     `handoff_to_browser_agent`, no recorder/player.
 *
 * See docs/BROWSER-SERVICE-CONTRACT.md for the wire contract.
 */

import type { Tool, ContentBlock, ToolUseBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { type LLMClient, createLLMClient } from './llm-client';
import { ConversationManager } from './conversation';
import { buildSystemPrompt } from './prompts/system';
import { ParamExtractor } from './param-extractor';
import {
  logger,
  type MCPHostLike,
  type AnthropicTool,
  type CredentialInjectorLike,
  type UserInputRequest,
  type UserInputResponse,
  type RichInputType,
} from '@shofferai/shared';
import type { SkillMetadata, LessonStore, LessonEntry } from './skills/types';
import { loadSkills, matchSkill } from './skills/loader';

function formatSkillName(id: string): string {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export interface AgentCallbacks {
  onMessage: (content: string) => void;
  onStepUpdate: (step: { action: string; status: string }) => void;
  onInputRequired: (request: UserInputRequest) => Promise<UserInputResponse>;
  onConfirmRequired: (details: { action: string; description: string }) => Promise<boolean>;
  onPaymentRequired?: (details: { bookingSummary: string; amountInr: number; description: string }) => Promise<boolean>;
  onComplete: (summary: string) => void;
  onError: (error: string) => void;
  /** Optional: called when LLM emits suggest_replies. Frontend renders chips
   *  on the most recent assistant message. */
  onSuggestions?: (chips: string[]) => void;
}

export type TelemetryTracker = (data: {
  event: string;
  category: string;
  userId?: string;
  taskId?: string;
  success?: boolean;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}) => void;

export interface AgentConfig {
  mcpHost: MCPHostLike;
  credentialInjector: CredentialInjectorLike;
  llmClient?: LLMClient;
  skills?: SkillMetadata[];
  lessonStore?: LessonStore;
  trackEvent?: TelemetryTracker;
  taskId?: string;
  userContext: {
    name?: string;
    email?: string;
    userId?: string;
    addressLabels?: string[];
    savedAddresses?: Array<{ label: string; address: string }>;
    credentialLabels?: { id: string; label: string; type: string }[];
    preferences?: Record<string, unknown>;
  };
  vault?: { list(userId: string): Promise<Array<{ id: string; label: string; type: string }>>; getFieldValue(credentialId: string, userId: string, fieldType: string): Promise<string> };
  onSaveAddress?: (userId: string, address: Record<string, unknown>) => Promise<{ saved: boolean; addressCount?: number; error?: string }>;
  maxIterations?: number;
  previousContext?: string;
}

// ──────────────────────────────────────────────────────────────────
// Cloud-side tools — handled directly inside agent.handleToolCall().
// ──────────────────────────────────────────────────────────────────

const CLOUD_TOOLS: Tool[] = [
  {
    name: 'ask_user',
    description:
      'Ask the user for input needed to continue the task. Use the richest input_type for the data: card_grid for item selection with quantities, carousel for visual choices, chip_bar for toggleable filters, address for delivery/pickup locations, calendar for dates, stepper for counts, slider for budgets, text/freetext for free-form input, layout to combine multiple patterns.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question:    { type: 'string', description: 'The question or heading to display' },
        input_type:  { type: 'string', enum: ['otp','confirmation','choice','freetext','card_grid','carousel','multi_store_carousel','chip_bar','address','calendar','stepper','slider','text','layout'] },
        options:     { type: 'array', items: { type: 'string' }, description: 'Options for choice / chip_bar' },
        cards:       { type: 'array', items: { type: 'object' }, description: 'Visual cards for card_grid / carousel' },
        stores:      { type: 'array', items: { type: 'object' }, description: 'Store sections for multi_store_carousel — each { store, icon?, delivery?, badge?, error?, cards: [...] }' },
        summary:     { type: 'string', description: 'Optional summary line above multi_store_carousel sections, e.g. "Cheapest at Zepto · ₹29"' },
        show_quantity: { type: 'boolean' },
        multi_select:  { type: 'boolean' },
        instant_add:   { type: 'boolean', description: 'When true on carousel/card_grid, each card shows a per-card ADD button that fires immediately (no submit-bar wait). Use for grocery / shopping flows where one-tap-to-cart is expected.' },
        saved:       { type: 'array', items: { type: 'object' }, description: 'Saved addresses (address type)' },
        mode:        { type: 'string', enum: ['single','range'], description: 'Calendar mode' },
        shortcuts:   { type: 'array', items: { type: 'string' } },
        counters:    { type: 'array', items: { type: 'object' } },
        min:         { type: 'number' },
        max:         { type: 'number' },
        step:        { type: 'number' },
        presets:     { type: 'array', items: { type: 'number' } },
        placeholder: { type: 'string' },
        format_hint: { type: 'string' },
        sections:    { type: 'array', items: { type: 'object' } },
      },
      required: ['question', 'input_type'],
    },
  },
  {
    name: 'confirm_action',
    description: 'Request user confirmation before performing a sensitive action like placing an order or making a payment. Always use this before irreversible actions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action_description: { type: 'string', description: 'What action is about to be taken' },
        details:            { type: 'string', description: 'Details like total price, item list, dates, etc.' },
      },
      required: ['action_description'],
    },
  },
  {
    name: 'collect_payment',
    description: 'Collect payment from the user before finalizing an order or booking. Opens a payment panel where the user reviews the order summary, optionally tips, and pays via Razorpay (UPI, cards, net banking).',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary:     { type: 'string', description: 'JSON string with order/booking details' },
        amount_inr:  { type: 'number', description: 'Total amount in INR' },
        description: { type: 'string', description: 'Short description of what the payment is for' },
      },
      required: ['summary', 'amount_inr', 'description'],
    },
  },
  {
    name: 'save_address',
    description: 'Save a new delivery/pickup address to the user profile. Call this when the user provides a NEW address that isn\'t in their saved list.',
    input_schema: {
      type: 'object' as const,
      properties: {
        label:         { type: 'string', description: 'A friendly label like "Home", "Office"' },
        flatNo:        { type: 'string' },
        line1:         { type: 'string' },
        line2:         { type: 'string' },
        city:          { type: 'string' },
        state:         { type: 'string' },
        pincode:       { type: 'string' },
        contactNumber: { type: 'string' },
      },
      required: ['label', 'line1', 'pincode'],
    },
  },
  {
    name: 'report_step',
    description: 'Report completion of a workflow step. Call this after finishing each step in the active skill to track progress.',
    input_schema: {
      type: 'object' as const,
      properties: {
        step_number: { type: 'number' },
        step_name:   { type: 'string' },
        outcome:     { type: 'string' },
      },
      required: ['step_number', 'step_name', 'outcome'],
    },
  },
  {
    name: 'report_cart',
    description: 'Report the current shopping cart state to the user. Renders a visual cart summary in the chat.',
    input_schema: {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name:     { type: 'string' },
              quantity: { type: 'number' },
              price:    { type: 'string', description: 'Price with currency symbol (e.g. "₹35")' },
            },
            required: ['name', 'quantity', 'price'],
          },
        },
        total: { type: 'string', description: 'Cart total with currency symbol' },
        store: { type: 'string' },
      },
      required: ['items', 'total'],
    },
  },
  {
    name: 'update_order_status',
    description:
      'Update the order status. Call after placing an order, when delivery status changes, or on checkout failure.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['order_placed','checkout_failed','shipped','out_for_delivery','delivered','cancelled'] },
        target_order_id:    { type: 'string' },
        target_order_url:   { type: 'string' },
        target_tracking_url:{ type: 'string' },
        estimated_delivery: { type: 'string' },
        failure_reason:     { type: 'string' },
        tracking_number:    { type: 'string' },
        courier_name:       { type: 'string' },
        message:            { type: 'string' },
      },
      required: ['status'],
    },
  },
  {
    name: 'suggest_replies',
    description:
      'Attach 2-4 quick-reply chips to your most recent assistant message so the user can keep the conversation flowing without typing. Use this after every meaningful agent response (showing search results, after a cart action, after a confirmation, etc.). Chips should be short imperative phrases the user might naturally say next. Examples: "Add Amul Gold 1L", "Show cheaper options", "Compare with Zepto", "Remove from cart", "Show my cart". Do NOT include questions ("Want to see more?") — chips are user actions, not agent questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        chips: {
          type: 'array',
          items: { type: 'string' },
          description: '2-4 short imperative phrases the user might tap as their next message. Each ≤ 40 chars.',
          minItems: 1,
          maxItems: 6,
        },
      },
      required: ['chips'],
    },
  },
];

const CLOUD_TOOL_NAMES = new Set(CLOUD_TOOLS.map(t => t.name));
const USER_BLOCKING_TOOLS = new Set(['ask_user', 'confirm_action', 'collect_payment']);

export class AgentExecutor {
  private claude: LLMClient;
  private conversation: ConversationManager;
  private systemPrompt: string;
  private mcpHost: MCPHostLike;
  private injector: CredentialInjectorLike;
  private maxIterations: number;
  private isRunning = false;
  public matchedSkill: SkillMetadata | null = null;
  private allSkills: SkillMetadata[];
  private trackEvent: TelemetryTracker;
  private taskId: string | undefined;
  private activeLessons: LessonEntry[] = [];
  private toolCallSequence: string[] = [];
  private readonly loopDetectionWindow = 6;
  private readonly maxLoopCycles = 3;
  private askUserCount = 0;
  private readonly maxAskUserCalls = 5;
  private collectedParams: Record<string, string> = {};

  constructor(private config: AgentConfig) {
    this.claude = config.llmClient || createLLMClient();
    this.conversation = new ConversationManager();
    this.allSkills = config.skills || loadSkills();
    this.systemPrompt = buildSystemPrompt(
      config.userContext, this.allSkills, undefined, undefined, undefined, config.previousContext,
    );
    this.mcpHost = config.mcpHost;
    this.injector = config.credentialInjector;
    this.maxIterations = config.maxIterations || 25;
    this.trackEvent = config.trackEvent || (() => {});
    this.taskId = config.taskId;
  }

  async execute(userMessage: string, callbacks: AgentCallbacks): Promise<void> {
    if (this.isRunning) throw new Error('Agent is already executing a task');
    this.isRunning = true;

    if (this.allSkills.length > 0) {
      this.matchedSkill = matchSkill(this.allSkills, userMessage);
      if (this.matchedSkill) {
        const [lessons, extractedParams] = await Promise.all([
          (async () => {
            if (!this.config.lessonStore) return [];
            try {
              return await this.config.lessonStore.loadForSkill(this.matchedSkill!.name, 10);
            } catch (err) {
              logger.warn('Failed to load lessons', { error: err });
              return [];
            }
          })(),
          (async () => {
            if (!this.matchedSkill!.params?.length) return {};
            try {
              const extractor = new ParamExtractor({ model: process.env.REWRITER_MODEL });
              return await extractor.extract(userMessage, this.matchedSkill!.params!);
            } catch (err) {
              logger.warn('Param extraction failed', { error: err });
              return {};
            }
          })(),
        ]);
        this.activeLessons = lessons;
        // Capture site tool names so we can inject them into the system prompt
        // explicitly (the skill markdown still references old browser-style ops
        // like "Click button Add" / "Take snapshot" — without an explicit list
        // of what's actually callable, the LLM gives up after one round).
        const siteToolNames = (this.mcpHost.getTools?.() ?? []).map(t => t.name);
        this.systemPrompt = buildSystemPrompt(
          this.config.userContext, this.allSkills, this.matchedSkill, this.activeLessons,
          Object.keys(extractedParams).length > 0 ? extractedParams : undefined,
          this.config.previousContext,
          siteToolNames,
        );
        callbacks.onStepUpdate({
          action: `🧠 ${formatSkillName(this.matchedSkill.name)} — let me handle this`,
          status: 'running',
        });
      }
    }

    this.conversation.addUserMessage(userMessage);

    // Tool list = cloud tools + MCP tools advertised by the host (e.g. bigbasket.search).
    const mcpTools = this.mcpHost.getToolsAsAnthropicFormat
      ? this.mcpHost.getToolsAsAnthropicFormat()
      : [];
    const allTools: Tool[] = [
      ...CLOUD_TOOLS,
      ...mcpTools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema,
      } as Tool)),
    ];

    let iterations = 0;

    try {
      while (iterations < this.maxIterations) {
        iterations++;

        const llmStart = Date.now();
        const response = await this.claude.chat({
          system: this.systemPrompt,
          messages: this.conversation.getMessages(),
          tools: allTools,
          maxTokens: 4096,
        });
        const llmDuration = Date.now() - llmStart;
        this.trackEvent({
          event: 'llm_call', category: 'llm',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: llmDuration, success: true,
          metadata: {
            iteration: iterations,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            stopReason: response.stopReason,
            skillName: this.matchedSkill?.name,
          },
        });

        const toolUseBlocks: ToolUseBlock[] = [];
        const textBlocks: TextBlock[] = [];
        for (const block of response.content) {
          if (block.type === 'text') textBlocks.push(block);
          else if (block.type === 'tool_use') toolUseBlocks.push(block);
        }

        this.conversation.addAssistantMessage(response.content);

        // No tool calls → check if LLM asked a question as plain text
        if (response.stopReason === 'end_turn' && toolUseBlocks.length === 0) {
          const fullText = textBlocks.map(b => b.text).join('\n').trim();

          // Auto-convert text questions to ask_user — frontend wants widgets, not raw text
          const lowerText = fullText.toLowerCase();
          const looksLikeError = /\b(timeout|timed out|failed to|unable to|error|retry|try again|stuck)\b/.test(lowerText);
          const hasQuestionMark = fullText.includes('?');
          const looksLikeImperative =
            /\bplease\s+(provide|list|share|tell|enter|specify|confirm|give|mention|type)/i.test(fullText) ||
            /\b(let me know|i need to know|could you|can you)\b/i.test(fullText);
          const looksLikeQuestion = !looksLikeError && (hasQuestionMark || looksLikeImperative);

          if (looksLikeQuestion) {
            const syntheticId = `auto_ask_${Date.now()}`;
            const extractedOptions = fullText
              .split(/\n/)
              .filter((l: string) => /^\s*(?:•|[-*]|\d+[.)]\s)/.test(l))
              .map((l: string) => l.replace(/^\s*(?:•|[-*]|\d+[.)]\s)\s*/, '').trim())
              .filter(Boolean);
            const hasChoices = extractedOptions.length >= 2;
            const isAddress = /\b(address|deliver[y]?\s*(location|address)?|where.*(deliver|ship|send)|pincode|zip\s*code)\b/i.test(fullText);
            const isDate = /\b(date|when|check.?in|check.?out|schedule|time\s*slot|delivery\s*slot)\b/i.test(fullText) && /\b(pick|choose|select|prefer|when|schedule)\b/i.test(fullText);
            const isYesNo = /\b(yes\s*\/?\s*no|y\s*\/?\s*n)\b/i.test(fullText) ||
              (/\b(confirm|proceed|continue|go ahead|shall i|should i|ready to|want me to)\b/i.test(fullText) && hasQuestionMark && fullText.length < 200);

            let inputType: RichInputType;
            if (isAddress) inputType = 'address';
            else if (isDate) inputType = 'calendar';
            else if (isYesNo) inputType = 'confirmation';
            else if (hasChoices) inputType = 'choice';
            else inputType = 'freetext';

            this.conversation.replaceLastMessage([
              { type: 'text', text: fullText } as ContentBlock,
              { type: 'tool_use', id: syntheticId, name: 'ask_user', input: { question: fullText, input_type: inputType, options: hasChoices ? extractedOptions : undefined } } as ContentBlock,
            ]);

            const userResponse = await callbacks.onInputRequired({
              taskId: '', stepId: syntheticId, question: fullText, inputType,
              options: hasChoices ? extractedOptions : undefined,
            });
            this.conversation.addToolResult(syntheticId, JSON.stringify({ userResponse: userResponse.value }));
            continue;
          }

          // Plain text → send to user as message
          for (const block of textBlocks) {
            const text = stripAndExtractChips(block.text.trim(), callbacks);
            if (text) callbacks.onMessage(text);
          }
          callbacks.onComplete(fullText);
          break;
        }

        // Send any text blocks that came alongside tool calls
        for (const block of textBlocks) {
          const text = stripAndExtractChips(block.text.trim(), callbacks);
          if (text) callbacks.onMessage(text);
        }

        // Process tool calls — break loop on user-blocking tools so LLM gets the response first
        for (const toolCall of toolUseBlocks) {
          const result = await this.handleToolCall(toolCall, callbacks);
          this.conversation.addToolResult(toolCall.id, JSON.stringify(result));

          if (USER_BLOCKING_TOOLS.has(toolCall.name)) {
            const remaining = toolUseBlocks.slice(toolUseBlocks.indexOf(toolCall) + 1);
            for (const skipped of remaining) {
              this.conversation.addToolResult(
                skipped.id,
                JSON.stringify({ error: 'Not executed — waiting for user response first' })
              );
            }
            break;
          }

          // Loop detection on MCP tool calls
          if (!CLOUD_TOOL_NAMES.has(toolCall.name)) {
            this.toolCallSequence.push(toolCall.name);
            if (this.detectLoop()) {
              callbacks.onError('Detected a repeating loop. Please try a different approach.');
              this.isRunning = false;
              return;
            }
          }
        }
      }

      if (iterations >= this.maxIterations) {
        this.trackEvent({
          event: 'task_max_iterations', category: 'task',
          userId: this.config.userContext.userId, taskId: this.taskId,
          success: false, metadata: { iterations },
        });
        callbacks.onError('Task exceeded maximum number of steps. Please try a simpler request.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Agent execution failed', { error: message });
      this.trackEvent({
        event: 'error', category: 'agent',
        userId: this.config.userContext.userId, taskId: this.taskId,
        success: false,
        metadata: { error: message, stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined },
      });
      callbacks.onError(message);
    } finally {
      this.isRunning = false;
    }
  }

  private detectLoop(): boolean {
    if (this.toolCallSequence.length < this.loopDetectionWindow * this.maxLoopCycles) return false;
    const tail = this.toolCallSequence.slice(-this.loopDetectionWindow * this.maxLoopCycles);
    for (let n = 1; n <= this.loopDetectionWindow; n++) {
      const cycle = tail.slice(0, n).join('|');
      let isLoop = true;
      for (let i = n; i < tail.length; i += n) {
        if (tail.slice(i, i + n).join('|') !== cycle) { isLoop = false; break; }
      }
      if (isLoop) return true;
    }
    return false;
  }

  private async handleToolCall(toolCall: ToolUseBlock, callbacks: AgentCallbacks): Promise<unknown> {
    const { name, input } = toolCall;
    const args = input as Record<string, unknown>;
    const callStart = Date.now();

    // ── ask_user ───────────────────────────────────────────────
    if (name === 'ask_user') {
      this.askUserCount++;
      if (this.askUserCount > this.maxAskUserCalls) {
        this.emitToolCallEvent(name, callStart, true, { reason: 'limit_exceeded' });
        return {
          userResponse: '[SYSTEM: ask_user limit exceeded. Proceed with what you have or call update_order_status with a checkout_failed status.]',
        };
      }
      try {
        const userResponse = await callbacks.onInputRequired({
          taskId: this.taskId || '',
          stepId: toolCall.id,
          question: args.question as string,
          inputType: args.input_type as RichInputType,
          options: args.options as string[] | undefined,
          cards: args.cards as never,
          stores: args.stores as never,
          summary: args.summary as string | undefined,
          show_quantity: args.show_quantity as boolean | undefined,
          multi_select: args.multi_select as boolean | undefined,
          instant_add: args.instant_add as boolean | undefined,
          saved: args.saved as never,
          mode: args.mode as 'single' | 'range' | undefined,
          shortcuts: args.shortcuts as string[] | undefined,
          counters: args.counters as never,
          min: args.min as number | undefined,
          max: args.max as number | undefined,
          step: args.step as number | undefined,
          presets: args.presets as number[] | undefined,
          placeholder: args.placeholder as string | undefined,
          format_hint: args.format_hint as string | undefined,
          sections: args.sections as never,
        });
        // Accumulate for downstream context
        if (userResponse.value && typeof userResponse.value === 'string') {
          this.collectedParams[args.question as string] = userResponse.value;
        }
        this.emitToolCallEvent(name, callStart, true);
        return { userResponse: userResponse.value };
      } catch (err) {
        this.emitToolCallEvent(name, callStart, false, { error: errMsg(err) });
        return { error: errMsg(err, 'ask_user failed') };
      }
    }

    // ── confirm_action ─────────────────────────────────────────
    if (name === 'confirm_action') {
      try {
        const confirmed = await callbacks.onConfirmRequired({
          action: args.action_description as string,
          description: (args.details as string) || '',
        });
        this.emitToolCallEvent(name, callStart, true, { confirmed });
        return { confirmed };
      } catch (err) {
        this.emitToolCallEvent(name, callStart, false, { error: errMsg(err) });
        return { error: errMsg(err, 'confirm_action failed') };
      }
    }

    // ── collect_payment ────────────────────────────────────────
    if (name === 'collect_payment') {
      if (!callbacks.onPaymentRequired) {
        this.emitToolCallEvent(name, callStart, false, { error: 'payment_unavailable' });
        return { error: 'Payment collection not supported in this context' };
      }
      try {
        const paid = await callbacks.onPaymentRequired({
          bookingSummary: args.summary as string,
          amountInr: args.amount_inr as number,
          description: args.description as string,
        });
        this.emitToolCallEvent(name, callStart, true, { paid });
        return { paid };
      } catch (err) {
        this.emitToolCallEvent(name, callStart, false, { error: errMsg(err) });
        return { error: errMsg(err, 'collect_payment failed') };
      }
    }

    // ── save_address ───────────────────────────────────────────
    if (name === 'save_address') {
      if (!this.config.onSaveAddress || !this.config.userContext.userId) {
        this.emitToolCallEvent(name, callStart, false, { error: 'save_address_unavailable' });
        return { error: 'Address save unavailable' };
      }
      try {
        const result = await this.config.onSaveAddress(this.config.userContext.userId, args);
        this.emitToolCallEvent(name, callStart, true);
        return result;
      } catch (err) {
        this.emitToolCallEvent(name, callStart, false, { error: errMsg(err) });
        return { error: errMsg(err, 'save_address failed') };
      }
    }

    // ── report_step / report_cart / update_order_status — pass-through ──
    if (name === 'report_step') {
      callbacks.onStepUpdate({
        action: `${args.step_number}. ${args.step_name}: ${args.outcome}`,
        status: 'running',
      });
      this.emitToolCallEvent(name, callStart, true);
      return { reported: true };
    }
    if (name === 'report_cart') {
      // Frontend listens for tool calls; agent loop just acknowledges.
      this.emitToolCallEvent(name, callStart, true);
      return { reported: true };
    }
    if (name === 'update_order_status') {
      // Same — frontend reads from SSE stream.
      this.emitToolCallEvent(name, callStart, true);
      return { reported: true };
    }
    if (name === 'suggest_replies') {
      // Frontend listens for the tool_use event in SSE — see route.ts onToolStart.
      // Agent loop just acknowledges so the LLM can continue or end the turn.
      const chips = Array.isArray(args.chips) ? (args.chips as string[]).slice(0, 6).map(s => String(s).slice(0, 60)) : [];
      this.emitToolCallEvent(name, callStart, true, { chips });
      if (callbacks.onSuggestions && chips.length > 0) {
        callbacks.onSuggestions(chips);
      }
      return { ok: true };
    }

    // ── MCP tool — delegate to the host (browser ops service) ──
    if (this.mcpHost.isMCPTool(name)) {
      const toolStart = Date.now();
      try {
        const result = await this.mcpHost.callTool(name, args);
        this.trackEvent({
          event: 'mcp_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - toolStart, success: true,
          metadata: { tool: name },
        });
        return result;
      } catch (err) {
        const msg = errMsg(err, 'MCP tool failed');
        this.trackEvent({
          event: 'mcp_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - toolStart, success: false,
          metadata: { tool: name, error: msg },
        });
        return { error: msg };
      }
    }

    // ── Unknown tool — was previously a silent return. Now: emit telemetry,
    // log loudly, and surface the available tool catalogue to the LLM so it
    // can self-correct instead of fabricating a "system glitch" apology.
    const knownMcpTools = this.mcpHost.getTools().map(t => t.name);
    const knownCloudTools = ['ask_user', 'confirm_action', 'collect_payment', 'save_address', 'report_step', 'report_cart', 'update_order_status'];
    const allKnown = [...knownCloudTools, ...knownMcpTools];

    // Suggest closest match if any (case-insensitive substring/normalized)
    const norm = (s: string) => s.toLowerCase().replace(/[._-]/g, '');
    const target = norm(name);
    const suggestion = allKnown.find(t => norm(t) === target)
      || allKnown.find(t => norm(t).includes(target) || target.includes(norm(t)));

    const errorMsg = `Unknown tool: ${name}. ${suggestion ? `Did you mean "${suggestion}"? ` : ''}Available tools: ${allKnown.join(', ')}`;

    this.emitToolCallEvent(name, callStart, false, {
      error: 'unknown_tool',
      requestedName: name,
      suggestion,
      availableCount: allKnown.length,
    });

    // Loud server log so this never disappears silently again.
    console.error(`[agent] UNKNOWN TOOL CALLED: "${name}" — task=${this.taskId} suggestion=${suggestion ?? 'none'}. Available: [${allKnown.join(', ')}]`);

    return { error: errorMsg };
  }

  /**
   * Single chokepoint for emitting tool_call telemetry. Every branch in
   * handleToolCall calls this so we never have a silent dead-end again.
   */
  private emitToolCallEvent(
    toolName: string,
    startMs: number,
    success: boolean,
    metadata?: Record<string, unknown>,
  ): void {
    this.trackEvent({
      event: 'tool_call',
      category: 'tool',
      userId: this.config.userContext.userId,
      taskId: this.taskId,
      durationMs: Date.now() - startMs,
      success,
      metadata: { tool: toolName, ...(metadata ?? {}) },
    });
  }
}

function errMsg(err: unknown, fallback = 'unknown error'): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Defensive: the LLM sometimes inlines the suggest_replies tool's JSON as text
 * instead of issuing a structured tool_use block (especially Claude Sonnet
 * variants when a previous turn went through the same tool). When detected,
 * extract the chips, fire onSuggestions, and strip the JSON from visible text.
 *
 * Pattern matches both:
 *   - Bare JSON object:  {"chips":["a","b"]}
 *   - Code-fenced JSON:  ```json\n{"chips":[...]}\n```
 *   - Tool-call mimic:   suggest_replies({"chips":[...]})
 */
function stripAndExtractChips(text: string, callbacks: AgentCallbacks): string {
  if (!text || !text.includes('chips')) return text;

  // Match a JSON object containing a "chips" array, optionally wrapped in
  // code fences or a fake tool-call invocation.
  const patterns = [
    /```json\s*(\{\s*"chips"\s*:\s*\[[^\]]*\]\s*\})\s*```/g,
    /```\s*(\{\s*"chips"\s*:\s*\[[^\]]*\]\s*\})\s*```/g,
    /suggest_replies\s*\(\s*(\{\s*"chips"\s*:\s*\[[^\]]*\]\s*\})\s*\)/g,
    /(\{\s*"chips"\s*:\s*\[[^\]]*\]\s*\})/g,
  ];

  let cleaned = text;
  const collected: string[] = [];

  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, (_match, json) => {
      if (collected.length === 0) {
        try {
          const parsed = JSON.parse(json) as { chips?: unknown };
          if (Array.isArray(parsed.chips)) {
            for (const c of parsed.chips) {
              if (typeof c === 'string' && collected.length < 6) {
                collected.push(c.slice(0, 60));
              }
            }
          }
        } catch {
          // ignore parse errors
        }
      }
      return ''; // strip from text
    });
  }

  if (collected.length > 0 && callbacks.onSuggestions) {
    callbacks.onSuggestions(collected);
  }

  return cleaned.trim();
}
