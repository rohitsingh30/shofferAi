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
  constructor(taskId: string, stepId: string) {
    super('User input timed out', 'INPUT_TIMEOUT', 408, { taskId, stepId });
    this.name = 'UserInputTimeoutError';
  }
}
