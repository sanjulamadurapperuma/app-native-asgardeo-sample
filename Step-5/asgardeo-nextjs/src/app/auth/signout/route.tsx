import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Clear the session cookies
    const res = NextResponse.redirect(new URL('/', req.url));
    res.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
    res.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/' });
    return res;
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
}