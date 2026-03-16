/**
 * ScriptCompiler — Converts recorded MCP tool call sequences into
 * native Playwright scripts that run without LLM or MCP overhead.
 *
 * Recording → Compile → Replay cycle:
 * 1. First run: LLM + MCP browse the site, ScriptRecorder captures everything
 * 2. ScriptCompiler converts RecordedAction[] → self-contained JS code
 * 3. Next run: ScriptPlayer spawns the compiled script (instant, no LLM)
 */

import type { RecordedAction, SelectorHint } from './types';
import { generateScriptCode, type ScriptTemplateOptions } from './script-template';

export interface CompileOptions {
  skillId: string;
  requiredParams: string[];
  actions: RecordedAction[];
  templateOptions?: ScriptTemplateOptions;
}

/**
 * Build a Playwright selector string from a SelectorHint.
 * Uses .or() chains for resilience against UI changes.
 */
function buildSelector(hint: SelectorHint, args: Record<string, unknown>): string {
  const selectors: string[] = [];

  // 1. If the MCP call included an element description, parse it
  if (hint.element) {
    const el = hint.element.trim();

    // Check for common role patterns in element descriptions
    if (hint.role) {
      // Role + text is very stable: button:has-text("Sign in")
      if (hint.text) {
        selectors.push(`${hint.role}:has-text("${escapeSelector(hint.text)}")`);
      } else {
        selectors.push(`[role="${hint.role}"]`);
      }
    }

    // Text-based selector
    if (hint.text && hint.text.length >= 2) {
      selectors.push(`text="${escapeSelector(hint.text)}"`);
    }

    // If element looks like a CSS selector already (starts with . # [ or contains :)
    if (/^[.#\[]/.test(el) || el.includes('::')) {
      selectors.push(el);
    }
  }

  // 2. Fallback: use ref from MCP call (for browser_click, the 'element' arg often has description)
  if (args.element && typeof args.element === 'string') {
    const desc = args.element as string;
    // Element descriptions from MCP snapshots are like: "Sign in" button, "Search" textbox
    const textMatch = desc.match(/^"([^"]+)"/);
    if (textMatch) {
      selectors.push(`text="${escapeSelector(textMatch[1])}"`);
    }
  }

  // 3. If we have a ref but nothing else, use a generic text locator
  if (selectors.length === 0 && hint.ref) {
    // Last resort — not great, but better than nothing
    selectors.push(`[data-ref="${hint.ref}"]`);
  }

  if (selectors.length === 0) {
    return `'body'`; // Ultimate fallback
  }

  if (selectors.length === 1) {
    return `'${selectors[0]}'`;
  }

  // Build .or() chain for resilience
  return selectors
    .map((s, i) => i === 0 ? `'${s}'` : `.or(page.locator('${s}'))`)
    .join('');
}

function escapeSelector(text: string): string {
  return text.replace(/"/g, '\\"').replace(/'/g, "\\'");
}

function escapeJS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Resolve template placeholders in a string for generated code.
 * Converts {{paramName}} → ${params.paramName} for JS template literal usage.
 */
function resolveTemplateForCode(value: string): string {
  return value.replace(/\{\{(\w+)\}\}/g, "' + params.$1 + '");
}

/**
 * Compile a single MCP action into Playwright code line(s).
 */
