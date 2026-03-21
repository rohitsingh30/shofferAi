export class ShofferAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ShofferAIError';
  }
}

export class AgentError extends ShofferAIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AGENT_ERROR', 500, context);
    this.name = 'AgentError';
  }
}

export class BrowserError extends ShofferAIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BROWSER_ERROR', 500, context);
    this.name = 'BrowserError';
  }
}

export class CredentialError extends ShofferAIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CREDENTIAL_ERROR', 500, context);
    this.name = 'CredentialError';
  }
}

export class WorkflowError extends ShofferAIError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'WORKFLOW_ERROR', 500, context);
    this.name = 'WorkflowError';
  }
}

export class UserInputTimeoutError extends ShofferAIError {
  public readonly timeoutMs: number;

  constructor(taskId: string, stepId: string, inputType?: string, timeoutMs?: number) {
    const friendly = UserInputTimeoutError.friendlyMessage(inputType, timeoutMs);
    super(friendly, 'INPUT_TIMEOUT', 408, { taskId, stepId, inputType });
    this.name = 'UserInputTimeoutError';
    this.timeoutMs = timeoutMs ?? 0;
  }

  private static friendlyMessage(inputType?: string, timeoutMs?: number): string {
    const mins = timeoutMs ? Math.round(timeoutMs / 60_000) : undefined;
    const limit = mins ? ` after ${mins} minutes` : '';
    switch (inputType) {
      case 'carousel':
      case 'card_grid':
      case 'product_card':
        return `I didn't hear back on the product selection${limit}, so I've ended this task. Feel free to start a new chat whenever you're ready!`;
      case 'payment':
        return `The payment wasn't completed${limit}, so I've paused this task. Start a new chat to try again!`;
      case 'confirmation':
        return `I didn't get a confirmation${limit}, so I've ended this task. Just start a new chat when you're ready!`;
      case 'otp':
        return `The OTP wasn't entered${limit}, so I couldn't continue. Start a new chat to try again!`;
      case 'address':
        return `I still need your address to continue. The task timed out${limit} — start a new chat when you're ready!`;
      default:
        return `I didn't hear back${limit}, so I've ended this task. Feel free to start a new chat whenever you're ready!`;
    }
  }
}
