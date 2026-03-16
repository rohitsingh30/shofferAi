import type { FillCredentialRequest } from '@shofferai/shared';
import { CredentialVault } from './vault';
import { logger } from '@shofferai/shared';

interface MCPHost {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export class CredentialInjector {
  constructor(
    private vault: CredentialVault,
    private userId: string
  ) {}

  async fill(
    request: FillCredentialRequest,
    mcpHost: MCPHost
  ): Promise<{ success: boolean; error?: string }> {
    let value: string;

    try {
      value = await this.vault.getFieldValue(
        request.credentialId,
        this.userId,
        request.fieldType
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve credential';
      logger.error('Credential retrieval failed', {
        userId: this.userId,
        credentialId: request.credentialId,
        fieldType: request.fieldType,
      });
      return { success: false, error: message };
    }

    try {
      // Use Playwright MCP to type the value into the browser field
      await mcpHost.callTool('browser_type', {
        element: request.fieldSelector,
        text: value,
      });

      // Immediately discard the value from this scope
      logger.info('Credential field filled successfully', {
        userId: this.userId,
        fieldType: request.fieldType,
        // Never log the actual value
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fill field';
      logger.error('Browser fill failed', {
        userId: this.userId,
        fieldType: request.fieldType,
        selector: request.fieldSelector,
      });
      return { success: false, error: message };
    }
  }
}
