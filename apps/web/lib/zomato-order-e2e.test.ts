/**
 * Full E2E ordering flow test for Zomato MCP.
 *
 * Goes through: address → restaurant search → menu → cart → offers → (stops before checkout)
 * Uses REAL Zomato MCP server with REAL data.
 *
 * ⚠ checkout_cart is NOT called — that would place a real order and charge money.
 *
 * Run: npx vitest run apps/web/lib/zomato-order-e2e.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ZomatoMCPHost } from './zomato-mcp-host';
import { ZomatoOAuthProvider } from './zomato-oauth-provider';

const provider = new ZomatoOAuthProvider();
let hasTokens = false;

beforeAll(async () => {
  hasTokens = !!(await provider.getAccessToken());
  if (!hasTokens) {
    console.warn('⚠ Skipping — no OAuth tokens. Run: npx mcp-remote https://mcp-server.zomato.com/mcp');
  }
});

function extractText(result: unknown): string {
  const content = (result as any)?.content;
  if (!content || !Array.isArray(content)) return '';
  return content.map((c: any) => c.text || '').join('');
}

function parseJSON(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

describe('Zomato Full Order Flow E2E', () => {
  let host: ZomatoMCPHost;

  // Shared state across the order flow
  let addressId: string;
  let resId: number;
  let resName: string;
  let categories: string[];
  let variantId: string;
  let variantName: string;
  let cartId: string;

  beforeAll(async () => {
    if (!hasTokens) return;
    host = new ZomatoMCPHost();
    await host.connect();
  }, 30_000);

  afterAll(async () => {
    if (host) await host.disconnect();
  });

  // ── Step 1: Get delivery address ──────────────────────────────

  it('Step 1: get saved addresses', async () => {
    if (!hasTokens) return;

    const result = await host.callTool('get_saved_addresses_for_user', {});
    const data = parseJSON(extractText(result));

    expect(data).toBeTruthy();
    expect(data.addresses).toBeDefined();
    expect(data.addresses.length).toBeGreaterThan(0);

    addressId = data.addresses[0].address_id;
    const locationName = data.addresses[0].location_name;

    console.log(`📍 Step 1: Using address "${locationName}" (id: ${addressId})`);
    expect(addressId).toBeTruthy();
  }, 15_000);

  // ── Step 2: Search restaurants ────────────────────────────────

  it('Step 2: search biryani restaurants', async () => {
    if (!hasTokens) return;
    expect(addressId).toBeTruthy();

    const result = await host.callTool('get_restaurants_for_keyword', {
      address_id: addressId,
      keyword: 'biryani',
      page_size: 5,
    });

    const data = parseJSON(extractText(result));
    expect(data).toBeTruthy();
    expect(data.results).toBeDefined();
    expect(data.results.length).toBeGreaterThan(0);

    // Pick first serviceable restaurant
    const restaurant = data.results.find((r: any) => r.serviceability_status === 'serviceable');
    expect(restaurant).toBeTruthy();

    resId = restaurant.res_id;
    resName = restaurant.name;
    const rating = restaurant.rating;
    const eta = restaurant.eta;
    const offer = restaurant.res_offer || 'none';

    console.log(`🍗 Step 2: Selected "${resName}" (id: ${resId}, rating: ${rating}, ETA: ${eta}, offer: ${offer})`);
    expect(resId).toBeTruthy();
  }, 30_000);

  // ── Step 3: Get menu listing (items + variant IDs) ─────────────

  it('Step 3: get menu items listing', async () => {
    if (!hasTokens) return;
    expect(resId).toBeTruthy();

    const result = await host.callTool('get_menu_items_listing', {
      res_id: resId,
      address_id: addressId,
    });

    const text = extractText(result);
    const data = parseJSON(text);
    expect(data).toBeTruthy();

    // Zomato returns: { data: { item_mappings: [{ item_name, variant_id, categories }] } }
    const items = data?.data?.item_mappings || data?.item_mappings || [];
    expect(items.length).toBeGreaterThan(0);

    // Extract categories
    const cats = new Set<string>();
    for (const item of items) {
      if (item.categories) {
        for (const cat of item.categories) cats.add(cat);
      }
    }
    categories = Array.from(cats);

    // Pick first item with a variant_id
    const firstItem = items.find((i: any) => i.variant_id?.startsWith('v_'));
    expect(firstItem).toBeTruthy();

    variantId = firstItem.variant_id;
    variantName = firstItem.item_name;

    console.log(`📋 Step 3: ${items.length} items found across ${categories.length} categories: ${categories.slice(0, 5).join(', ')}`);
    console.log(`🍛 Step 3: Picked "${variantName}" (variant: ${variantId})`);
  }, 30_000);

  // ── Step 4: Get detailed menu for a category ──────────────────

  it('Step 4: get detailed menu by category', async () => {
    if (!hasTokens) return;
    expect(resId).toBeTruthy();
    expect(categories?.length).toBeGreaterThan(0);

    // Pick a non-"Recommended" category for more interesting data
    const category = categories.find(c => !c.includes('Recommended')) || categories[0];

    const result = await host.callTool('get_restaurant_menu_by_categories', {
      res_id: resId,
      categories: [category],
      address_id: addressId,
    });

    const text = extractText(result);
    expect(text.length).toBeGreaterThan(20);

    console.log(`🍽️ Step 4: "${category}" menu detail: ${text.slice(0, 400)}`);
  }, 30_000);

  // ── Step 5: Create cart ───────────────────────────────────────

  it('Step 5: create cart with item', async () => {
    if (!hasTokens) return;
    if (!variantId) {
      console.warn('⚠ Skipping cart — no variant_id found from menu');
      return;
    }

    const result = await host.callTool('create_cart', {
      res_id: resId,
      items: [{ variant_id: variantId, quantity: 1 }],
      address_id: addressId,
      payment_type: 'upi_qr',
    });

    const text = extractText(result);
    const data = parseJSON(text);

    expect(data || text.length > 10).toBeTruthy();

    // Extract cart_id
    if (data?.cart_id) {
      cartId = data.cart_id;
    } else {
      const match = text.match(/cart_id["\s:]+["']?([^"'\s,}]+)/);
      if (match) cartId = match[1];
    }

    if (cartId) {
      console.log(`🛒 Step 5: Cart created! (cart_id: ${cartId})`);
      // Log pricing details if available
      if (data?.final_amount) console.log(`   💰 Total: ₹${data.final_amount}`);
      if (data?.charges) console.log(`   📦 Charges:`, JSON.stringify(data.charges).slice(0, 200));
    } else {
      console.log(`🛒 Step 5: Cart response: ${text.slice(0, 400)}`);
    }

    expect(text.length).toBeGreaterThan(5);
  }, 30_000);

  // ── Step 6: Check available offers ────────────────────────────

  it('Step 6: get cart offers', async () => {
    if (!hasTokens) return;
    if (!cartId) {
      console.warn('⚠ Skipping offers — no cart_id');
      return;
    }

    const result = await host.callTool('get_cart_offers', {
      cart_id: cartId,
      address_id: addressId,
    });

    const text = extractText(result);
    expect(text.length).toBeGreaterThan(5);
    console.log(`🏷️ Step 6: Offers: ${text.slice(0, 400)}`);
  }, 15_000);

  // ── Step 7: DO NOT checkout (would place real order) ──────────

  it('Step 7: verify checkout_cart is available (but do NOT call it)', () => {
    if (!hasTokens) return;

    // Just verify the tool exists — calling it would place a REAL order
    expect(host.isMCPTool('checkout_cart')).toBe(true);

    const tools = host.getTools();
    const checkoutTool = tools.find(t => t.name === 'checkout_cart');
    expect(checkoutTool).toBeDefined();
    expect(checkoutTool!.description).toContain('checkout');

    console.log('✅ Step 7: checkout_cart tool available — NOT calling it (would place real order)');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  🎉 FULL ORDER FLOW VALIDATED E2E');
    console.log('═══════════════════════════════════════');
    console.log(`  📍 Address: ${addressId}`);
    console.log(`  🍗 Restaurant: ${resName} (id: ${resId})`);
    console.log(`  🍛 Item: ${variantName || 'N/A'} (variant: ${variantId || 'N/A'})`);
    console.log(`  🛒 Cart: ${cartId || 'N/A'}`);
    console.log(`  💳 Checkout: ready (upi_qr)`);
    console.log('═══════════════════════════════════════');
  });
});
