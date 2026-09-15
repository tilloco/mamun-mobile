import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const isLoginPage = req.nextUrl.pathname === '/login';

  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// /api/* va statik fayllardan tashqari barcha sahifalarga qo'llanadi
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
