import { describe, it, expect } from 'vitest';
import {
  ShofferAIError,
  AgentError,
  BrowserError,
  CredentialError,
  WorkflowError,
  UserInputTimeoutError,
} from './errors';

describe('ShofferAIError', () => {
  it('sets message, code, statusCode, and context', () => {
    const err = new ShofferAIError('test', 'TEST_CODE', 400, { key: 'val' });
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(400);
    expect(err.context).toEqual({ key: 'val' });
  });

  it('defaults statusCode to 500', () => {
    const err = new ShofferAIError('test', 'CODE');
    expect(err.statusCode).toBe(500);
  });

  it('sets name to ShofferAIError', () => {
    const err = new ShofferAIError('test', 'CODE');
    expect(err.name).toBe('ShofferAIError');
  });

  it('is instanceof Error', () => {
    const err = new ShofferAIError('test', 'CODE');
    expect(err).toBeInstanceOf(Error);
  });

  it('context is optional', () => {
    const err = new ShofferAIError('test', 'CODE');
    expect(err.context).toBeUndefined();
  });
});

describe('AgentError', () => {
  it('sets code to AGENT_ERROR and name to AgentError', () => {
    const err = new AgentError('fail');
    expect(err.code).toBe('AGENT_ERROR');
    expect(err.name).toBe('AgentError');
    expect(err.statusCode).toBe(500);
  });

  it('is instanceof ShofferAIError', () => {
    expect(new AgentError('fail')).toBeInstanceOf(ShofferAIError);
  });

  it('accepts optional context', () => {
    const err = new AgentError('fail', { model: 'claude' });
    expect(err.context).toEqual({ model: 'claude' });
  });
});

describe('BrowserError', () => {
  it('sets code to BROWSER_ERROR and name to BrowserError', () => {
    const err = new BrowserError('timeout');
    expect(err.code).toBe('BROWSER_ERROR');
    expect(err.name).toBe('BrowserError');
  });

  it('is instanceof ShofferAIError', () => {
    expect(new BrowserError('timeout')).toBeInstanceOf(ShofferAIError);
  });
});

describe('CredentialError', () => {
  it('sets code to CREDENTIAL_ERROR and name to CredentialError', () => {
    const err = new CredentialError('decrypt failed');
    expect(err.code).toBe('CREDENTIAL_ERROR');
    expect(err.name).toBe('CredentialError');
  });

  it('is instanceof ShofferAIError', () => {
    expect(new CredentialError('fail')).toBeInstanceOf(ShofferAIError);
  });
});

describe('WorkflowError', () => {
  it('sets code to WORKFLOW_ERROR and name to WorkflowError', () => {
    const err = new WorkflowError('invalid transition');
    expect(err.code).toBe('WORKFLOW_ERROR');
    expect(err.name).toBe('WorkflowError');
  });

  it('is instanceof ShofferAIError', () => {
    expect(new WorkflowError('fail')).toBeInstanceOf(ShofferAIError);
  });
});

describe('UserInputTimeoutError', () => {
  it('sets message, statusCode 408, and taskId/stepId context', () => {
    const err = new UserInputTimeoutError('task-1', 'step-2');
    expect(err.message).toBe('No response received — task ended');
    expect(err.statusCode).toBe(408);
    expect(err.code).toBe('INPUT_TIMEOUT');
    expect(err.context).toEqual({ taskId: 'task-1', stepId: 'step-2', inputType: undefined });
  });

  it('generates friendly message for carousel input type', () => {
    const err = new UserInputTimeoutError('task-1', 'step-2', 'carousel', 600_000);
    expect(err.message).toBe('No product selected within 10 minutes — task ended');
    expect(err.timeoutMs).toBe(600_000);
  });

  it('generates friendly message for payment input type', () => {
    const err = new UserInputTimeoutError('task-1', 'step-2', 'payment', 600_000);
    expect(err.message).toBe('Payment not completed within 10 minutes — task ended');
  });

  it('generates friendly message for OTP input type', () => {
    const err = new UserInputTimeoutError('task-1', 'step-2', 'otp', 300_000);
    expect(err.message).toBe('OTP not entered within 5 minutes — task ended');
  });

  it('sets name to UserInputTimeoutError', () => {
    const err = new UserInputTimeoutError('t', 's');
    expect(err.name).toBe('UserInputTimeoutError');
  });

  it('is instanceof ShofferAIError', () => {
    expect(new UserInputTimeoutError('t', 's')).toBeInstanceOf(ShofferAIError);
  });
});
