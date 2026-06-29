import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/data/heart.json') {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/data/heart.json'],
};