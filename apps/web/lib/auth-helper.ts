import { auth } from '@/auth';
import { jwtVerify } from 'jose';

export interface AuthUser {
  userId: string;
  name?: string;
  email?: string;
}

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || '');

/**
 * Get authenticated user from either NextAuth session (web cookies)
 * or Bearer token (mobile JWT). Returns null if unauthenticated.
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  // 1. Try NextAuth session (web — cookie-based)
  const session = await auth();
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      name: session.user.name || undefined,
      email: session.user.email || undefined,
    };
  }

  // 2. Try Bearer token (mobile)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.id && typeof payload.id === 'string') {
        return {
          userId: payload.id,
          name: (payload.name as string) || undefined,
          email: (payload.email as string) || undefined,
        };
      }
    } catch (err) {
      console.warn('[auth] Bearer token invalid:', err instanceof Error ? err.message : err);
    }
  }

  console.log('[auth] No valid session or token found');
  return null;
}
