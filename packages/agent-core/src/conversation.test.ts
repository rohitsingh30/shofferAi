import { describe, it, expect } from 'vitest';
import { ConversationManager } from './conversation';

describe('ConversationManager', () => {
  it('addUserMessage adds message with role user', () => {
    const cm = new ConversationManager();
    cm.addUserMessage('hello');
    const msgs = cm.getMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toEqual({ role: 'user', content: 'hello' });
  });

  it('addAssistantMessage adds message with role assistant', () => {
    const cm = new ConversationManager();
    cm.addAssistantMessage('I can help');
    const msgs = cm.getMessages();
    expect(msgs[0].role).toBe('assistant');
    expect(msgs[0].content).toBe('I can help');
  });

  it('addToolResult adds user message with tool_result content block', () => {
    const cm = new ConversationManager();
    cm.addToolResult('tool-123', 'result data');
    const msgs = cm.getMessages();
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toEqual([
      { type: 'tool_result', tool_use_id: 'tool-123', content: 'result data' },
    ]);
  });

  it('getMessages returns a copy', () => {
    const cm = new ConversationManager();
    cm.addUserMessage('test');
    const msgs1 = cm.getMessages();
    const msgs2 = cm.getMessages();
    expect(msgs1).not.toBe(msgs2);
    expect(msgs1).toEqual(msgs2);
  });

  it('clear empties all messages', () => {
    const cm = new ConversationManager();
    cm.addUserMessage('a');
    cm.addAssistantMessage('b');
    cm.clear();
    expect(cm.getMessages()).toHaveLength(0);
  });

  it('prune keeps first message + last 19 when exceeding 20', () => {
    const cm = new ConversationManager();
    // Add 25 messages
    for (let i = 0; i < 25; i++) {
      cm.addUserMessage(`msg-${i}`);
    }
    const msgs = cm.getMessages();
    expect(msgs).toHaveLength(20);
    // First message preserved
    expect(msgs[0].content).toBe('msg-0');
    // Last message preserved
    expect(msgs[19].content).toBe('msg-24');
  });

  it('messages under 20 are not pruned', () => {
    const cm = new ConversationManager();
    for (let i = 0; i < 15; i++) {
      cm.addUserMessage(`msg-${i}`);
    }
    expect(cm.getMessages()).toHaveLength(15);
  });

  it('preserves message order', () => {
    const cm = new ConversationManager();
    cm.addUserMessage('first');
    cm.addAssistantMessage('second');
    cm.addUserMessage('third');
    const msgs = cm.getMessages();
    expect(msgs.map(m => m.content)).toEqual(['first', 'second', 'third']);
  });
});
