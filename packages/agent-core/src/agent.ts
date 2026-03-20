import type { Tool, ContentBlock, ToolUseBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { type LLMClient, createLLMClient } from './llm-client';
import { ConversationManager } from './conversation';
import { buildSystemPrompt } from './prompts/system';
import {
  logger,
  type MCPHostLike,
  type AnthropicTool,
  type CredentialInjectorLike,
  type UserInputRequest,
  type UserInputResponse,
  type FillCredentialRequest,
  shouldSuppressMessage,
} from '@shofferai/shared';
import type { SkillMetadata, LessonStore, LessonEntry } from './skills/types';
import { loadSkills, matchSkill } from './skills/loader';
import { ScriptRecorder } from './scripts/recorder';
import { ScriptPlayer } from './scripts/player';
import { ScriptStore } from './scripts/store';
// BookingMCPExecutor removed — replaced by generic record→replay pipeline
// import { BookingMCPExecutor } from './scripts/mcp-executor';

export interface AgentCallbacks {
  onMessage: (content: string) => void;
  onStepUpdate: (step: { action: string; status: string }) => void;
  onInputRequired: (request: UserInputRequest) => Promise<UserInputResponse>;
  onConfirmRequired: (details: { action: string; description: string }) => Promise<boolean>;
  onPaymentRequired?: (details: { bookingSummary: string; amountInr: number; description: string }) => Promise<boolean>;
  onComplete: (summary: string) => void;
  onError: (error: string) => void;
  /** Called when the chat LLM decides to hand off execution to the browser agent (Copilot CLI on laptop) */
  onTaskHandoff?: (handoff: {
    description: string;
    skill?: { name: string; siteUrl: string; instructions: string; requiresAuth: boolean; params: Array<{ name: string; required: boolean; hint: string }> };
    extractedParams: Record<string, string>;
    conversationContext?: string;
  }) => Promise<void>;
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
  /** Called by ScriptPlayer when a script requests to save an address to the user's profile */
  onSaveAddress?: (userId: string, address: Record<string, unknown>) => Promise<{ saved: boolean; addressCount?: number; error?: string }>;
  maxIterations?: number;
}

// Tools available to the LLM — NO Playwright tools, only high-level actions.
// The LLM describes what to do; the laptop's Playwright MCP executes it.
const AGENT_TOOLS: Tool[] = [
  {
    name: 'browse_website',
    description:
      'Execute a browser action on a website. Describe what you want to do in plain English. The system handles all clicking, typing, and navigation on the operator laptop. Returns a summary of what happened and what the page shows. Always open a new tab first before navigating to a new site.',
    input_schema: {
      type: 'object' as const,
      properties: {
        instruction: {
          type: 'string',
          description: 'What to do on the website in plain English. Be specific. Examples: "Open a new tab and navigate to https://blinkit.com", "Search for milk in the search bar", "Click Add next to Amul Taaza Toned Milk 500ml", "Read the current page and list all products with prices", "Type 8109137158 in the phone number field and click Continue", "Click the cart icon and read the cart summary"',
        },
      },
      required: ['instruction'],
    },
  },
  {
    name: 'ask_user',
    description:
      'Ask the user for input needed to continue the task. Use the richest input_type for the data: card_grid for item selection with quantities, carousel for visual choices (cuisines, destinations), chip_bar for toggleable filters (Veg/Non-veg, sizes), address for delivery/pickup locations, calendar for dates, stepper for counts (guests, passengers), slider for budgets, text for free-form input, layout to combine multiple patterns in one intake.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string',
          description: 'The question or heading to display to the user',
        },
        input_type: {
          type: 'string',
          enum: ['otp', 'confirmation', 'choice', 'freetext', 'card_grid', 'carousel', 'chip_bar', 'address', 'calendar', 'stepper', 'slider', 'text', 'layout'],
          description: 'The interaction pattern to render. Use layout to compose multiple patterns in sections.',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'Options for choice or chip_bar type',
        },
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              emoji: { type: 'string' },
              image: { type: 'string' },
              subtitle: { type: 'string' },
              badge: { type: 'string' },
            },
            required: ['id', 'label'],
          },
          description: 'Visual cards for card_grid or carousel',
        },
        show_quantity: {
          type: 'boolean',
          description: 'Show quantity stepper on each card (card_grid)',
        },
        allow_custom: {
          type: 'boolean',
          description: 'Allow user to add custom items (card_grid, carousel)',
        },
        multi_select: {
          type: 'boolean',
          description: 'Allow multiple selections (card_grid, carousel, chip_bar)',
        },
        saved: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              address: { type: 'string' },
            },
          },
          description: 'Saved addresses to show (address type)',
        },
        mode: {
          type: 'string',
          enum: ['single', 'range'],
          description: 'Calendar mode: single date or date range',
        },
        shortcuts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Quick-pick shortcut labels for calendar (e.g. "Today", "Tomorrow", "This weekend")',
        },
        counters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              min: { type: 'number' },
              max: { type: 'number' },
              default: { type: 'number' },
            },
            required: ['label'],
          },
          description: 'Counter rows for stepper type',
        },
        min: { type: 'number', description: 'Slider minimum value' },
        max: { type: 'number', description: 'Slider maximum value' },
        step: { type: 'number', description: 'Slider step increment' },
        presets: {
          type: 'array',
          items: { type: 'number' },
          description: 'Preset values for slider quick-pick',
        },
        placeholder: { type: 'string', description: 'Placeholder text for text input' },
        format_hint: { type: 'string', description: 'Format hint (e.g. "ABCDE1234F" for PAN)' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Section key in response JSON' },
              label: { type: 'string', description: 'Section heading' },
              type: { type: 'string', description: 'Widget type for this section' },
              required: { type: 'boolean' },
              collapsed: { type: 'boolean', description: 'Start collapsed for optional sections' },
            },
            required: ['name', 'label', 'type'],
          },
          description: 'Sections for layout type — each section inherits its own widget-specific props',
        },
      },
      required: ['question', 'input_type'],
    },
  },
  {
    name: 'confirm_action',
    description:
      'Request user confirmation before performing a sensitive action like placing an order or making a payment. Always use this before irreversible actions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action_description: {
          type: 'string',
          description: 'What action is about to be taken',
        },
        details: {
          type: 'string',
          description: 'Details like total price, item list, dates, etc.',
        },
      },
      required: ['action_description'],
    },
  },
  {
    name: 'collect_payment',
    description:
      'Collect payment from the user before finalizing an order or booking. Opens a payment panel where the user can review the order summary, add a tip, and pay via Razorpay (UPI, cards, net banking). Use this instead of confirm_action when money needs to be collected.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'JSON string with order/booking details (e.g. {"items": [...], "total": "₹145", "delivery": "15 min"})',
        },
        amount_inr: {
          type: 'number',
          description: 'Total amount in INR (e.g. 145 for ₹145)',
        },
        description: {
          type: 'string',
          description: 'Short description of what the payment is for (e.g. "Blinkit grocery order", "Hotel booking: Taj Palace")',
        },
      },
      required: ['summary', 'amount_inr', 'description'],
    },
  },
  {
    name: 'report_step',
    description:
      'Report completion of a workflow step. Call this after finishing each step in the active skill to track progress.',
    input_schema: {
      type: 'object' as const,
      properties: {
        step_number: {
          type: 'number',
          description: 'The step number just completed',
        },
        step_name: {
          type: 'string',
          description: 'Name of the step',
        },
        outcome: {
          type: 'string',
          description: 'Brief description of what happened in this step',
        },
      },
      required: ['step_number', 'step_name', 'outcome'],
    },
  },
  {
    name: 'report_cart',
    description:
      'Report the current shopping cart state to the user. Call this after adding or removing items from a cart on any e-commerce/grocery site. Shows a visual cart summary in the chat.',
    input_schema: {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name' },
              quantity: { type: 'number', description: 'Quantity' },
              price: { type: 'string', description: 'Price with currency symbol (e.g. "₹35")' },
            },
            required: ['name', 'quantity', 'price'],
          },
          description: 'Items currently in the cart',
        },
        total: {
          type: 'string',
          description: 'Cart total with currency symbol (e.g. "₹145")',
        },
        store: {
          type: 'string',
          description: 'Store name (e.g. "Blinkit", "Swiggy Instamart")',
        },
      },
      required: ['items', 'total'],
    },
  },
  {
    name: 'handoff_to_browser_agent',
    description:
      'Hand off a browser task to the autonomous browser agent running on the operator laptop. ' +
      'Use this AFTER you have gathered all necessary information from the user. ' +
      'The browser agent will execute the task autonomously using Playwright MCP and communicate ' +
      'back to the user for choices, confirmations, and payment. ' +
      'You do NOT need to handle browser actions yourself — just describe the complete task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_description: {
          type: 'string',
          description: 'Complete description of what the browser agent should do. Include all details gathered from the user (dates, location, budget, items, preferences, etc.)',
        },
        extracted_params: {
          type: 'object',
          description: 'Key-value pairs of extracted parameters (e.g. {"destination": "Goa", "check_in": "22 March", "budget": "4000"})',
        },
      },
      required: ['task_description'],
    },
  },
];

