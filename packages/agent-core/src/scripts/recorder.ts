import type { RecordedAction, SelectorHint, SkillScript } from './types';
import { detectTemplateBindings, templatizeArgs } from './template';
import { compile as compileToPlaywright } from './compiler';
import { createHash } from 'crypto';

/**
 * Extract a SelectorHint from MCP tool call args and result.
 * Parses element descriptions, role info, and text content from
 * the MCP snapshot/action context to build stable selectors.
 */
function extractSelectorHint(
  toolName: string,
  toolArgs: Record<string, unknown>,
  toolResult?: unknown
): SelectorHint | undefined {
  // Only browser interaction tools need selector hints
  const interactionTools = ['browser_click', 'browser_type', 'browser_select_option', 'browser_fill_form'];
  if (!interactionTools.includes(toolName)) return undefined;

  const hint: SelectorHint = {};

  // Extract ref
  if (toolArgs.ref) {
    hint.ref = String(toolArgs.ref);
  }

  // Extract element description — MCP Playwright passes 'element' as a human-readable description
  if (toolArgs.element && typeof toolArgs.element === 'string') {
    hint.element = toolArgs.element;

    // Parse role and text from element description
    // Common patterns: '"Sign in" button', '"Search" textbox', 'link "Hotels"'
    const quotedText = toolArgs.element.match(/"([^"]+)"/);
    if (quotedText) {
      hint.text = quotedText[1];
    }

    // Detect role from description keywords
    const roleLower = toolArgs.element.toLowerCase();
    if (roleLower.includes('button')) hint.role = 'button';
    else if (roleLower.includes('link')) hint.role = 'link';
    else if (roleLower.includes('textbox') || roleLower.includes('input')) hint.role = 'textbox';
    else if (roleLower.includes('checkbox')) hint.role = 'checkbox';
    else if (roleLower.includes('radio')) hint.role = 'radio';
    else if (roleLower.includes('combobox') || roleLower.includes('select')) hint.role = 'combobox';
    else if (roleLower.includes('tab')) hint.role = 'tab';
    else if (roleLower.includes('menu')) hint.role = 'menuitem';
  }

  // Extract page URL from navigation results
  if (toolResult && typeof toolResult === 'object') {
    const result = toolResult as Record<string, unknown>;
    if (result.url && typeof result.url === 'string') {
      hint.pageUrl = result.url;
    }
  }

  return Object.keys(hint).length > 0 ? hint : undefined;
}

export class ScriptRecorder {
  private actions: RecordedAction[] = [];
  private currentSkillStep: number | null = null;
  private isRecording = false;
  private lastPageUrl: string | null = null;

  constructor(
    private skillId: string,
    private extractedParams: Record<string, string>,
    private skillStepsJson: string // JSON of skill.steps for hashing
  ) {}

  start(): void {
    this.isRecording = true;
    this.actions = [];
  }

  /**
   * Record a tool call with optional result for richer selector extraction.
   *
   * @param toolName - MCP or custom tool name
   * @param toolArgs - Tool arguments
   * @param toolResult - Optional tool execution result (for snapshot text, URLs, etc.)
   */
  record(
    toolName: string,
    toolArgs: Record<string, unknown>,
    toolResult?: unknown
  ): void {
    if (!this.isRecording) return;

    // Track skill step from report_step calls
    if (toolName === 'report_step') {
      this.currentSkillStep = toolArgs.step_number as number;
    }

    // Track page URL from navigation results
    if (toolName === 'browser_navigate') {
      this.lastPageUrl = (toolArgs.url as string) || this.lastPageUrl;
    }

    const isInteractive = ['ask_user', 'confirm_action'].includes(toolName);
    const bindings = detectTemplateBindings(toolArgs, this.extractedParams);

    // Determine replay behavior
    let replayBehavior: RecordedAction['replayBehavior'] = 'execute';
    if (isInteractive) replayBehavior = 'interactive';
    if (toolName === 'report_step') replayBehavior = 'skip';

    // Extract selector hints from tool context
    const selectorHint = extractSelectorHint(toolName, toolArgs, toolResult);
    if (selectorHint && this.lastPageUrl) {
      selectorHint.pageUrl = selectorHint.pageUrl || this.lastPageUrl;
    }

    // Templatize args — replace user-specific values with {{param}}
    const templatizedArgs = templatizeArgs(toolArgs, bindings, this.extractedParams);

    this.actions.push({
      index: this.actions.length,
      skillStep: this.currentSkillStep,
      toolName,
      toolArgs: templatizedArgs,
      isInteractive,
      templateBindings: bindings,
      replayBehavior,
      selectorHint,
    });
  }

  stop(): void {
    this.isRecording = false;
  }

  /**
   * Compile recorded actions into a SkillScript.
   * Includes both the legacy MCP action format AND auto-compiled Playwright code.
   */
  compile(): SkillScript {
    const hash = createHash('sha256').update(this.skillStepsJson).digest('hex').slice(0, 16);
    const requiredParams = Object.keys(this.extractedParams);

    // Auto-compile to native Playwright code
    let compiledCode: string | undefined;
    try {
      compiledCode = compileToPlaywright({
        skillId: this.skillId,
        requiredParams,
        actions: this.actions,
      });
    } catch {
      // Compilation is best-effort — don't fail the recording
    }

    return {
      skillId: this.skillId,
      version: 1,
      recordedAt: new Date().toISOString(),
      requiredParams,
      actions: this.actions,
      compiledCode,
      skillStepsHash: hash,
    };
  }

  getActionCount(): number {
    return this.actions.length;
  }
}
