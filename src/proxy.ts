// ─────────────────────────────────────────────────────────────
// Proxy (Next 16 middleware) — auth gate only.
// Cheap cookie-presence check, no DB calls here; real session
// validation happens in route handlers / server layouts.
// ─────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const AUTH_PAGES = ['/login', '/register'];
const PROTECTED_PAGES = ['/account', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = !!getSessionCookie(request);

  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtected = PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && isProtected) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpeg|jpg|png|svg|ico|webp)).*)',
  ],
};
