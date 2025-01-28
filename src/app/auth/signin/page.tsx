"use client"

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { setFlowIdCookie } from '../../../utils/cookieUtils';
import { selectAuthenticator, basicAuthentication, initRequest } from '../../../utils/authUtils';
import SubmitButton from '../../../components/SubmitButton';
import FormContainer from '../../../components/FormContainer';

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const [authenticators, setAuthenticators] = useState<any[]>([]);
    const [hasUsernamePassword, setHasUsernamePassword] = useState<boolean>(false);

    useEffect(() => {
        // Code logic to be invoked on page load
        const fetchAuthenticators = async () => {
            try {
                // Step 1: Get the authorization code from the initial OAuth2 authorization request
                const authorizeResponseData = await initRequest();

                console.log(authorizeResponseData);

                if (authorizeResponseData.flowStatus === "INCOMPLETE") {
                    // Store flowId in session storage to avoid showing it to the user
                    const flowId = authorizeResponseData.flowId;
                    sessionStorage.setItem('flowId', flowId);
                    // Set authenticators to state
                    setAuthenticators(authorizeResponseData.nextStep.authenticators);
                    // Check if "Username & Password" authenticator is present
                    const hasUsernamePasswordAuth = authorizeResponseData.nextStep.authenticators.some((auth: any) => auth.authenticatorId === "QmFzaWNBdXRoZW50aWNhdG9yOkxPQ0FM");
                    setHasUsernamePassword(hasUsernamePasswordAuth);
                }
            } catch (error) {
                console.error("Authorization failed:", error);
                setError("An error occurred during authorization.");
            }
        };

        fetchAuthenticators();
    }, []);


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        const flowId = sessionStorage.getItem('flowId');
        if (!flowId) {
            setError("Flow ID is missing.");
            return;
        }

        const authenticatorId = authenticators.find(auth => auth.authenticator === "Username & Password")?.authenticatorId;
        if (!authenticatorId) {
            setError("Authenticator ID is missing.");
            return;
        }

        try {
            // Step 2: Authenticate the user with credentials and get the authorization code
            const authnResponseData = await basicAuthentication(flowId, email, password);

            if (authnResponseData.flowStatus === "SUCCESS_COMPLETED") {

                const code = authnResponseData.authData.code;
                // Call NextAuth to handle the login process
                const result = await signIn("credentials", {
                    redirect: false,
                    code
                });

                if (result?.error) {
                    setError("Invalid username or password");
                } else {
                    // Redirect to dashboard on successful login
                    router.push('/');
                }

            } else if (authnResponseData.flowStatus === "INCOMPLETE" &&
                authnResponseData.nextStep.authenticators[0].authenticatorId === process.env.NEXT_PUBLIC_TOTP_AUTHENTICATOR_ID) {
                // Redirect to TOTP page
                router.push('/auth/totp');
            } else if (authnResponseData.flowStatus === "INCOMPLETE" &&
                authnResponseData.nextStep.authenticators[0].authenticatorId === process.env.NEXT_PUBLIC_EMAIL_OTP_AUTHENTICATOR_ID &&
                authnResponseData.nextStep.messages[0].messageId === "EmailOTPSent") {
                // Redirect to Email OTP page
                router.push('/auth/emailotp');
            }
        } catch (error) {
            console.error("Username & Password Authorization failed:", error);
            setError("An error occurred during authentication.");
        }
    };

    const handleGoogleSignIn = async () => {
        const flowId = sessionStorage.getItem('flowId');
        if (!flowId) {
            setError("Flow ID is missing.");
            return;
        }

        try {
            // Set the flowId into a cookie
            await setFlowIdCookie(flowId);
        } catch (error) {
            console.error('Error setting flowId cookie:', error);
        }

        try {
            const googleAuthenticatorId = process.env.NEXT_PUBLIC_GOOGLE_AUTHENTICATOR_ID;
            // Step 2: Make a POST request to the Asgardeo API
            if (!googleAuthenticatorId) {
                setError("A problem was encountered with the application configuration for Google sign-in.");
                return;
            }
            const authnResponseData = await selectAuthenticator(flowId, googleAuthenticatorId);

            console.log("Selected authenticator response: " + authnResponseData);

            if (authnResponseData.flowStatus === "INCOMPLETE" && authnResponseData.nextStep.authenticators[0].metadata.promptType === "REDIRECTION_PROMPT") {
                const redirectUrl = authnResponseData.nextStep.authenticators[0].metadata.additionalData.redirectUrl;
                // Step 3: Redirect the user to the Google authorization URL
                window.location.href = redirectUrl;
            } else {
                setError("Google authentication failed.");
            }
        } catch (error) {
            console.error("Google sign-in failed:", error);
            setError("An error occurred during Google sign-in.");
        }
    };

    return (
        <FormContainer>
            <h2 className='flex justify-center'>Sign In</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {hasUsernamePassword ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            style={{ width: '100%', padding: '8px', margin: '10px 0', color: 'black' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete='current-password'
                            style={{ width: '100%', padding: '8px', margin: '10px 0', color: 'black' }}
                        />
                    </div>
                    <div className='flex justify-center'>
                        <SubmitButton label="Submit" />
                    </div>
                </form>
            ) : (
                <p style={{ color: 'white' }}>Loading...</p>
            )}
            <br />
            {authenticators.map(authenticator => (
                authenticator.authenticatorId === process.env.NEXT_PUBLIC_GOOGLE_AUTHENTICATOR_ID ? (
                    <div className='flex justify-center' key={authenticator.authenticatorId}>
                        <button key={authenticator.authenticatorId} onClick={handleGoogleSignIn} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                            Sign in with Google
                        </button>
                    </div>
                ) : null
            ))}
        </FormContainer>
    );
};

export default Login;