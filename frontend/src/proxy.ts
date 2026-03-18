import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side route protection.
 *
 * Blocks unauthenticated users from /admin, /delivery, /account, /orders,
 * and /checkout BEFORE the page renders (no flash of unauthorized content).
 *
 * Role-based checks (admin vs delivery vs customer) stay in layout guards
 * because the JWT payload isn't safely decodable here without the secret.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/delivery/:path*',
    '/account',
    '/orders/:path*',
    '/checkout',
  ],
};
