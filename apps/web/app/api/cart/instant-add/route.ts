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

/** Display store name → MCP tool prefix. */
function siteForStoreName(store: string): string | null {
  const s = store.trim().toLowerCase();
  if (s === 'bigbasket') return 'bigbasket';
  if (s === 'blinkit') return 'blinkit';
  if (s === 'zepto') return 'zepto';
  if (s === 'swiggy instamart' || s === 'swiggy_instamart' || s === 'instamart') return 'swiggy_instamart';
  if (s === 'dmart') return 'dmart';
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
    qty?: number;
  };
  const { taskId, store, productId } = body;
  const qty = Math.max(1, Math.min(99, Number(body.qty) || 1));

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
    return NextResponse.json({ error: `Unsupported store: ${store}` }, { status: 400 });
  }

  const opsHost = opsHostByTask.get(taskId);
  if (!opsHost) {
    // The task's agent loop has already finished. The user can still see
    // the snapshot of the carousel but can't add new items via this path.
    return NextResponse.json(
      { error: 'Task no longer running. Send a new message to continue shopping.' },
      { status: 410 },
    );
  }

  const toolName = `${site}.add_to_cart`;
  try {
    // BrowserOpsHost.callTool wraps args in `{input: ...}`. The runner's
    // add_to_cart accepts {product_id, quantity}. We pass both `qty` and
    // `quantity` to be tolerant of any future renamings.
    const result = await opsHost.callTool(toolName, {
      product_id: productId,
      quantity: qty,
    });
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
