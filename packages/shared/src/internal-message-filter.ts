/**
 * Detect messages that are internal tool-call labels, not user-meaningful text.
 * Used by task-manager (laptop) and execute route (cloud) to suppress
 * internal Copilot CLI messages from reaching the user's chat UI.
 *
 * See docs/REPEATING-MISTAKES.md #14 for context.
 */
export function isInternalToolLabel(message: string | undefined): boolean {
  if (!message) return true;
  const trimmed = message.trim();
  if (!trimmed) return true;
  // "Browser: report_intent", "Browser: playwright-browser_navigate", etc.
  if (/^Browser:\s+[\w-]+$/i.test(trimmed)) return true;
  // Raw tool names (with or without mcp__ prefix)
  if (/^(mcp__\w+__|playwright__)?browser_\w+$/i.test(trimmed)) return true;
  if (/^report_intent$/i.test(trimmed)) return true;
  // Short status labels
  if (/^(Agent starting\.{3}|Starting\.{3}|Thinking\.{3})$/i.test(trimmed)) return true;
  return false;
}
