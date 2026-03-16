import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Logger reads LOG_LEVEL at import time, so we test the default 'info' level behavior
// and spy on console methods to verify output

describe('logger', () => {
  let logger: typeof import('./logger').logger;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Re-import to get fresh module
    vi.resetModules();
    const mod = await import('./logger');
    logger = mod.logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.info calls console.info', () => {
    logger.info('hello');
    expect(console.info).toHaveBeenCalledOnce();
  });

  it('logger.debug does NOT call console.debug at default info level', () => {
    logger.debug('hidden');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('logger.warn calls console.warn', () => {
    logger.warn('warning');
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it('logger.error calls console.error', () => {
    logger.error('bad');
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('output includes ISO timestamp and level', () => {
    logger.info('test message');
    const output = vi.mocked(console.info).mock.calls[0][0] as string;
    expect(output).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
    expect(output).toContain('[INFO]');
    expect(output).toContain('test message');
  });

  it('output includes JSON context when provided', () => {
    logger.info('msg', { userId: 'u1', taskId: 't1' });
    const output = vi.mocked(console.info).mock.calls[0][0] as string;
    expect(output).toContain('"userId":"u1"');
    expect(output).toContain('"taskId":"t1"');
  });

  it('output omits context when not provided', () => {
    logger.info('msg');
    const output = vi.mocked(console.info).mock.calls[0][0] as string;
    // Should end with the message, no trailing JSON
    expect(output).toMatch(/msg$/);
  });

  it('all four methods exist', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});

describe('logger with debug level', () => {
  let logger: typeof import('./logger').logger;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.stubEnv('LOG_LEVEL', 'debug');
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    const mod = await import('./logger');
    logger = mod.logger;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('logger.debug calls console.debug when LOG_LEVEL=debug', () => {
    logger.debug('visible');
    expect(console.debug).toHaveBeenCalledOnce();
  });
});

describe('logger with error level', () => {
  let logger: typeof import('./logger').logger;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.stubEnv('LOG_LEVEL', 'error');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const mod = await import('./logger');
    logger = mod.logger;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('logger.warn does NOT call console.warn when LOG_LEVEL=error', () => {
    logger.warn('hidden');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('logger.error still calls console.error', () => {
    logger.error('visible');
    expect(console.error).toHaveBeenCalledOnce();
  });
});