export class AgentExecutor {
  private claude: LLMClient;
  private conversation: ConversationManager;
  private systemPrompt: string;
  private mcpHost: MCPHostLike;
  private injector: CredentialInjectorLike;
  private maxIterations: number;
  private isRunning = false;
  private recorder: ScriptRecorder | null = null;
  public matchedSkill: SkillMetadata | null = null;
  private allSkills: SkillMetadata[];
  private trackEvent: TelemetryTracker;
  private taskId: string | undefined;
  private consecutiveBrowseFailures = 0;
  private readonly maxConsecutiveBrowseFailures = 3;
  private totalBrowseFailures = 0;
  private readonly maxTotalBrowseFailures = 8;
  private lastBrowseError: string | null = null;
  private browseInstructionHistory: string[] = [];
  private readonly maxSameInstructionAttempts = 2;
  private activeLessons: LessonEntry[] = [];
  // Loop detection: track tool call sequences to detect repeated cycles
  private toolCallSequence: string[] = [];
  private readonly loopDetectionWindow = 6; // check last N calls for repeating pattern
  private readonly maxLoopCycles = 3; // break after this many repeated cycles
  // ask_user tracking: prevent re-asking the same questions
  private askUserCount = 0;
  private readonly maxAskUserCalls = 3; // hard limit on ask_user before forcing handoff
  private collectedParams: Record<string, string> = {}; // accumulated user responses

  constructor(private config: AgentConfig) {
    this.claude = config.llmClient || createLLMClient();
    this.conversation = new ConversationManager();
    this.allSkills = config.skills || loadSkills();
    this.systemPrompt = buildSystemPrompt(config.userContext, this.allSkills);
    this.mcpHost = config.mcpHost;
    this.injector = config.credentialInjector;
    this.maxIterations = config.maxIterations || 25;
    this.trackEvent = config.trackEvent || (() => {});
    this.taskId = config.taskId;
  }

