import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected paths
  const protectedPaths = ['/', '/memories', '/voices', '/valentine'];
  const isProtected = path === '/' || protectedPaths.some(p => path.startsWith(p)) || path.startsWith('/moods');

  // Check for the unlock cookie
  const unlocked = request.cookies.get('valentine_unlocked')?.value === '1';

  // 1. If trying to access protected route without cookie -> Redirect to /puzzle
  if (isProtected && !unlocked) {
    return NextResponse.redirect(new URL('/puzzle', request.url));
  }

  // 2. If trying to access /puzzle BUT already unlocked -> Redirect to /
  // if (path === '/puzzle' && unlocked) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  // Allow all other requests (including /admin, static files, api)
  return NextResponse.next();
}

// Configure matcher to run on relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder content (if any specific patterns needed)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
