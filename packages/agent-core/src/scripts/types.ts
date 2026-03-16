/** Selector hint extracted from MCP tool calls and snapshots */
export interface SelectorHint {
  /** Element description from MCP call (e.g., "Reserve" button) */
  element?: string;
  /** Element role (button, link, textbox, etc.) */
  role?: string;
  /** Visible text content */
  text?: string;
  /** MCP ref identifier (for debugging only — ephemeral) */
  ref?: string;
  /** Page URL at time of action */
  pageUrl?: string;
}

/** Legacy format: MCP tool call sequence */
export interface RecordedAction {
  index: number;
  skillStep: number | null;
  toolName: string;
  toolArgs: Record<string, unknown>;
  isInteractive: boolean;
  templateBindings: Record<string, string | null>;
  replayBehavior: 'execute' | 'skip' | 'interactive';
  /** Stable selector info extracted from MCP context */
  selectorHint?: SelectorHint;
}

/** New format: Playwright code step */
export interface PlaywrightStep {
  name: string;
  /** Raw Playwright code with {{param}} templates. Runs via browser_run_code. */
  code?: string;
  /** If true, this step pauses for user input instead of running code. */
  interactive: boolean;
  /** Question to ask the user (for interactive steps). */
  question?: string;
  /** Input type for interactive steps. */
  inputType?: string;
  /** Map user's response to a context variable for use in later steps. */
  inputMapping?: string;
  /** If set, this step only runs when the named context variable is truthy. */
  conditional?: string;
  /** If true, this step emits a payment_required event for L2 panel. */
  paymentEvent?: boolean;
  /** Payment configuration fields for L2 panel. */
  paymentFields?: {
    bookingSummary: string;
    amountField: string;
    description: string;
  };
  /** Code to run after receiving user input (for interactive steps that also need post-processing). */
  postInputCode?: string;
}

export interface SkillScript {
  skillId: string;
  version: number;
  recordedAt: string;
  requiredParams: string[];
  /** "playwright-code" for new format, undefined for legacy MCP format */
  format?: 'playwright-code';
  /** New format: Playwright code steps */
  steps?: PlaywrightStep[];
  /** Legacy format: MCP tool call actions */
  actions?: RecordedAction[];
  /** Auto-compiled native Playwright script code */
  compiledCode?: string;
  skillStepsHash: string;
}