function compileAction(action: RecordedAction): string {
  const { toolName, toolArgs, selectorHint } = action;
  const lines: string[] = [];
  const indent = '    '; // 4 spaces (inside try block)

  switch (toolName) {
    // ── Navigation ──────────────────────────────────────────────
    case 'browser_navigate': {
      let url = (toolArgs.url as string) || '';
      url = resolveTemplateForCode(url);
      lines.push(`${indent}await page.goto('${escapeJS(url)}');`);
      lines.push(`${indent}await page.waitForLoadState('domcontentloaded');`);
      break;
    }

    // ── Page snapshot → wait for load ───────────────────────────
    case 'browser_snapshot': {
      lines.push(`${indent}await page.waitForLoadState('domcontentloaded');`);
      lines.push(`${indent}await page.waitForTimeout(1000);`);
      break;
    }

    // ── Click ───────────────────────────────────────────────────
    case 'browser_click': {
      const hint = selectorHint || {};
      if (toolArgs.element) {
        hint.element = hint.element || (toolArgs.element as string);
      }
      if (toolArgs.ref) {
        hint.ref = hint.ref || (toolArgs.ref as string);
      }
      const sel = buildSelector(hint, toolArgs);
      lines.push(`${indent}await page.locator(${sel}).first().click();`);
      lines.push(`${indent}await page.waitForTimeout(500);`);
      break;
    }

    // ── Type / Fill ─────────────────────────────────────────────
    case 'browser_type': {
      const hint = selectorHint || {};
      if (toolArgs.ref) hint.ref = hint.ref || (toolArgs.ref as string);
      const sel = buildSelector(hint, toolArgs);
      let text = (toolArgs.text as string) || '';
      text = resolveTemplateForCode(text);
      lines.push(`${indent}await page.locator(${sel}).first().fill('${escapeJS(text)}');`);
      break;
    }

    // ── Fill form (multiple fields) ─────────────────────────────
    case 'browser_fill_form': {
      const fields = toolArgs.fields as Array<{ ref?: string; selector?: string; value: string }> | undefined;
      if (fields) {
        for (const field of fields) {
          const value = resolveTemplateForCode(field.value);
          const sel = field.selector || `[data-ref="${field.ref}"]`;
          lines.push(`${indent}await page.locator('${escapeJS(sel)}').first().fill('${escapeJS(value)}');`);
        }
      }
      break;
    }

    // ── Select option ───────────────────────────────────────────
    case 'browser_select_option': {
      const hint = selectorHint || {};
      if (toolArgs.ref) hint.ref = hint.ref || (toolArgs.ref as string);
      const sel = buildSelector(hint, toolArgs);
      const values = toolArgs.values || toolArgs.value || '';
      const valStr = Array.isArray(values) ? JSON.stringify(values) : `'${escapeJS(String(values))}'`;
      lines.push(`${indent}await page.locator(${sel}).first().selectOption(${valStr});`);
      break;
    }

    // ── Key press ───────────────────────────────────────────────
    case 'browser_press_key': {
      const key = (toolArgs.key as string) || 'Enter';
      lines.push(`${indent}await page.keyboard.press('${escapeJS(key)}');`);
      break;
    }

    // ── Go back ─────────────────────────────────────────────────
    case 'browser_go_back': {
      lines.push(`${indent}await page.goBack();`);
      lines.push(`${indent}await page.waitForLoadState('domcontentloaded');`);
      break;
    }

    // ── Handle dialog ───────────────────────────────────────────
    case 'browser_handle_dialog': {
      const accept = toolArgs.accept !== false;
      const promptText = toolArgs.promptText ? `'${escapeJS(toolArgs.promptText as string)}'` : 'undefined';
      lines.push(`${indent}page.once('dialog', async (d) => { await d.${accept ? 'accept' : 'dismiss'}(${accept && toolArgs.promptText ? promptText : ''}); });`);
      break;
    }

    // ── Wait for element ────────────────────────────────────────
    case 'browser_wait_for':
    case 'browser_wait_for_element': {
      const text = (toolArgs.text as string) || (toolArgs.selector as string);
      if (text) {
        lines.push(`${indent}await page.waitForSelector('text="${escapeJS(text)}"', { timeout: 10000 }).catch(() => {});`);
      } else {
        lines.push(`${indent}await page.waitForTimeout(2000);`);
      }
      break;
    }

    // ── Interactive: ask_user ────────────────────────────────────
    case 'ask_user': {
      const question = escapeJS((toolArgs.question as string) || 'Please provide input');
      const inputType = (toolArgs.input_type as string) || 'freetext';
      const options = toolArgs.options ? JSON.stringify(toolArgs.options) : 'undefined';
      lines.push(`${indent}const response_${action.index} = await requestFromHost({`);
      lines.push(`${indent}  type: 'input_required',`);
      lines.push(`${indent}  question: '${question}',`);
      lines.push(`${indent}  inputType: '${inputType}',`);
      if (toolArgs.options) {
        lines.push(`${indent}  options: ${options},`);
      }
      lines.push(`${indent}});`);
      break;
    }

    // ── Interactive: confirm_action ──────────────────────────────
    case 'confirm_action': {
      const action_desc = escapeJS((toolArgs.action_description as string) || 'Proceed?');
      const details = escapeJS((toolArgs.details as string) || '');
      lines.push(`${indent}const confirm_${action.index} = await requestFromHost({`);
      lines.push(`${indent}  type: 'confirm_action',`);
      lines.push(`${indent}  action: '${action_desc}',`);
      lines.push(`${indent}  details: '${details}',`);
      lines.push(`${indent}});`);
      lines.push(`${indent}if (!confirm_${action.index}.confirmed) {`);
      lines.push(`${indent}  log({ step: 'Cancelled by user', status: 'completed' });`);
      lines.push(`${indent}  log({ done: true, cancelled: true });`);
      lines.push(`${indent}  await context.close();`);
      lines.push(`${indent}  rl.close();`);
      lines.push(`${indent}  return;`);
      lines.push(`${indent}}`);
      break;
    }

    // ── Interactive: fill_saved_credential ───────────────────────
    case 'fill_saved_credential': {
      const credId = (toolArgs.credential_id as string) || '';
      const fieldType = (toolArgs.field_type as string) || '';
      const fieldSelector = (toolArgs.field_selector as string) || '';
      // Use the hint or fall back to a generic selector
      const hint = selectorHint || {};
      let sel: string;
      if (fieldSelector) {
        sel = `'${escapeJS(fieldSelector)}'`;
      } else {
        sel = buildSelector(hint, toolArgs);
      }
      lines.push(`${indent}// Securely fill ${fieldType} from credential vault`);
      lines.push(`${indent}const cred_${action.index} = await requestFromHost({`);
      lines.push(`${indent}  type: 'fill_credential',`);
      lines.push(`${indent}  credentialId: '${escapeJS(credId)}',`);
      lines.push(`${indent}  fieldType: '${escapeJS(fieldType)}',`);
      lines.push(`${indent}});`);
      lines.push(`${indent}if (cred_${action.index}.value) {`);
      lines.push(`${indent}  await page.locator(${sel}).first().fill(cred_${action.index}.value);`);
      lines.push(`${indent}}`);
      break;
    }

    // ── report_step → progress log ──────────────────────────────
    case 'report_step': {
      const stepNum = toolArgs.step_number || action.skillStep || '?';
      const stepName = escapeJS((toolArgs.step_name as string) || '');
      const outcome = escapeJS((toolArgs.outcome as string) || '');
      lines.push(`${indent}log({ step: 'Step ${stepNum}: ${stepName} — ${outcome}', status: 'running' });`);
      break;
    }

    // ── Unknown tool → comment ──────────────────────────────────
    default: {
      lines.push(`${indent}// Unknown tool: ${toolName} — skipped during compilation`);
      lines.push(`${indent}// Args: ${JSON.stringify(toolArgs).slice(0, 200)}`);
      break;
    }
  }

  return lines.join('\n');
}

