import { NextRequest, NextResponse } from 'next/server';
import { track } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, source, line, column, stack, type } = body as {
      message?: string;
      source?: string;
      line?: number;
      column?: number;
      stack?: string;
      type?: string; // 'error' | 'unhandledrejection'
    };

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    track({
      event: 'client_error',
      category: 'error',
      success: false,
      metadata: {
        message: String(message).slice(0, 500),
        source: source?.slice(0, 200),
        line,
        column,
        stack: stack?.slice(0, 1000),
        type: type || 'error',
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
}