  async execute(userMessage: string, callbacks: AgentCallbacks): Promise<void> {
    if (this.isRunning) {
      throw new Error('Agent is already executing a task');
    }

    this.isRunning = true;

    // Skill detection: match user message to a loaded skill
    if (this.allSkills.length > 0) {
      this.matchedSkill = matchSkill(this.allSkills, userMessage);
      if (this.matchedSkill) {
        // Load lessons learned from past executions for this skill
        if (this.config.lessonStore) {
          try {
            this.activeLessons = await this.config.lessonStore.loadForSkill(this.matchedSkill.name, 10);
            if (this.activeLessons.length > 0) {
              logger.info('Loaded lessons for skill', { skillName: this.matchedSkill.name, count: this.activeLessons.length });
            }
          } catch (err) {
            logger.warn('Failed to load lessons', { error: err });
          }
        }
        this.systemPrompt = buildSystemPrompt(this.config.userContext, this.allSkills, this.matchedSkill, this.activeLessons);
        logger.info('Skill matched', { skillName: this.matchedSkill.name });
        callbacks.onStepUpdate({
          action: `Using skill: ${this.matchedSkill.name}`,
          status: 'running',
        });

        // Execution strategy for ALL skills:
        // 1. Try compiled Playwright script (instant replay, no LLM) — laptop only
        // 2. Fall back to LLM + MCP with recording (captures for next time)
        // Skip instant mode on Cloud Run — no playwright/chrome available there.
        // Scripts require a local browser; they'll work when sent to laptop via relay (future).
        const isCloudEnvironment = !!(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
        if (!isCloudEnvironment && ScriptPlayer.hasScript(this.matchedSkill.name)) {
          try {
            logger.info('Compiled script found, running instant replay', { skill: this.matchedSkill.name });
            callbacks.onStepUpdate({
              action: `Running ${this.matchedSkill.name} (instant mode)`,
              status: 'running',
            });

            const player = new ScriptPlayer(
              this.matchedSkill.name,
              {},
              callbacks,
              this.config.userContext as Record<string, unknown>,
              this.config.vault,
              this.config.userContext.userId
            );
            if (this.config.onSaveAddress) {
              player.onSaveAddress = this.config.onSaveAddress;
            }
            const result = await player.play();

            if (result.completed) {
              this.isRunning = false;
              return;
            }

            logger.warn('Compiled script failed, falling back to LLM + recording', { error: result.error });
            callbacks.onStepUpdate({
              action: 'Script had an issue, switching to AI mode (recording)',
              status: 'running',
            });
          } catch (error) {
            logger.warn('Script execution error, falling back to LLM + recording', { error });
            callbacks.onStepUpdate({
              action: 'Switching to AI mode (recording)',
              status: 'running',
            });
          }
        }

        // No compiled script OR script failed — enable recording for LLM execution
        if (!this.recorder) {
          this.recorder = new ScriptRecorder(
            this.matchedSkill.name,
            {},
            this.matchedSkill.instructions
          );
          this.recorder.start();
          logger.info('Recording mode enabled', { skill: this.matchedSkill.name });
        }
      }
    }

    this.conversation.addUserMessage(userMessage);

    // LLM only gets high-level tools — no Playwright tools in its context
    const allTools: Tool[] = [...AGENT_TOOLS];

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
          event: 'llm_call',
          category: 'llm',
          userId: this.config.userContext.userId,
          taskId: this.taskId,
          durationMs: llmDuration,
          success: true,
          metadata: {
            iteration: iterations,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            stopReason: response.stopReason,
            skillName: this.matchedSkill?.name,
          },
        });

        // Process response content blocks
        const toolUseBlocks: ToolUseBlock[] = [];
        const textBlocks: TextBlock[] = [];

        for (const block of response.content) {
          if (block.type === 'text') {
            textBlocks.push(block);
          } else if (block.type === 'tool_use') {
            toolUseBlocks.push(block);
          }
        }

        // Add full assistant response to conversation
        this.conversation.addAssistantMessage(response.content);

