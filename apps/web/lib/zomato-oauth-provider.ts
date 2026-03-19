import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from '@shofferai/shared';

/**
 * OAuth provider for Zomato MCP server.
 *
 * Reads tokens initially obtained via `npx mcp-remote https://mcp-server.zomato.com/mcp`.
 * That command does the OAuth dance with localhost redirect and stores tokens in ~/.mcp-auth/.
 *
 * For Cloud Run, tokens can be set via ZOMATO_OAUTH_TOKENS env var (JSON string).
 */

interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  obtained_at?: number;
}

interface OAuthClientInfo {
  client_id: string;
  client_secret?: string;
  redirect_uris?: string[];
}

/**
 * Search ~/.mcp-auth for files matching a suffix pattern.
 * mcp-remote stores files as: ~/.mcp-auth/mcp-remote-X.Y.Z/{hash}_{suffix}.json
 */
function findMcpAuthFile(suffix: string): string | null {
  const mcpAuthDir = join(process.env.HOME || '/tmp', '.mcp-auth');
  if (!existsSync(mcpAuthDir)) return null;

  try {
    const dirs = readdirSync(mcpAuthDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const dir of dirs) {
      const fullDir = join(mcpAuthDir, dir);
      const files = readdirSync(fullDir);
      const match = files.find(f => f.endsWith(suffix));
      if (match) return join(fullDir, match);
    }
  } catch {
    // ignore
  }
  return null;
}

export class ZomatoOAuthProvider {
  private tokenPath: string;
  private clientInfoPath: string;
  private tokens: OAuthTokens | null = null;
  private clientInfo: OAuthClientInfo | null = null;

  constructor(options?: { storagePath?: string }) {
    const base = options?.storagePath || join(
      process.env.HOME || '/tmp',
      '.shofferai',
      'zomato-oauth'
    );
    this.tokenPath = join(base, 'tokens.json');
    this.clientInfoPath = join(base, 'client-info.json');
  }

  async clientInformation(): Promise<OAuthClientInfo | undefined> {
    if (this.clientInfo) return this.clientInfo;

    // Try our own storage first, then mcp-remote's storage
    const paths = [this.clientInfoPath, findMcpAuthFile('_client_info.json')].filter(Boolean) as string[];

    for (const path of paths) {
      try {
        if (existsSync(path)) {
          this.clientInfo = JSON.parse(readFileSync(path, 'utf-8'));
          logger.info(`Zomato OAuth: loaded client info from ${path}`);
          return this.clientInfo!;
        }
      } catch { /* try next */ }
    }
    return undefined;
  }

  async saveClientInformation(info: OAuthClientInfo): Promise<void> {
    this.clientInfo = info;
    const dir = dirname(this.clientInfoPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.clientInfoPath, JSON.stringify(info, null, 2));
  }

  /**
   * Get the current access token. Checks (in order):
   * 1. In-memory cache
   * 2. ZOMATO_OAUTH_TOKENS env var (for Cloud Run)
   * 3. Our own storage (~/.shofferai/zomato-oauth/tokens.json)
   * 4. mcp-remote's storage (~/.mcp-auth/mcp-remote-X.Y.Z/..._tokens.json)
   */
  async getAccessToken(): Promise<string | null> {
    if (this.tokens?.access_token) return this.tokens.access_token;

    // Env var (Cloud Run)
    if (process.env.ZOMATO_OAUTH_TOKENS) {
      try {
        this.tokens = JSON.parse(process.env.ZOMATO_OAUTH_TOKENS);
        logger.info('Zomato OAuth: loaded tokens from env var');
        return this.tokens!.access_token;
      } catch {
        logger.warn('Zomato OAuth: failed to parse ZOMATO_OAUTH_TOKENS env var');
      }
    }

    // File-based storage
    const paths = [this.tokenPath, findMcpAuthFile('_tokens.json')].filter(Boolean) as string[];

    for (const path of paths) {
      try {
        if (existsSync(path)) {
          this.tokens = JSON.parse(readFileSync(path, 'utf-8'));
          logger.info(`Zomato OAuth: loaded tokens from ${path}`);
          return this.tokens!.access_token;
        }
      } catch { /* try next */ }
    }

    logger.warn('Zomato OAuth: no tokens found. Run: npx mcp-remote https://mcp-server.zomato.com/mcp');
    return null;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this.tokens = { ...tokens, obtained_at: Date.now() };
    const dir = dirname(this.tokenPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.tokenPath, JSON.stringify(this.tokens, null, 2));
    logger.info('Zomato OAuth: saved tokens');
  }
}
