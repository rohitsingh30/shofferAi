/**
 * POST /api/cart/instant-add
 *
 * Side-channel cart add for the multi_store_carousel widget.
 *
 * Reasoning: in cross-store comparison, every per-card ADD tap should
 * commit immediately and the carousel should remain visible (the user is
 * still browsing). The agent's `ask_user(multi_store_carousel)` stays
 * pending — only the user's next typed message dismisses it.
 *
 * To actually add the item to the merchant's cart without spinning a full
 * agent loop per ADD, we look up the task's live BrowserOpsHost from the
 * registry and dispatch `<store>.add_to_cart` directly through it. Because
 * the host's session for that store may already be warm from the agent's
 * earlier `<store>.search`, this is a single MCP round-trip.
 *
 * Body shape:
 *   { taskId, store: "Zepto"|"BigBasket"|..., productId, qty? }
 *
 * Returns:
 *   { ok: true, store, productId, qty }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { opsHostByTask } from '@/lib/singletons';
import { getAuthUser } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

/** Display store name → MCP tool prefix. Returns null for unsupported stores. */
function siteForStoreName(store: string): string | null {
  const s = store.trim().toLowerCase();
  if (s === 'bigbasket') return 'bigbasket';
  if (s === 'zepto') return 'zepto';
  // Blinkit, Swiggy Instamart, DMart don't yet have add_to_cart MCP tools
  // — return null so we surface a clean error instead of a runner crash.
  return null;
}

/** Pretty error for stores where we know add_to_cart is unsupported in v1. */
function unsupportedReason(store: string): string | null {
  const s = store.trim().toLowerCase();
  if (s === 'blinkit') {
    return "Blinkit ADD isn't wired up yet in v1 — please add the item via the Blinkit app, or compare on BigBasket / Zepto instead.";
  }
  if (s === 'swiggy instamart' || s === 'swiggy_instamart' || s === 'instamart') {
    return "Instamart ADD isn't wired up yet in v1 — please add the item via the Swiggy app, or compare on BigBasket / Zepto instead.";
  }
  if (s === 'dmart') {
    return "DMart ADD isn't supported in v1 — please use the DMart Ready app.";
  }
  return null;
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    taskId?: string;
    store?: string;
    productId?: string;
    productUrl?: string;
    qty?: number;
  };
  const { taskId, store, productId, productUrl } = body;
  const qty = Math.max(1, Math.min(99, Number(body.qty) || 1));

  console.log(
    '[instant-add] received taskId=%s store=%s productId=%s productUrl=%s qty=%d',
    taskId, store, productId, productUrl ?? '<missing>', qty,
  );

  if (!taskId || !store || !productId) {
    return NextResponse.json(
      { error: 'taskId, store, productId required' },
      { status: 400 },
    );
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: authUser.userId },
    select: { id: true },
  });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const site = siteForStoreName(store);
  if (!site) {
    const reason = unsupportedReason(store);
    return NextResponse.json(
      { error: reason ?? `Unsupported store: ${store}` },
      { status: 400 },
    );
  }

  const opsHost = opsHostByTask.get(taskId);
  if (!opsHost) {
    // The task's agent loop has already finished. Return 200 with ok:false
    // so the browser doesn't log a "Failed to load resource: 410" console
    // error. The frontend treats !ok as a soft warning and rolls back the
    // optimistic local cart add.
    console.log('[instant-add] taskId=%s no live host (agent finished) — soft-fail', taskId);
    return NextResponse.json(
      {
        ok: false,
        reason: 'task_finished',
        message: "That cart session ended. Send a new message to keep shopping.",
      },
      { status: 200 },
    );
  }

  const toolName = `${site}.add_to_cart`;
  try {
    // BrowserOpsHost.callTool wraps args in `{input: ...}`. The runner's
    // add_to_cart accepts {product_id, quantity} for bigbasket; Zepto
    // additionally requires product_url (the slug from search). Pass it
    // through whenever we have it.
    const args: Record<string, unknown> = {
      product_id: productId,
      quantity: qty,
    };
    if (productUrl) args.product_url = productUrl;
    const result = await opsHost.callTool(toolName, args);
    console.log(
      '[instant-add] taskId=%s store=%s product=%s qty=%d → ok',
      taskId,
      store,
      productId,
      qty,
    );
    return NextResponse.json({ ok: true, store, productId, qty, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      '[instant-add] taskId=%s store=%s product=%s failed: %s',
      taskId,
      store,
      productId,
      msg,
    );
    return NextResponse.json(
      { error: `Couldn't add to ${store}: ${msg}` },
      { status: 502 },
    );
  }
}
