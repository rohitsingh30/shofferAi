export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/api/agent/:path*', '/api/profile/:path*', '/api/credentials/:path*'],
};