        // If no tool calls, check if the LLM asked a question as plain text
        // (common with LLMs that don't reliably call tools)
        // IMPORTANT: We check BEFORE sending text to frontend so InputPrompt
        // can appear instead of the user seeing a plain text question.
        if (response.stopReason === 'end_turn' && toolUseBlocks.length === 0) {
          const fullText = textBlocks.map((b) => b.text).join('\n').trim();

          // Detect if the LLM asked a question instead of calling ask_user.
          // Exclude error/failure messages to avoid converting "Should I retry?" into
          // a loop-perpetuating input prompt.
          const lowerText = fullText.toLowerCase();
          const looksLikeError = lowerText.includes('timeout') ||
            lowerText.includes('timed out') ||
            lowerText.includes('failed to') ||
            lowerText.includes('not loading') ||
            lowerText.includes('unable to') ||
            lowerText.includes('error') ||
            lowerText.includes('retry') ||
            lowerText.includes('try again') ||
            lowerText.includes('not responding') ||
            lowerText.includes('stuck') ||
            lowerText.includes('not rendering') ||
            (lowerText.includes('browser') && lowerText.includes('fail'));
          // Detect if the LLM described a handoff instead of calling the tool
          const looksLikeHandoff = !looksLikeError &&
            (lowerText.includes('hand off') || lowerText.includes('handoff') ||
             lowerText.includes('handing off') || lowerText.includes('start the booking') ||
             lowerText.includes('start the search') || lowerText.includes('start searching') ||
             lowerText.includes('i will now search') || lowerText.includes('i\'ll now search') ||
             lowerText.includes('will now search') || lowerText.includes('proceeding to book') ||
             lowerText.includes('booking process') || lowerText.includes('i have everything'));

          if (looksLikeHandoff && this.matchedSkill && callbacks.onTaskHandoff) {
            logger.warn('LLM described handoff as text instead of calling tool — auto-triggering handoff');
            // Replace the last assistant message with one containing the handoff tool call
            const syntheticId = `auto_handoff_${Date.now()}`;
            this.conversation.replaceLastMessage([
              { type: 'text', text: fullText } as ContentBlock,
              {
                type: 'tool_use', id: syntheticId, name: 'handoff_to_browser_agent',
                input: {
                  task_description: fullText,
                  extracted_params: this.collectedParams,
                },
              } as ContentBlock,
            ]);

            const result = await this.handleToolCall(
              { type: 'tool_use', id: syntheticId, name: 'handoff_to_browser_agent', input: { task_description: fullText, extracted_params: this.collectedParams } },
              callbacks,
            );
            this.conversation.addToolResult(syntheticId, JSON.stringify(result));
            continue;
          }

          const looksLikeQuestion = !looksLikeError && fullText.includes('?') &&
            (lowerText.includes('address') ||
             lowerText.includes('phone') ||
             lowerText.includes('which') ||
             lowerText.includes('what') ||
             lowerText.includes('please') ||
             lowerText.includes('enter') ||
             lowerText.includes('choose') ||
             lowerText.includes('select') ||
             lowerText.includes('deliver') ||
             lowerText.includes('location') ||
             lowerText.includes('pincode') ||
             lowerText.includes('would you like') ||
             lowerText.includes('prefer'));

          if (looksLikeQuestion) {
            // Don't send question text as a chat message — the InputPrompt shows it.
            // Sending it as onMessage would cause the user to see the question twice.
            logger.info('Auto-converting text question to ask_user tool call', { text: fullText.slice(0, 100) });
            const syntheticId = `auto_ask_${Date.now()}`;

            // Detect if the text contains a list of options (bullet points, numbered lists)
            const extractedOptions = fullText
              .split(/\n/)
              .filter((l: string) => /^\s*(?:•|[-*]|\d+[.)]\s)/.test(l))
              .map((l: string) => l.replace(/^\s*(?:•|[-*]|\d+[.)]\s)\s*/, '').trim())
              .filter(Boolean);

            const hasChoices = extractedOptions.length >= 2;
            // Use card_grid for product-like lists (3+ items with prices/weights)
            const isProductList = hasChoices && extractedOptions.length >= 3 &&
              extractedOptions.some((o: string) => /₹|rs\.?|price|ml|kg|ltr|litre|gram/i.test(o));
            const inputType = isProductList ? 'card_grid' : (hasChoices ? 'choice' : 'freetext');
            const options = hasChoices ? extractedOptions : undefined;

            // Replace the last assistant message (already added above) with one
            // that includes a tool_use block, so the conversation stays valid
            this.conversation.replaceLastMessage([
              { type: 'text', text: fullText } as ContentBlock,
              { type: 'tool_use', id: syntheticId, name: 'ask_user', input: { question: fullText, input_type: inputType, options } } as ContentBlock,
            ]);

            // No onStepUpdate — InputPrompt handles the UI for ask_user
            const userResponse = await callbacks.onInputRequired({
              taskId: '',
              stepId: syntheticId,
              question: fullText,
              inputType,
              options,
              multi_select: isProductList || undefined,
              show_quantity: isProductList || undefined,
            });

