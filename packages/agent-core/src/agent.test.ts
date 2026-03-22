import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentExecutor, type AgentCallbacks, type AgentConfig } from './agent';

// Mock all external deps
vi.mock('./llm-client', () => ({
  createLLMClient: vi.fn(() => ({ chat: vi.fn() })),
}));

vi.mock('./prompts/system', () => ({
  buildSystemPrompt: vi.fn(() => 'system prompt'),
}));

vi.mock('./scripts/recorder', () => {
  const MockRecorder = vi.fn().mockImplementation(function(this: any) {
    this.start = vi.fn();
    this.record = vi.fn();
    this.stop = vi.fn();
    this.compile = vi.fn(() => ({ skillId: 'test', actions: [] }));
    this.getActionCount = vi.fn(() => 0);
  });
  return { ScriptRecorder: MockRecorder };
});

vi.mock('./scripts/player', () => ({
  ScriptPlayer: vi.fn().mockImplementation(() => ({
    play: vi.fn(async () => ({ completed: false })),
  })),
}));

// Make hasScript a static mock
(await import('./scripts/player')).ScriptPlayer.hasScript = vi.fn(() => false);

vi.mock('./scripts/store', () => ({
  ScriptStore: { save: vi.fn(), load: vi.fn() },
}));

vi.mock('./scripts/mcp-executor', () => ({
  BookingMCPExecutor: vi.fn(),
}));

vi.mock('./skills/param-extractor', () => ({
  extractSkillParams: vi.fn(() => ({})),
}));

vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

function createMockCallbacks(): AgentCallbacks {
  return {
    onMessage: vi.fn(),
    onStepUpdate: vi.fn(),
    onInputRequired: vi.fn(async () => ({ taskId: '', stepId: '', value: 'test' })),
    onConfirmRequired: vi.fn(async () => true),
    onPaymentRequired: vi.fn(async () => true),
    onComplete: vi.fn(),
    onError: vi.fn(),
  };
}

