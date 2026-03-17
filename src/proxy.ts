import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/invite',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/org',
  '/api/auth/activate',
];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const session = getSessionFromRequest(req);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Force password change / account activation
  if (session.mustChangePassword) {
    const allowed = ['/change-password', '/api/auth/change-password', '/api/auth/logout'];
    if (!allowed.some(p => pathname.startsWith(p))) {
      const url = req.nextUrl.clone();
      url.pathname = '/change-password';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
