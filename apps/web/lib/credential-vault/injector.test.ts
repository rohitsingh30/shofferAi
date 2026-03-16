import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CredentialInjector } from './injector';

vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return {
    ...actual,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

describe('CredentialInjector', () => {
  let mockVault: any;
  let mockMcpHost: any;
  let injector: CredentialInjector;

  beforeEach(() => {
    mockVault = {
      getFieldValue: vi.fn(),
    };
    mockMcpHost = {
      callTool: vi.fn(),
    };
    injector = new CredentialInjector(mockVault, 'user-1');
  });

  it('retrieves field value from vault and fills via MCP', async () => {
    mockVault.getFieldValue.mockResolvedValue('4111111111111111');
    mockMcpHost.callTool.mockResolvedValue({});

    const result = await injector.fill(
      { credentialId: 'c1', fieldSelector: '#card-input', fieldType: 'card_number' },
      mockMcpHost
    );

    expect(result).toEqual({ success: true });
    expect(mockVault.getFieldValue).toHaveBeenCalledWith('c1', 'user-1', 'card_number');
    expect(mockMcpHost.callTool).toHaveBeenCalledWith('browser_type', {
      element: '#card-input',
      text: '4111111111111111',
    });
  });

  it('returns error when vault retrieval fails', async () => {
    mockVault.getFieldValue.mockRejectedValue(new Error('Not found'));

    const result = await injector.fill(
      { credentialId: 'c1', fieldSelector: '#input', fieldType: 'cvv' },
      mockMcpHost
    );

    expect(result).toEqual({ success: false, error: 'Not found' });
    expect(mockMcpHost.callTool).not.toHaveBeenCalled();
  });

  it('returns error when MCP callTool fails', async () => {
    mockVault.getFieldValue.mockResolvedValue('123');
    mockMcpHost.callTool.mockRejectedValue(new Error('Element not found'));

    const result = await injector.fill(
      { credentialId: 'c1', fieldSelector: '#missing', fieldType: 'cvv' },
      mockMcpHost
    );

    expect(result).toEqual({ success: false, error: 'Element not found' });
  });

  it('does not log the credential value', async () => {
    const { logger } = await import('@shofferai/shared');
    mockVault.getFieldValue.mockResolvedValue('secret-value');
    mockMcpHost.callTool.mockResolvedValue({});

    await injector.fill(
      { credentialId: 'c1', fieldSelector: '#input', fieldType: 'password' },
      mockMcpHost
    );

    // Check no logger call includes the actual value
    for (const method of ['info', 'debug', 'warn', 'error'] as const) {
      for (const call of vi.mocked(logger[method]).mock.calls) {
        const args = JSON.stringify(call);
        expect(args).not.toContain('secret-value');
      }
    }
  });

  it('passes correct userId to vault', async () => {
    const injector2 = new CredentialInjector(mockVault, 'other-user');
    mockVault.getFieldValue.mockResolvedValue('val');
    mockMcpHost.callTool.mockResolvedValue({});

    await injector2.fill(
      { credentialId: 'c1', fieldSelector: '#input', fieldType: 'username' },
      mockMcpHost
    );

    expect(mockVault.getFieldValue).toHaveBeenCalledWith('c1', 'other-user', 'username');
  });
});
