import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['en','es','ca','fr','it'];

function isLocalePath(pathname: string) {
  return LOCALES.some(l => pathname === '/' + l || pathname.startsWith('/' + l + '/'));
}

function isAdminPath(pathname: string) {
  return LOCALES.some(l => pathname.startsWith('/' + l + '/admin'));
}

function isOpenApi(pathname: string) {
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname === '/api/auth/bootstrap') return true;
  if (pathname.startsWith('/api/invites/') ) return true; // token-based invite GET/POST
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root to /en
  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone(); url.pathname = '/en'; return NextResponse.redirect(url);
  }

  // Protect admin pages (locale-scoped)
  if (isAdminPath(pathname)) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      const parts = pathname.split('/'); const lang = parts[1] || 'en';
      url.pathname = '/' + lang + '/login';
      return NextResponse.redirect(url);
    }
  }

  // Protect API except open endpoints
  if (pathname.startsWith('/api') && !isOpenApi(pathname)) {
    const token = req.cookies.get('session')?.value;
    if (!token) return new NextResponse('Unauthorized', { status: 401 });
  }

  // Ensure locale prefix exists for app routes
  if (!isLocalePath(pathname) && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const url = req.nextUrl.clone(); url.pathname = '/en'; return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/((?!_next|.*\.).*)'] };
