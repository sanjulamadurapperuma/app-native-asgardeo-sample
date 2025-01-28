import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { nextUrl } = req;

    // Check if the request is already for the callback URL
    if (nextUrl.pathname === '/api/auth/callback/google') {
        return NextResponse.next();
    }

    if (nextUrl.searchParams.get('code') && nextUrl.searchParams.get('state')) {
        // Call NextAuth to handle the login process
        const code = nextUrl.searchParams.get('code');
        const state = nextUrl.searchParams.get('state');
        console.log("request nextUrl: " + nextUrl);
        console.log("request query code: " + code);
        console.log("request query state: " + state);

        // Set the code and state into cookies
        const response = NextResponse.next();
        response.cookies.set('auth-code', code || '', { httpOnly: true, path: '/' });
        response.cookies.set('auth-state', state || '', { httpOnly: true, path: '/' });

        console.log("response url: " + response.url);

        // Construct the callback URL
        const callbackUrl = new URL(nextUrl.pathname, req.url);
        callbackUrl.searchParams.set('code', code || '');
        callbackUrl.searchParams.set('state', state || '');

        // Redirect to the callback URL
        console.log("Redirecting to callback URL: " + callbackUrl);
        return NextResponse.redirect(callbackUrl);
    }

    return NextResponse.next();
}


export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};