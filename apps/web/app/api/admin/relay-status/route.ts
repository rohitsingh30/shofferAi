import { NextResponse } from 'next/server';
import { remoteMcpHost } from '@/lib/singletons';

/**
 * GET /api/admin/relay-status
 *
 * Read-only check: does the ACTIVE Cloud Run instance have a relay connected?
 * Used by relay-outbound.ts to detect phantom WS connections after deploys.
 *
 * Key insight: HTTP always routes to the ACTIVE instance, while the laptop's
 * WS may be stuck on a DRAINING old instance. If this returns connected=false
 * but the laptop's WS is open, it's a phantom — terminate and reconnect.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.RELAY_AUTH_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connected = remoteMcpHost.isConnected();

  return NextResponse.json({
    connected,
    revision: process.env.K_REVISION || 'unknown',
    timestamp: Date.now(),
  });
}