            this.conversation.addToolResult(syntheticId, JSON.stringify({ userResponse: userResponse.value }));
            continue; // Loop back to LLM with the user's answer
          }

          // Not a question — send text to frontend as normal message
          for (const block of textBlocks) {
            callbacks.onMessage(block.text);
          }

          const summary = fullText;

          // Save recording if active
          if (this.recorder && this.recorder.getActionCount() > 0) {
            try {
              this.recorder.stop();
              const compiled = this.recorder.compile();
              await ScriptStore.save(compiled);
              logger.info('Script compiled and saved (self-healing: replaces any failed version)', {
                skillId: compiled.skillId,
                version: compiled.version,
                actions: compiled.actions?.length ?? 0,
              });
            } catch (error) {
              logger.warn('Failed to save compiled script', { error });
            }
          }

          callbacks.onComplete(summary);
          break;
        }

        // Send text blocks to frontend ONLY if they contain meaningful content,
        // not just narration of browser actions ("Let me navigate to...", "I'll click on...")
        for (const block of textBlocks) {
          const text = block.text.trim();
          if (text && !shouldSuppressMessage(text)) {
            callbacks.onMessage(text);
          }
        }

        // Process tool calls
        for (const toolCall of toolUseBlocks) {
          const result = await this.handleToolCall(toolCall, callbacks);

          // Record tool call with result for richer selector extraction
          if (this.recorder) {
            this.recorder.record(
              toolCall.name,
              toolCall.input as Record<string, unknown>,
              result
            );
          }

          this.conversation.addToolResult(toolCall.id, JSON.stringify(result));
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

  private async handleToolCall(
    toolCall: ToolUseBlock,
    callbacks: AgentCallbacks
  ): Promise<unknown> {
    const { name, input } = toolCall;
    const args = input as Record<string, unknown>;

    // browse_website: LLM describes what to do, we execute it via Playwright MCP
    if (name === 'browse_website') {
      const instruction = args.instruction as string;

      // Circuit breaker: stop after repeated browser connection failures
      if (this.consecutiveBrowseFailures >= this.maxConsecutiveBrowseFailures) {
        const failMsg = `Browser unavailable after ${this.consecutiveBrowseFailures} consecutive failures. The browser relay may be offline — please try again later.`;
        callbacks.onError(failMsg);
        throw new Error(failMsg);
      }

      // Total failure cap: stop if too many browse actions have failed overall
      if (this.totalBrowseFailures >= this.maxTotalBrowseFailures) {
        const failMsg = `Too many browser failures (${this.totalBrowseFailures} total). The website may be down or the connection is unstable. Please try again later.`;
        callbacks.onError(failMsg);
        throw new Error(failMsg);
      }

      // Loop detection: block the same instruction from being retried too many times
      const normalizedInstruction = instruction.toLowerCase().replace(/\s+/g, ' ').trim();
      const sameInstructionCount = this.browseInstructionHistory
        .filter(h => h === normalizedInstruction).length;
      if (sameInstructionCount >= this.maxSameInstructionAttempts) {
        logger.warn('Loop detected: same browse instruction repeated', {
          instruction: instruction.slice(0, 100),
          attempts: sameInstructionCount,
        });
        return { error: `This action has already been attempted ${sameInstructionCount} times and failed. Try a completely different approach or give up on this specific action.` };
      }
      this.browseInstructionHistory.push(normalizedInstruction);

      // Suppress ALL browse_website step_updates — these are low-level actions.
      // Only report_step milestones and ask_user/confirm_action pauses are shown to user.
      const toolStart = Date.now();
      try {
        const result = await this.executeBrowserInstruction(instruction);

        // Auto-save lesson: if this succeeded after a previous failure, record the recovery
        if (this.lastBrowseError && this.matchedSkill && this.config.lessonStore) {
          const errorPattern = this.lastBrowseError.slice(0, 200);
          const resolution = `Succeeded with: ${instruction.slice(0, 200)}`;
          this.config.lessonStore.save({
            skillId: this.matchedSkill.name,
            errorPattern,
            resolution,
            source: 'auto',
            confidence: 0.5,
            successCount: 1,
            failureCount: 0,
            lastUsedAt: new Date(),
            createdAt: new Date(),
            expiresAt: null,
          }).catch((err) => logger.warn('Failed to save lesson', { error: err }));
          logger.info('Auto-saved lesson from error recovery', { skillId: this.matchedSkill.name, errorPattern: errorPattern.slice(0, 80) });
        }

        this.consecutiveBrowseFailures = 0;
        this.lastBrowseError = null;
        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - toolStart, success: true,
          metadata: { tool: 'browse_website', instruction: instruction.slice(0, 200) },
        });
        return result;
      } catch (error) {
        this.consecutiveBrowseFailures++;
        this.totalBrowseFailures++;
        const msg = error instanceof Error ? error.message : 'Browser action failed';
        this.lastBrowseError = msg;
        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - toolStart, success: false,
          metadata: { tool: 'browse_website', error: msg, consecutiveFailures: this.consecutiveBrowseFailures },
        });
        if (this.consecutiveBrowseFailures >= this.maxConsecutiveBrowseFailures) {
          const failMsg = `Browser unavailable after ${this.consecutiveBrowseFailures} consecutive failures: ${msg}`;
          callbacks.onError(failMsg);
          throw new Error(failMsg);
        }
        return { error: msg };
      }
    }

    if (name === 'ask_user') {
      this.askUserCount++;
      logger.info('ask_user call', { count: this.askUserCount, max: this.maxAskUserCalls });

      // Enforce ask_user limit — force handoff if exceeded
      if (this.askUserCount > this.maxAskUserCalls) {
        logger.warn('ask_user limit exceeded, forcing handoff', { count: this.askUserCount });
        return {
          userResponse: '[SYSTEM: You have asked too many questions. Call handoff_to_browser_agent NOW with whatever info you have. Use defaults for missing fields. Collected so far: ' +
            JSON.stringify(this.collectedParams) + ']',
        };
      }

      // Do NOT send onStepUpdate here — it renders a TaskProgress card that
      // hides the interactive InputPrompt. Only onInputRequired is needed.
      const inputStart = Date.now();
      const response = await callbacks.onInputRequired({
        taskId: '',
        stepId: toolCall.id,
        question: args.question as string,
        inputType: args.input_type as UserInputRequest['inputType'],
        options: args.options as string[] | undefined,
        // Rich input props
        cards: args.cards as UserInputRequest['cards'],
        show_quantity: args.show_quantity as boolean | undefined,
        allow_custom: args.allow_custom as boolean | undefined,
        multi_select: args.multi_select as boolean | undefined,
        saved: args.saved as UserInputRequest['saved'],
        mode: args.mode as UserInputRequest['mode'],
        shortcuts: args.shortcuts as string[] | undefined,
        counters: args.counters as UserInputRequest['counters'],
        min: args.min as number | undefined,
        max: args.max as number | undefined,
        step: args.step as number | undefined,
        presets: args.presets as number[] | undefined,
        placeholder: args.placeholder as string | undefined,
        format_hint: args.format_hint as string | undefined,
        sections: args.sections as UserInputRequest['sections'],
      });

      // Track the collected response so we can pass it to forced handoff
      const question = (args.question as string) || 'unknown';
      this.collectedParams[question.slice(0, 50)] = response.value;

      this.trackEvent({
        event: 'tool_call', category: 'tool',
        userId: this.config.userContext.userId, taskId: this.taskId,
        durationMs: Date.now() - inputStart, success: true,
        metadata: { tool: 'ask_user', inputType: args.input_type, askCount: this.askUserCount },
      });
      return { userResponse: response.value };
    }

    if (name === 'report_step') {
      const stepNum = args.step_number as number;
      const stepName = args.step_name as string;
      const outcome = args.outcome as string;
      callbacks.onStepUpdate({
        action: `Step ${stepNum}: ${stepName} — ${outcome}`,
        status: 'completed',
      });
      return { acknowledged: true, step: stepNum, name: stepName };
    }

    if (name === 'report_cart') {
      const items = args.items as Array<{ name: string; quantity: number; price: string }>;
      const total = args.total as string;
      const store = args.store as string | undefined;
      callbacks.onStepUpdate({
        action: JSON.stringify({ _type: 'cart_update', items, total, store }),
        status: 'cart_update',
      });
      return { acknowledged: true, itemCount: items.length };
    }

    if (name === 'confirm_action') {
      callbacks.onStepUpdate({
        action: `Confirming: ${args.action_description}`,
        status: 'paused_for_input',
      });
      const confirmed = await callbacks.onConfirmRequired({
        action: args.action_description as string,
        description: (args.details as string) || '',
      });
      return { confirmed };
    }

    if (name === 'handoff_to_browser_agent') {
      const taskDescription = args.task_description as string;
      const extractedParams = (args.extracted_params as Record<string, string>) || {};

      callbacks.onStepUpdate({
        action: 'Starting task...',
        status: 'running',
      });

      if (callbacks.onTaskHandoff) {
        try {
          await callbacks.onTaskHandoff({
            description: taskDescription,
            skill: this.matchedSkill ? {
              name: this.matchedSkill.name,
              siteUrl: this.matchedSkill.siteUrl,
              instructions: this.matchedSkill.instructions,
              requiresAuth: this.matchedSkill.requiresAuth,
              params: this.matchedSkill.params,
            } : undefined,
            extractedParams,
            conversationContext: this.conversation.getMessages()
              .filter((m: { role: string; content: unknown }) => m.role !== 'system')
              .map((m: { role: string; content: unknown }) => `${m.role}: ${typeof m.content === 'string' ? m.content.slice(0, 200) : '[tool use]'}`)
              .join('\n'),
          });
        } catch (handoffErr) {
          const errMsg = handoffErr instanceof Error ? handoffErr.message : 'Handoff failed';
          this.trackEvent({
            event: 'tool_call', category: 'tool',
            userId: this.config.userContext.userId, taskId: this.taskId,
            success: false,
            metadata: { tool: 'handoff_to_browser_agent', error: errMsg },
          });
          return { error: `Failed to start task: ${errMsg}` };
        }

        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          success: true,
          metadata: { tool: 'handoff_to_browser_agent', skill: this.matchedSkill?.name },
        });

        return { handoff: 'sent', message: 'Task started. Respond with ONE short, friendly sentence (no bullet lists, no step explanations). Example: "On it! Searching now ✨"' };
      }

      // Fallback: if no handoff callback, report error
      return { error: 'Could not start task — no connection available' };
    }

    if (name === 'collect_payment') {
      const payStart = Date.now();
      if (!callbacks.onPaymentRequired) {
        callbacks.onStepUpdate({
          action: `Confirming payment: ${args.description}`,
          status: 'paused_for_input',
        });
        const confirmed = await callbacks.onConfirmRequired({
          action: `Pay ${args.amount_inr ? `₹${args.amount_inr}` : ''} for ${args.description}`,
          description: (args.summary as string) || '',
        });
        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - payStart, success: confirmed,
          metadata: { tool: 'collect_payment', method: 'fallback', amountInr: args.amount_inr },
        });
        return { paid: confirmed, method: 'fallback_confirmation' };
      }

      callbacks.onStepUpdate({
        action: `Collecting payment: ${args.description}`,
        status: 'paused_for_payment',
      });
      const paid = await callbacks.onPaymentRequired({
        bookingSummary: args.summary as string,
        amountInr: args.amount_inr as number,
        description: args.description as string,
      });
      this.trackEvent({
        event: 'tool_call', category: 'tool',
        userId: this.config.userContext.userId, taskId: this.taskId,
        durationMs: Date.now() - payStart, success: paid,
        metadata: { tool: 'collect_payment', method: 'razorpay', amountInr: args.amount_inr },
      });
      return { paid, method: 'razorpay' };
    }

    // Handle MCP tools (Playwright browser actions)
    if (this.mcpHost.isMCPTool(name)) {
      // Only show user-meaningful actions, not internal reads/waits
      if (!this.isInternalBrowserAction(name)) {
        const friendlyAction = this.getFriendlyActionName(name, args);
        callbacks.onStepUpdate({ action: friendlyAction, status: 'running' });
      }
      const mcpStart = Date.now();
      try {
        const result = await this.mcpHost.callTool(name, args);
        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - mcpStart, success: true,
          metadata: { tool: name, mcp: true },
        });
        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'MCP tool failed';
        this.trackEvent({
          event: 'tool_call', category: 'tool',
          userId: this.config.userContext.userId, taskId: this.taskId,
          durationMs: Date.now() - mcpStart, success: false,
          metadata: { tool: name, mcp: true, error: msg },
        });
        throw error;
      }
    }

    return { error: `Unknown tool: ${name}` };
  }

  /**
   * Execute a plain English browser instruction via Playwright MCP.
   * Parses the instruction and maps it to specific MCP tool calls.
   * Returns a text summary of what happened.
   */
  private async executeBrowserInstruction(instruction: string): Promise<{ summary: string }> {
    const lower = instruction.toLowerCase();

    // Switch to a specific tab
    const switchTabMatch = lower.match(/switch\s+to\s+tab\s+(\d+)/);
    if (switchTabMatch) {
      const tabIndex = parseInt(switchTabMatch[1], 10);
      await this.mcpHost.callTool('browser_tabs', { action: 'select', index: tabIndex });
      const snapshot = await this.mcpHost.callTool('browser_snapshot', {});
      return { summary: `Switched to tab ${tabIndex}. ${this.summarizeSnapshot(snapshot)}` };
    }

    // Open new tab — create new tab, explicitly select it, then navigate
    if (lower.includes('open a new tab') || lower.includes('new tab')) {
      const newTabResult = await this.mcpHost.callTool('browser_tabs', { action: 'new' });

      // Explicitly select the new tab to update Playwright's page context.
      // browser_tabs 'new' creates the tab but the internal page reference may
      // still point to the old tab. Selecting the last tab fixes this.
      try {
        const tabText = String(newTabResult);
        const tabLines = tabText.match(/^- \d+:/gm) || [];
        if (tabLines.length > 0) {
          await this.mcpHost.callTool('browser_tabs', { action: 'select', index: tabLines.length - 1 });
        }
      } catch {
        // Non-critical — the new tab might already be selected
      }

      // If instruction also has a URL, navigate to it
      const urlMatch = instruction.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        await this.mcpHost.callTool('browser_navigate', { url: urlMatch[0] });
        const snapshot = await this.mcpHost.callTool('browser_snapshot', {});
        return { summary: `Opened new tab and navigated to ${urlMatch[0]}. ${this.summarizeSnapshot(snapshot)}` };
      }
      return { summary: 'Opened a new browser tab.' };
    }

    // Close tabs
    if (lower.includes('close') && (lower.includes('tab') || lower.includes('other'))) {
      try {
        if (lower.includes('all other') || lower.includes('stale')) {
          // List tabs and close all except the current one
          const tabsResult = await this.mcpHost.callTool('browser_tabs', { action: 'list' });
          const tabLines = String(tabsResult).match(/^- \d+:/gm) || [];
          const tabCount = tabLines.length;
          // Close from highest index down to 0, skipping the current tab
          for (let i = tabCount - 1; i >= 0; i--) {
            const isCurrent = String(tabsResult).includes(`- ${i}: (current)`);
            if (!isCurrent) {
              await this.mcpHost.callTool('browser_tabs', { action: 'close', index: i });
            }
          }
          return { summary: `Closed ${Math.max(0, tabCount - 1)} other tab(s).` };
        }

        // Close current tab
        await this.mcpHost.callTool('browser_tabs', { action: 'close' });
        return { summary: 'Closed the current tab.' };
      } catch {
        return { summary: 'Could not close tab(s).' };
      }
    }

    // Navigate to URL (matches "navigate to URL", "go to URL", or just a bare URL instruction)
    const navUrlMatch = instruction.match(/(?:navigate|go)\s+to\s+(https?:\/\/[^\s"']+)/i)
      || instruction.match(/^(https?:\/\/[^\s"']+)\s*$/i);
    if (navUrlMatch) {
      await this.mcpHost.callTool('browser_navigate', { url: navUrlMatch[1] });
      const snapshot = await this.mcpHost.callTool('browser_snapshot', {});
      return { summary: `Navigated to ${navUrlMatch[1]}. ${this.summarizeSnapshot(snapshot)}` };
    }

    // Read/snapshot the page
    if (lower.includes('read') || lower.includes('snapshot') || lower.includes('what') && lower.includes('page') || lower.includes('list all') || lower.includes('describe')) {
      const snapshot = await this.mcpHost.callTool('browser_snapshot', {});
      return { summary: this.summarizeSnapshot(snapshot) };
    }

    // Search — use URL-based search for known sites, fallback to UI search
    const searchMatch = instruction.match(/search\s+(?:for\s+)?["']?(.+?)["']?\s*(?:in|on|using|$)/i);
    if (searchMatch || lower.includes('search')) {
      const searchTerm = searchMatch ? searchMatch[1].trim() : instruction.replace(/search\s+(?:for\s+)?/i, '').replace(/\s+(?:in|on)\s+.*$/i, '').trim();

      // Take snapshot to determine current page and find search input
      const snap = await this.mcpHost.callTool('browser_snapshot', {});
      const snapText = JSON.stringify(snap);

      // Extract current page URL from the (current) tab in the tab list,
      // NOT from "Page URL:" metadata which is unreliable in CDP mode.
      const currentTabUrlMatch = snapText.match(/\(current\)\s*\[[^\]]*\]\((https?:\/\/[^)]+)\)/);
      const currentUrl = currentTabUrlMatch ? currentTabUrlMatch[1] : '';

      // Blinkit: use direct URL search (their search bar is a link, not a textbox)
      if (currentUrl.includes('blinkit.com')) {
        await this.mcpHost.callTool('browser_navigate', { url: `https://blinkit.com/s/?q=${encodeURIComponent(searchTerm)}` });
        await this.mcpHost.callTool('browser_wait_for', { time: 2 });
        const results = await this.mcpHost.callTool('browser_snapshot', {});
        return { summary: `Searched for "${searchTerm}" on Blinkit. ${this.summarizeSnapshot(results)}` };
      }

      // Generic: find search input (textbox, input, or searchbox)
      const searchRef = this.findRefByHint(snapText, ['textbox', 'searchbox', 'search', 'Search']);
      if (searchRef) {
        await this.mcpHost.callTool('browser_click', { ref: searchRef, element: 'search input' });
        await this.mcpHost.callTool('browser_type', { ref: searchRef, text: searchTerm, submit: true });
        await this.mcpHost.callTool('browser_wait_for', { time: 2 });
        const results = await this.mcpHost.callTool('browser_snapshot', {});
        return { summary: `Searched for "${searchTerm}". ${this.summarizeSnapshot(results)}` };
      }
      return { summary: 'Could not find search input on the page.' };
    }

    // Click something
    if (lower.includes('click')) {
      const snap = await this.mcpHost.callTool('browser_snapshot', {});
      const snapText = JSON.stringify(snap);

      // Extract what to click from the instruction
      const clickTarget = instruction.replace(/click\s+(?:on\s+)?(?:the\s+)?/i, '').trim();
      const ref = this.findRefByHint(snapText, clickTarget.split(/\s+/).slice(0, 5));
      if (ref) {
        await this.mcpHost.callTool('browser_click', { ref, element: clickTarget });
        await this.mcpHost.callTool('browser_wait_for', { time: 2 });
        const after = await this.mcpHost.callTool('browser_snapshot', {});
        return { summary: `Clicked "${clickTarget}". ${this.summarizeSnapshot(after)}` };
      }
      return { summary: `Could not find "${clickTarget}" on the page.` };
    }

    // Type something
    if (lower.includes('type') || lower.includes('enter') || lower.includes('fill')) {
      const snap = await this.mcpHost.callTool('browser_snapshot', {});
      const snapText = JSON.stringify(snap);

      // Extract text and target
      const typeMatch = instruction.match(/(?:type|enter|fill)\s+["']?(.+?)["']?\s+(?:in|into)\s+(?:the\s+)?(.+)/i);
      if (typeMatch) {
        const text = typeMatch[1];
        const target = typeMatch[2];
        const ref = this.findRefByHint(snapText, target.split(/\s+/).slice(0, 4));
        if (ref) {
          await this.mcpHost.callTool('browser_type', { ref, text, submit: lower.includes('continue') || lower.includes('submit') || lower.includes('enter') });
          await this.mcpHost.callTool('browser_wait_for', { time: 2 });
          const after = await this.mcpHost.callTool('browser_snapshot', {});
          return { summary: `Typed "${text}". ${this.summarizeSnapshot(after)}` };
        }
      }

      // Fallback: find any text input and type
      const inputRef = this.findRefByHint(snapText, ['textbox', 'input']);
      if (inputRef) {
        const textToType = instruction.replace(/(?:type|enter|fill)\s+/i, '').replace(/\s+(?:in|into)\s+.*/i, '').trim();
        await this.mcpHost.callTool('browser_type', { ref: inputRef, text: textToType, submit: true });
        await this.mcpHost.callTool('browser_wait_for', { time: 2 });
        const after = await this.mcpHost.callTool('browser_snapshot', {});
        return { summary: `Typed "${textToType}". ${this.summarizeSnapshot(after)}` };
      }
      return { summary: 'Could not find an input field on the page.' };
    }

    // Fallback: take a snapshot and return page state
    const snapshot = await this.mcpHost.callTool('browser_snapshot', {});
    return { summary: `Page state: ${this.summarizeSnapshot(snapshot)}` };
  }

  /** Extract a short text summary from a Playwright snapshot result */
  private summarizeSnapshot(snapshot: unknown): string {
    const text = JSON.stringify(snapshot);

    // NOTE: In CDP mode, Page URL and Page Title in snapshot metadata are
    // unreliable (they may show the first tab's info). We extract the actual
    // site name from snapshot content instead.

    // Extract readable content from the snapshot, limit to 30 items
    const lines: string[] = [];
    const matches = text.matchAll(/(?:text|heading|paragraph|button|link|generic).*?:\s*["']([^"']{2,100})["']/g);
    for (const match of matches) {
      if (lines.length < 30) lines.push(match[1]);
    }
    if (lines.length === 0) {
      return text.slice(0, 1500);
    }

    // Detect actual site from tab list: find the "(current)" tab's title
    const currentTabMatch = text.match(/\(current\)\s*\[([^\]]+)\]/);
    const tabTitle = currentTabMatch ? currentTabMatch[1] : '';
    const prefix = tabTitle ? `Current tab: "${tabTitle}". ` : '';
    return `${prefix}Page shows: ${lines.join(', ')}`;
  }

  /** Find an element ref in a snapshot by matching hint keywords */
  private findRefByHint(snapshotText: string, hints: string[]): string | null {
    for (const hint of hints) {
      const escaped = hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Try multiple patterns: ref near hint, hint near ref, within same line
      const patterns = [
        new RegExp(`ref=(e\\d+)[^\\n]{0,200}${escaped}`, 'i'),
        new RegExp(`${escaped}[^\\n]{0,200}ref=(e\\d+)`, 'i'),
        new RegExp(`\\[ref=(e\\d+)\\][^\\n]*${escaped}`, 'i'),
        new RegExp(`${escaped}[^\\n]*\\[ref=(e\\d+)\\]`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = snapshotText.match(pattern);
        if (match) return match[1];
      }
    }
    return null;
  }

  /** Returns true for low-level browser actions that shouldn't clutter user progress.
   *  ALL MCP browser actions are internal — only report_step milestones are shown. */
  private isInternalBrowserAction(_toolName: string): boolean {
    return true;
  }


  private getFriendlyActionName(toolName: string, args: Record<string, unknown>): string {
    switch (toolName) {
      case 'browser_navigate':
        return `Navigating to ${args.url}`;
      case 'browser_snapshot':
        return 'Reading page content';
      case 'browser_click':
        return `Clicking ${args.element || 'element'}`;
      case 'browser_type':
        return 'Typing text';
      case 'browser_select_option':
        return 'Selecting option';
      case 'browser_wait_for_element':
        return 'Waiting for page to load';
      case 'browser_go_back':
        return 'Going back';
      case 'browser_handle_dialog':
        return 'Handling popup';
      default:
        return `Browser action: ${toolName}`;
    }
  }

  stop(): void {
    this.isRunning = false;
  }
}
