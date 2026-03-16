import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import type { MessageParam, Tool, ContentBlock } from '@anthropic-ai/sdk/resources/messages';
import type { LLMClient, LLMResponse, LLMChatParams } from './llm-client';
import { logger } from '@shofferai/shared';

const TOOL_CALLING_PREAMBLE = `
IMPORTANT: You have access to tools/functions. When you need to perform an action:
- Use the provided tool calls — do NOT describe the action in text instead.
- Always provide ALL required parameters for each tool.
- Use exact tool names as listed.
- You may include a brief explanation before making tool calls.
`.trim();

/**
 * Base LLM client for any OpenAI-compatible API.
 * Handles translation between Anthropic SDK types (used internally) and OpenAI API format.
 * Subclasses only need to provide the OpenAI client instance and model name.
 */
export abstract class OpenAIBaseClient implements LLMClient {
  protected client: OpenAI;
  protected model: string;

  constructor(client: OpenAI, model: string) {
    this.client = client;
    this.model = model;
  }

  async chat(params: LLMChatParams): Promise<LLMResponse> {
    const messages = this.translateMessages(params.system, params.messages);
    const tools =
      params.tools && params.tools.length > 0
        ? this.translateTools(params.tools)
        : undefined;

    logger.debug('Sending message to LLM', {
      model: this.model,
      messageCount: messages.length,
      toolCount: tools?.length || 0,
    });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools,
      // GPT-5.x and reasoning models don't support temperature=0 or max_tokens
      ...(this.model.startsWith('gpt-5') || this.model.startsWith('o')
        ? { max_completion_tokens: params.maxTokens || 4096 }
        : { temperature: 0, max_tokens: params.maxTokens || 4096 }),
    });

    const result = this.translateResponse(response);

    logger.debug('LLM response received', {
      stopReason: result.stopReason,
      contentBlocks: result.content.length,
    });

    return result;
  }

  /**
   * Translate Anthropic-style MessageParam[] → OpenAI ChatCompletionMessageParam[]
   */
  protected translateMessages(
    system: string,
    messages: MessageParam[]
  ): ChatCompletionMessageParam[] {
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: `${TOOL_CALLING_PREAMBLE}\n\n${system}` },
    ];

    for (const msg of messages) {
      if (msg.role === 'user') {
        if (typeof msg.content === 'string') {
          openaiMessages.push({ role: 'user', content: msg.content });
        } else if (Array.isArray(msg.content)) {
          const toolResults = (msg.content as any[]).filter(
            (b) => b.type === 'tool_result'
          );
          if (toolResults.length > 0) {
            for (const tr of toolResults) {
              const block = tr as {
                type: string;
                tool_use_id: string;
                content?: string;
              };
              openaiMessages.push({
                role: 'tool',
                tool_call_id: block.tool_use_id,
                content:
                  typeof block.content === 'string'
                    ? block.content
                    : JSON.stringify(block.content || ''),
              });
            }
          } else {
            const text = (msg.content as any[])
              .filter((b) => b.type === 'text')
              .map((b) => (b as { text: string }).text)
              .join('\n');
            if (text) {
              openaiMessages.push({ role: 'user', content: text });
            }
          }
        }
      } else if (msg.role === 'assistant') {
        if (typeof msg.content === 'string') {
          openaiMessages.push({ role: 'assistant', content: msg.content });
        } else if (Array.isArray(msg.content)) {
          const textParts: string[] = [];
          const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] =
            [];

          for (const block of msg.content as ContentBlock[]) {
            if (block.type === 'text') {
              textParts.push(block.text);
            } else if (block.type === 'tool_use') {
              toolCalls.push({
                id: block.id,
                type: 'function',
                function: {
                  name: block.name,
                  arguments: JSON.stringify(block.input),
                },
              });
            }
          }

          const assistantMsg: ChatCompletionMessageParam = {
            role: 'assistant',
            content: textParts.join('\n') || null,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
          };
          openaiMessages.push(assistantMsg);
        }
      }
    }

    // Safety: remove orphaned tool messages (no preceding assistant with tool_calls).
    // Azure OpenAI strictly enforces that tool results follow tool_calls.
    const validToolCallIds = new Set<string>();
    const cleaned: ChatCompletionMessageParam[] = [];
    for (const msg of openaiMessages) {
      if (msg.role === 'assistant' && 'tool_calls' in msg && msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          validToolCallIds.add(tc.id);
        }
        cleaned.push(msg);
      } else if (msg.role === 'tool') {
        const toolMsg = msg as { role: 'tool'; tool_call_id: string; content: string };
        if (validToolCallIds.has(toolMsg.tool_call_id)) {
          cleaned.push(msg);
        }
        // else: skip orphaned tool result
      } else {
        cleaned.push(msg);
      }
    }

    return cleaned;
  }

  /**
   * Translate Anthropic Tool[] → OpenAI ChatCompletionTool[]
   */
  protected translateTools(tools: Tool[]): ChatCompletionTool[] {
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description || '',
        parameters: tool.input_schema as Record<string, unknown>,
      },
    }));
  }

  /**
   * Translate OpenAI response → Anthropic-compatible LLMResponse
   */
  protected translateResponse(
    response: OpenAI.Chat.Completions.ChatCompletion
  ): LLMResponse {
    const choice = response.choices[0];
    if (!choice) {
      return {
        content: [{ type: 'text' as const, text: 'No response from model.', citations: null } as unknown as ContentBlock],
        stopReason: 'end_turn',
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    }

    const msg = choice.message;
    const content: ContentBlock[] = [];

    if (msg.content) {
      content.push({ type: 'text' as const, text: msg.content, citations: null } as unknown as ContentBlock);
    }

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments);
        } catch {
          const jsonMatch = tc.function.arguments.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            try {
              parsedArgs = JSON.parse(jsonMatch[1].trim());
            } catch {
              logger.warn('Failed to parse tool call arguments', {
                tool: tc.function.name,
                args: tc.function.arguments,
              });
              parsedArgs = { _raw: tc.function.arguments, _parse_error: true };
            }
          } else {
            logger.warn('Failed to parse tool call arguments', {
              tool: tc.function.name,
              args: tc.function.arguments,
            });
            parsedArgs = { _raw: tc.function.arguments, _parse_error: true };
          }
        }

        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.function.name,
          input: parsedArgs,
        } as ContentBlock);
      }
    }

    if (content.length === 0) {
      content.push({ type: 'text', text: '' } as ContentBlock);
    }

    const hasToolCalls = msg.tool_calls && msg.tool_calls.length > 0;
    const stopReason = hasToolCalls ? 'tool_use' : 'end_turn';

    return {
      content,
      stopReason,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }
}
