import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    console.log("google.tsx request: " + req.nextUrl.searchParams);

    // Read the code and state from query parameters
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    console.log("google.tsx: code=" + code + " state=" + state);

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    // Read the flowId from cookies
    const flowId = req.cookies.get('flowId');
    console.log("google.tsx: flowId=" + flowId?.value);
    if (!flowId) {
        return NextResponse.json({ error: 'Flow ID is missing.' }, { status: 400 });
    }

   const authnUrl = `https://api.asgardeo.io/t/${process.env.NEXT_PUBLIC_ORGANIZATION_NAME}/oauth2/authn`;
    const requestBody = {
        flowId: flowId?.value,
        selectedAuthenticator: {
            authenticatorId: process.env.NEXT_PUBLIC_GOOGLE_AUTHENTICATOR_ID,
            params: {
                code,
                state,
            },
        },
    };
    try {
        // Make a POST request to the Asgardeo API with the code and state
        const authnResponse = await fetch(authnUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const authnResponseData = await authnResponse.json();
        console.debug("google.tsx: " + authnResponseData);

        if (authnResponseData.flowStatus === "SUCCESS_COMPLETED") {
            // Redirect to a client-side route with the necessary data
            const redirectUrl = new URL('/auth/callback', req.url);
            redirectUrl.searchParams.set('code', authnResponseData.authData.code);
            return NextResponse.redirect(redirectUrl.toString());
        } else if (authnResponseData.flowStatus === "INCOMPLETE" && authnResponseData.nextStep.authenticators[0].authenticatorId === process.env.NEXT_PUBLIC_EMAIL_OTP_AUTHENTICATOR_ID) {
            // Redirect to a client-side route with the necessary data
            const redirectUrl = new URL('/auth/emailotp', req.url);
            redirectUrl.searchParams.set('isGoogleAuthenticator', 'true');
            return NextResponse.redirect(redirectUrl.toString());
        } else {
            // Clear the cookies if authentication fails
            const response = NextResponse.json({ error: 'Authentication failed.' }, { status: 400 });
            response.cookies.set('auth-code', '', { maxAge: 0, path: '/' });
            response.cookies.set('auth-state', '', { maxAge: 0, path: '/' });
            response.cookies.set('flowId', '', { maxAge: 0, path: '/' });
            return response;
        }
    } catch (error) {
        console.error("Google sign-in failed:", error);
        // Clear the cookies if an error occurs
        const response = NextResponse.json({ error: 'An error occurred during Google sign-in.' }, { status: 500 });
        response.cookies.set('auth-code', '', { maxAge: 0, path: '/' });
        response.cookies.set('auth-state', '', { maxAge: 0, path: '/' });
        response.cookies.set('flowId', '', { maxAge: 0, path: '/' });
        return response;
    }
}
