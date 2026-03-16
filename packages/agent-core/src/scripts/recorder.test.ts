import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScriptRecorder } from './recorder';

vi.mock('./template', () => ({
  detectTemplateBindings: vi.fn(() => ({})),
  templatizeArgs: vi.fn((args) => args),
}));

vi.mock('./compiler', () => ({
  compile: vi.fn(() => 'compiled code'),
}));

describe('ScriptRecorder', () => {
  let recorder: ScriptRecorder;

  beforeEach(() => {
    vi.clearAllMocks();
    recorder = new ScriptRecorder('test-skill', { destination: 'Mumbai' }, '[]');
  });

  it('starts recording', () => {
    recorder.start();
    expect(recorder.getActionCount()).toBe(0);
  });

  it('records tool calls after start', () => {
    recorder.start();
    recorder.record('browser_navigate', { url: 'https://test.com' });
    expect(recorder.getActionCount()).toBe(1);
  });

  it('does not record when not started', () => {
    recorder.record('browser_navigate', { url: 'https://test.com' });
    expect(recorder.getActionCount()).toBe(0);
  });

  it('does not record after stop', () => {
    recorder.start();
    recorder.record('browser_navigate', { url: 'https://test.com' });
    recorder.stop();
    recorder.record('browser_click', { element: '#btn' });
    expect(recorder.getActionCount()).toBe(1);
  });

  it('tracks skill step from report_step calls', () => {
    recorder.start();
    recorder.record('report_step', { step_number: 1, step_name: 'Nav', outcome: 'done' });
    recorder.record('browser_click', { element: '#btn' });
    // The second action should have skillStep = 1
    expect(recorder.getActionCount()).toBe(2);
  });

  it('marks ask_user and confirm_action as interactive', () => {
    recorder.start();
    recorder.record('ask_user', { question: 'OTP?', input_type: 'otp' });
    recorder.record('confirm_action', { action_description: 'Confirm' });
    // Both should be recorded with isInteractive
    expect(recorder.getActionCount()).toBe(2);
  });

  it('marks report_step with skip replayBehavior', () => {
    recorder.start();
    recorder.record('report_step', { step_number: 1, step_name: 'Test', outcome: 'ok' });
    expect(recorder.getActionCount()).toBe(1);
  });

  it('extracts selector hints for browser interaction tools', () => {
    recorder.start();
    recorder.record('browser_click', {
      element: '"Sign in" button',
      ref: 'ref123',
    });
    expect(recorder.getActionCount()).toBe(1);
  });

  it('compile returns SkillScript with metadata', () => {
    recorder.start();
    recorder.record('browser_navigate', { url: 'https://test.com' });
    recorder.stop();

    const script = recorder.compile();
    expect(script.skillId).toBe('test-skill');
    expect(script.version).toBe(1);
    expect(script.recordedAt).toMatch(/^\d{4}-/);
    expect(script.requiredParams).toEqual(['destination']);
    expect(script.actions).toHaveLength(1);
    expect(script.skillStepsHash).toHaveLength(16);
  });

  it('compile includes compiledCode when compiler succeeds', () => {
    recorder.start();
    recorder.record('browser_navigate', { url: 'https://test.com' });
    recorder.stop();

    const script = recorder.compile();
    expect(script.compiledCode).toBe('compiled code');
  });
});