/**
 * Compile an array of recorded MCP actions into a native Playwright script.
 */
export function compile(options: CompileOptions): string {
  const { skillId, requiredParams, actions, templateOptions } = options;

  // Filter out skipped actions
  const executableActions = actions.filter((a) => a.replayBehavior !== 'skip');

  // Group actions by skill step for readability
  const bodyLines: string[] = [];
  let currentStep: number | null = null;

  for (const action of executableActions) {
    // Add step header comment when step changes
    if (action.skillStep !== null && action.skillStep !== currentStep) {
      currentStep = action.skillStep;
      bodyLines.push('');
      bodyLines.push(`    // ── Step ${currentStep} ──────────────────────────────────────────`);
      bodyLines.push(`    log({ step: 'Running step ${currentStep}...', status: 'running' });`);
    }

    const compiled = compileAction(action);
    if (compiled) {
      bodyLines.push(compiled);
    }
  }

  // Add completion log
  bodyLines.push('');
  bodyLines.push('    // ── Done ──────────────────────────────────────────────────────');
  bodyLines.push("    log({ step: 'Workflow completed', status: 'completed' });");
  bodyLines.push("    log({ message: 'Task completed successfully.' });");
  bodyLines.push('    log({ done: true });');
  bodyLines.push('');
  bodyLines.push('    // Keep browser open briefly for user to see result');
  bodyLines.push('    await page.waitForTimeout(5000);');

  const bodyCode = bodyLines.join('\n');

  return generateScriptCode(skillId, requiredParams, bodyCode, templateOptions);
}