function createMockMcpHost() {
  return {
    getTools: vi.fn(() => []),
    getToolsAsAnthropicFormat: vi.fn(() => []),
    isMCPTool: vi.fn(() => false),
    callTool: vi.fn(async () => ({ success: true })),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createMockInjector() {
  return {
    fill: vi.fn(async () => ({ success: true })),
  };
}

function createAgent(overrides: Partial<AgentConfig> = {}) {
  const mockLlm = { chat: vi.fn() };
  const config: AgentConfig = {
    mcpHost: createMockMcpHost(),
    credentialInjector: createMockInjector() as any,
    llmClient: mockLlm,
    userContext: { name: 'Test User', email: 'test@test.com' },
    maxIterations: 3,
    ...overrides,
  };
  return { agent: new AgentExecutor(config), llm: mockLlm, config };
}

describe('AgentExecutor', () => {
  let callbacks: AgentCallbacks;

  beforeEach(() => {
    vi.clearAllMocks();
    callbacks = createMockCallbacks();
  });

  it('throws when already running', async () => {
    const { agent, llm } = createAgent();
    // Make first LLM call resolve after a delay controlled by us
    let resolveFirst: Function;
    llm.chat.mockReturnValueOnce(new Promise((r) => { resolveFirst = r; }));

    const p = agent.execute('hello', callbacks);
    // Give the execute loop time to set isRunning
    await new Promise((r) => setTimeout(r, 10));

    await expect(agent.execute('world', callbacks)).rejects.toThrow('already executing');

    // Clean up: resolve the first call so it finishes
    resolveFirst!({
      content: [{ type: 'text', text: 'done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 1, outputTokens: 1 },
    });
    await p;
  }, 10000);

  it('calls onMessage for text blocks', async () => {
    const { agent, llm } = createAgent();
    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Hello user!' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('hi', callbacks);
    expect(callbacks.onMessage).toHaveBeenCalledWith('Hello user!');
  });

  it('calls onComplete when LLM returns end_turn with no tools', async () => {
    const { agent, llm } = createAgent();
    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done!' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('do something', callbacks);
    expect(callbacks.onComplete).toHaveBeenCalledWith('Done!');
  });

  it('handles fill_saved_credential as unknown tool (removed from agent)', async () => {
    const { agent, llm } = createAgent();

    // First call: LLM returns tool_use for a tool that no longer exists
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-1',
        name: 'fill_saved_credential',
        input: {
          credential_id: 'cred-1',
          field_selector: '#card',
          field_type: 'card_number',
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    // Second call: LLM returns end_turn
    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('fill my card', callbacks);
    // Should have made two LLM calls (first returned unknown tool, second ended)
    expect(llm.chat).toHaveBeenCalledTimes(2);
  });

  it('handles ask_user tool call', async () => {
    const { agent, llm } = createAgent();

    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-2',
        name: 'ask_user',
        input: { question: 'Enter OTP', input_type: 'otp' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Got it' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('book hotel', callbacks);
    expect(callbacks.onInputRequired).toHaveBeenCalledWith(
      expect.objectContaining({
        question: 'Enter OTP',
        inputType: 'otp',
      })
    );
  });

  it('handles confirm_action tool call', async () => {
    const { agent, llm } = createAgent();

    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-3',
        name: 'confirm_action',
        input: { action_description: 'Place order', details: '₹5000' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Order placed' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('order food', callbacks);
    expect(callbacks.onConfirmRequired).toHaveBeenCalledWith({
      action: 'Place order',
      description: '₹5000',
    });
  });

  it('handles report_step tool call', async () => {
    const { agent, llm } = createAgent();

    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-4',
        name: 'report_step',
        input: { step_number: 1, step_name: 'Navigate', outcome: 'Opened booking.com' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('book', callbacks);
    expect(callbacks.onStepUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.stringContaining('Navigate'),
        status: 'completed',
      })
    );
  });

  it('delegates MCP tools to mcpHost.callTool', async () => {
    const mcpHost = createMockMcpHost();
    mcpHost.isMCPTool.mockReturnValue(true);
    mcpHost.callTool.mockResolvedValue({ success: true });

    const { agent, llm } = createAgent({ mcpHost });

    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-5',
        name: 'browser_navigate',
        input: { url: 'https://booking.com' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('go to booking.com', callbacks);
    expect(mcpHost.callTool).toHaveBeenCalledWith('browser_navigate', { url: 'https://booking.com' });
  });

  it('returns error for unknown tools', async () => {
    const { agent, llm } = createAgent();

    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-6',
        name: 'unknown_tool',
        input: {},
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('test', callbacks);
    // The conversation should have the error result added
    expect(llm.chat).toHaveBeenCalledTimes(2);
  });

  it('calls onError when maxIterations exceeded', async () => {
    const { agent, llm } = createAgent({ maxIterations: 2 });

    // Always return tool calls to keep looping
    llm.chat.mockResolvedValue({
      content: [{
        type: 'tool_use',
        id: 'tool-7',
        name: 'report_step',
        input: { step_number: 1, step_name: 'Loop', outcome: 'again' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('infinite loop', callbacks);
    expect(callbacks.onError).toHaveBeenCalledWith(
      expect.stringContaining('maximum')
    );
  });

  it('calls onError on LLM exception', async () => {
    const { agent, llm } = createAgent();
    llm.chat.mockRejectedValueOnce(new Error('API rate limit'));

    await agent.execute('test', callbacks);
    expect(callbacks.onError).toHaveBeenCalledWith('API rate limit');
  });

  it('stop() allows execute to be called again', async () => {
    const { agent, llm } = createAgent();
    llm.chat.mockResolvedValue({
      content: [{ type: 'text', text: 'Hi' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('first', callbacks);
    // Should not throw — isRunning reset by finally block
    await agent.execute('second', callbacks);
    expect(callbacks.onComplete).toHaveBeenCalledTimes(2);
  });

  // ── Layout enforcement & image validation tests ─────────────────

  it('enforces frontmatter layout even when LLM already uses input_type layout', async () => {
    const zomatoSkill = {
      name: 'zomato-food',
      description: 'Order food from Zomato',
      triggers: ['zomato'],
      siteUrl: 'https://www.zomato.com',
      requiresAuth: true,
      params: [],
      instructions: '# Zomato',
      layoutQuestion: "Let's set up your Zomato order! 🍛",
      layoutSections: [
        { id: 'address', label: 'Delivery Address', type: 'address', required: true },
        { id: 'cuisine', label: 'What are you craving?', type: 'carousel', required: true, options: '🥘 Biryani|🍕 Pizza|🍔 Burger' },
      ],
    };
    const { agent, llm } = createAgent({ skills: [zomatoSkill] });

    // LLM sends ask_user with input_type "layout" but with emoji image fields
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-layout',
        name: 'ask_user',
        input: {
          question: "Let's order!",
          input_type: 'layout',
          sections: [
            { name: 'address', label: 'Delivery Address', type: 'address' },
            {
              name: 'cuisine', label: 'Pick cuisine', type: 'carousel',
              cards: [
                { id: 'biryani', label: 'Biryani', image: '🥘' },
                { id: 'pizza', label: 'Pizza', image: '🍕' },
              ],
            },
          ],
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Great choices!' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('order butter chicken from zomato', callbacks);

    // Should show the layout to user (onInputRequired), NOT bounce
    expect(callbacks.onInputRequired).toHaveBeenCalledTimes(1);
    const call = (callbacks.onInputRequired as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.inputType).toBe('layout');
    // Frontmatter sections should override LLM's sections
    const sections = call.sections;
    expect(sections).toBeDefined();
    // Cuisine carousel cards should come from frontmatter (no image fields)
    const cuisineSection = sections.find((s: any) => s.name === 'cuisine');
    expect(cuisineSection).toBeDefined();
    expect(cuisineSection.cards).toBeDefined();
    expect(cuisineSection.cards.length).toBe(3); // Biryani, Pizza, Burger from frontmatter
    // Cards from frontmatter have no image field
    for (const card of cuisineSection.cards) {
      expect(card.image).toBeUndefined();
    }
  });

  it('strips non-URL images from layout carousel cards instead of bouncing', async () => {
    const { agent, llm } = createAgent();

    // Skill WITHOUT layoutSections — so enforcement won't fire
    agent.matchedSkill = {
      name: 'test-skill',
      description: 'Test',
      triggers: ['test'],
      siteUrl: 'https://test.com',
      requiresAuth: false,
      params: [],
      instructions: '# Test',
    };

    // Force askUserCount past 1 so layout enforcement doesn't trigger
    // We'll test the stripping logic directly on a layout call
    // First ask_user (gets counted as 1, no layout enforcement since no layoutSections)
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-first',
        name: 'ask_user',
        input: { question: 'What address?', input_type: 'text' },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    // Second ask_user with layout containing bad image fields
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-layout',
        name: 'ask_user',
        input: {
          question: 'Pick options',
          input_type: 'layout',
          sections: [
            {
              name: 'items', label: 'Items', type: 'carousel',
              cards: [
                { id: 'a', label: 'Item A', image: '🍕' },
                { id: 'b', label: 'Item B', image: 'not-a-url' },
              ],
            },
          ],
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('test order', callbacks);

    // Should have been called twice (both ask_user calls went through, neither bounced)
    expect(callbacks.onInputRequired).toHaveBeenCalledTimes(2);
    const secondCall = (callbacks.onInputRequired as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(secondCall.inputType).toBe('layout');
    // Non-URL images should have been stripped
    const carouselSection = secondCall.sections.find((s: any) => s.name === 'items');
    for (const card of carouselSection.cards) {
      expect(card.image).toBeUndefined();
    }
  });

  it('still bounces standalone carousel with non-URL images (product listings)', async () => {
    const { agent, llm } = createAgent();

    // LLM sends a standalone carousel (not layout) with emoji images
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-carousel',
        name: 'ask_user',
        input: {
          question: 'Pick a restaurant',
          input_type: 'carousel',
          cards: [
            { id: '1', label: 'Restaurant A', image: '🍕' },
            { id: '2', label: 'Restaurant B', image: 'emoji' },
          ],
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    // After bounce, LLM gives up
    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Let me try again' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('find restaurants', callbacks);

    // Should NOT have shown to user — bounced back to LLM
    expect(callbacks.onInputRequired).not.toHaveBeenCalled();
    // LLM should have received the bounce system message in a tool_result
    expect(llm.chat).toHaveBeenCalledTimes(2);
    const secondCallArg = llm.chat.mock.calls[1][0];
    const messages = secondCallArg.messages;
    // Tool result is stored as role: 'user' with content[].type: 'tool_result'
    const toolResultMsg = messages.find((m: any) =>
      m.role === 'user' && Array.isArray(m.content) &&
      m.content.some((c: any) => c.type === 'tool_result')
    );
    expect(toolResultMsg).toBeDefined();
    const toolResultContent = toolResultMsg.content.find((c: any) => c.type === 'tool_result');
    expect(toolResultContent.content).toContain('missing image URLs');
  });

  it('allows layout carousel cards with no image field at all (label-only)', async () => {
    const { agent, llm } = createAgent();

    // LLM sends layout with clean label-only cards (no image field)
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-layout',
        name: 'ask_user',
        input: {
          question: 'Setup',
          input_type: 'layout',
          sections: [
            {
              name: 'category', label: 'Category', type: 'carousel',
              cards: [
                { id: 'a', label: '🥘 Biryani' },
                { id: 'b', label: '🍕 Pizza' },
              ],
            },
          ],
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('order food', callbacks);

    // Should pass through without any issues
    expect(callbacks.onInputRequired).toHaveBeenCalledTimes(1);
    const call = (callbacks.onInputRequired as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.inputType).toBe('layout');
  });

  it('bounces ask_user when question contains internal reasoning (leak prevention)', async () => {
    const { agent, llm } = createAgent();

    // LLM calls ask_user with leaked internal reasoning as the question
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-leak',
        name: 'ask_user',
        input: {
          question: 'Before I can continue — the system is asking for real image URLs extracted from a webpage. At this stage, there is no webpage. Please tap your delivery address above.',
          input_type: 'text',
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    // After bounce, LLM rephrases cleanly
    llm.chat.mockResolvedValueOnce({
      content: [{
        type: 'tool_use',
        id: 'tool-clean',
        name: 'ask_user',
        input: {
          question: 'What is your delivery address?',
          input_type: 'text',
        },
      }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Got it!' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('order food', callbacks);

    // Leaked question should be bounced, clean question should go through
    expect(callbacks.onInputRequired).toHaveBeenCalledTimes(1);
    const call = (callbacks.onInputRequired as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.question).toBe('What is your delivery address?');
  });

  it('does NOT bounce legitimate ask_user questions', async () => {
    const { agent, llm } = createAgent({ maxIterations: 10 });

    const legitimateQuestions = [
      'Enter OTP',
      'What is your delivery address?',
      'Which restaurant do you prefer?',
    ];

    for (let i = 0; i < legitimateQuestions.length; i++) {
      llm.chat.mockResolvedValueOnce({
        content: [{
          type: 'tool_use',
          id: `tool-${i}`,
          name: 'ask_user',
          input: { question: legitimateQuestions[i], input_type: 'text' },
        }],
        stopReason: 'tool_use',
        usage: { inputTokens: 10, outputTokens: 5 },
      });
    }

    llm.chat.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Done' }],
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5 },
    });

    await agent.execute('order food', callbacks);

    // All legitimate questions should reach the user
    expect(callbacks.onInputRequired).toHaveBeenCalledTimes(legitimateQuestions.length);
    for (let i = 0; i < legitimateQuestions.length; i++) {
      const call = (callbacks.onInputRequired as ReturnType<typeof vi.fn>).mock.calls[i][0];
      expect(call.question).toBe(legitimateQuestions[i]);
    }
  });
});
