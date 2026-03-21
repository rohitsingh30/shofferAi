import { NextResponse } from 'next/server';
import { remoteMcpHost } from '@/lib/singletons';

/**
 * POST /api/admin/release-relay
 *
 * Closes the laptop WebSocket connection so the laptop reconnects to the
 * next Cloud Run instance. Called by cloudbuild.yaml BEFORE deploying a
 * new revision, preventing the "laptop stuck on old instance" problem.
 *
 * Auth: RELAY_AUTH_TOKEN (same token the laptop uses to connect).
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.RELAY_AUTH_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wasConnected = remoteMcpHost.isConnected();

  try {
    if (wasConnected && typeof (remoteMcpHost as { disconnect?: () => Promise<void> }).disconnect === 'function') {
      await (remoteMcpHost as { disconnect: () => Promise<void> }).disconnect();
    }
  } catch (err) {
    console.error('[release-relay] disconnect error:', err);
  }

  console.log('[release-relay] Relay released (wasConnected=%s)', wasConnected);
  return NextResponse.json({
    ok: true,
    wasConnected,
    message: wasConnected
      ? 'Relay disconnected — laptop will reconnect to next instance'
      : 'Relay was not connected',
  });
}
