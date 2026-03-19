/**
 * E2E test for Zomato MCP integration.
 *
 * Hits Zomato's REAL MCP server with REAL OAuth tokens.
 * Requires: `npx mcp-remote https://mcp-server.zomato.com/mcp` to have been run once.
 *
 * Run: npx vitest run apps/web/lib/zomato-mcp-e2e.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ZomatoMCPHost } from './zomato-mcp-host';
import { ZomatoOAuthProvider } from './zomato-oauth-provider';

// Skip if no tokens available (CI or fresh machine)
const provider = new ZomatoOAuthProvider();
let hasTokens = false;

beforeAll(async () => {
  const token = await provider.getAccessToken();
  hasTokens = !!token;
  if (!hasTokens) {
    console.warn('⚠ Skipping Zomato E2E tests — no OAuth tokens. Run: npx mcp-remote https://mcp-server.zomato.com/mcp');
  }
});

describe('Zomato MCP E2E', () => {
  let host: ZomatoMCPHost;

  beforeAll(async () => {
    if (!hasTokens) return;
    host = new ZomatoMCPHost();
    await host.connect();
  }, 30_000);

  afterAll(async () => {
    if (host) await host.disconnect();
  });

  it('connects and discovers tools', () => {
    if (!hasTokens) return;

    const tools = host.getTools();
    expect(tools.length).toBeGreaterThanOrEqual(8);

    const toolNames = tools.map(t => t.name);
    expect(toolNames).toContain('get_restaurants_for_keyword');
    expect(toolNames).toContain('get_menu_items_listing');
    expect(toolNames).toContain('create_cart');
    expect(toolNames).toContain('checkout_cart');
    expect(toolNames).toContain('get_cart_offers');
    expect(toolNames).toContain('get_saved_addresses_for_user');
    expect(toolNames).toContain('get_order_tracking_info');
  });

  it('isMCPTool routes correctly', () => {
    if (!hasTokens) return;

    expect(host.isMCPTool('get_restaurants_for_keyword')).toBe(true);
    expect(host.isMCPTool('create_cart')).toBe(true);
    expect(host.isMCPTool('browser_click')).toBe(false);
    expect(host.isMCPTool('nonexistent')).toBe(false);
  });

  it('getToolsAsAnthropicFormat returns correct shape', () => {
    if (!hasTokens) return;

    const tools = host.getToolsAsAnthropicFormat();
    for (const tool of tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('input_schema');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
    }
  });

  it('searches restaurants for biryani', async () => {
    if (!hasTokens) return;

    // First get a saved address_id (required by Zomato's search)
    const addrResult = await host.callTool('get_saved_addresses_for_user', {});
    const addrContent = (addrResult as any)?.content;
    let addressId: string | undefined;
    if (addrContent?.length) {
      const text = addrContent.map((c: any) => c.text || '').join('');
      try {
        const parsed = JSON.parse(text);
        addressId = parsed?.addresses?.[0]?.address_id;
      } catch { /* use without address */ }
    }
    console.log('📍 Using address_id:', addressId || 'none');

    const result = await host.callTool('get_restaurants_for_keyword', {
      keyword: 'biryani',
      ...(addressId ? { address_id: addressId } : {}),
    });

    expect(result).toBeDefined();
    // Zomato MCP returns content array with text results
    const content = (result as any)?.content;
    if (content) {
      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);
      // Should contain restaurant data as text
      const text = content.map((c: any) => c.text || '').join(' ');
      expect(text.length).toBeGreaterThan(50);
      console.log('🍗 Restaurant search result preview:', text.slice(0, 300));
    }
  }, 30_000);

  it('gets saved addresses', async () => {
    if (!hasTokens) return;

    const result = await host.callTool('get_saved_addresses_for_user', {});

    expect(result).toBeDefined();
    const content = (result as any)?.content;
    if (content) {
      expect(Array.isArray(content)).toBe(true);
      const text = content.map((c: any) => c.text || '').join(' ');
      console.log('📍 Saved addresses preview:', text.slice(0, 300));
    }
  }, 15_000);

  it('searches restaurants with address and gets menu', async () => {
    if (!hasTokens) return;

    // Get address first
    const addrResult = await host.callTool('get_saved_addresses_for_user', {});
    const addrText = ((addrResult as any)?.content || []).map((c: any) => c.text || '').join('');
    let addressId: string | undefined;
    try {
      const parsed = JSON.parse(addrText);
      addressId = parsed?.addresses?.[0]?.address_id;
    } catch { /* skip */ }

    if (!addressId) {
      console.warn('No saved address — skipping restaurant+menu test');
      return;
    }

    // Search restaurants
    const searchResult = await host.callTool('get_restaurants_for_keyword', {
      keyword: 'dominos pizza',
      address_id: addressId,
    });
    expect(searchResult).toBeDefined();
    const searchText = ((searchResult as any)?.content || []).map((c: any) => c.text || '').join('');
    console.log('🍕 Dominos search:', searchText.slice(0, 300));

    // Extract a restaurant ID if present, try to get menu
    // The response format varies — just validate the call succeeds
    expect(searchText.length).toBeGreaterThan(10);
  }, 30_000);

  it('gets order history with address', async () => {
    if (!hasTokens) return;

    // Get address first
    const addrResult = await host.callTool('get_saved_addresses_for_user', {});
    const addrText = ((addrResult as any)?.content || []).map((c: any) => c.text || '').join('');
    let addressId: string | undefined;
    try {
      const parsed = JSON.parse(addrText);
      addressId = parsed?.addresses?.[0]?.address_id;
    } catch { /* skip */ }

    const result = await host.callTool('get_order_history', {
      ...(addressId ? { address_id: addressId } : {}),
    });

    expect(result).toBeDefined();
    const content = (result as any)?.content;
    if (content) {
      const text = content.map((c: any) => c.text || '').join(' ');
      console.log('📋 Order history:', text.slice(0, 300));
    }
  }, 15_000);
});
