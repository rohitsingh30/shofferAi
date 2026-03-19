import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

// Keep conversation tight to manage context window
const MAX_MESSAGES = 30;
// Truncate large tool results (browser_snapshot returns huge accessibility trees)
const MAX_TOOL_RESULT_LENGTH = 3000;

export class ConversationManager {
  private messages: MessageParam[] = [];

  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
    this.prune();
  }

  addAssistantMessage(content: MessageParam['content']): void {
    this.messages.push({ role: 'assistant', content });
    this.prune();
  }

  addToolResult(toolUseId: string, result: string): void {
    // Truncate large results (snapshots, page content) to fit context window
    const truncated = result.length > MAX_TOOL_RESULT_LENGTH
      ? result.slice(0, MAX_TOOL_RESULT_LENGTH) + '\n... [truncated]'
      : result;

    this.messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: truncated,
        },
      ],
    });
    this.prune();
  }

  getMessages(): MessageParam[] {
    return [...this.messages];
  }

  /** Replace the last message (used when auto-converting text to tool calls) */
  replaceLastMessage(content: MessageParam['content']): void {
    if (this.messages.length > 0) {
      this.messages[this.messages.length - 1] = { role: 'assistant', content };
    }
  }

  clear(): void {
    this.messages = [];
  }

  private prune(): void {
    if (this.messages.length > MAX_MESSAGES) {
      const first = this.messages[0];
      let recent = this.messages.slice(-MAX_MESSAGES + 1);

      // Ensure we don't start with orphaned tool results (role: 'user' with tool_result content).
      // OpenAI requires tool results to follow an assistant message with tool_calls.
      while (recent.length > 0) {
        const msg = recent[0];
        if (msg.role === 'user' && Array.isArray(msg.content) &&
            (msg.content as any[]).some((b) => b.type === 'tool_result')) {
          recent = recent.slice(1);
        } else {
          break;
        }
      }

      this.messages = [first, ...recent];
    }
  }
}
