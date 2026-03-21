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
    const within = mins ? ` within ${mins} minutes` : '';
    switch (inputType) {
      case 'carousel':
      case 'card_grid':
      case 'product_card':
        return `No product selected${within} — task ended`;
      case 'payment':
        return `Payment not completed${within} — task ended`;
      case 'confirmation':
        return `Confirmation not received${within} — task ended`;
      case 'otp':
        return `OTP not entered${within} — task ended`;
      case 'address':
        return `Address not provided${within} — task ended`;
      default:
        return `No response received${within} — task ended`;
    }
  }
}
