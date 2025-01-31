"use client"

import { useState, useEffect } from 'react';
import { initRequest } from '../../../utils/authUtils';
import FormContainer from '../../../components/FormContainer';
import UsernamePasswordForm from '../../../components/UsernamePasswordForm';
import SignInWithGoogle from '../../../components/SignInWithGoogle';

const Login = () => {
    const [error, setError] = useState<string>('');
    const [authenticators, setAuthenticators] = useState<any[]>([]);

    useEffect(() => {
        // Code logic to be invoked on page load
        const fetchAuthenticators = async () => {
            try {
                // Step 1: Get the authorization code from the initial OAuth2 authorization request
                const authorizeResponseData = await initRequest(process.env.NEXT_PUBLIC_REDIRECT_URI as string);

                console.log(authorizeResponseData);

                if (authorizeResponseData.flowStatus === "INCOMPLETE") {
                    // Store flowId in session storage to avoid showing it to the user
                    const flowId = authorizeResponseData.flowId;
                    sessionStorage.setItem('flowId', flowId);
                    // Set authenticators to state
                    setAuthenticators(authorizeResponseData.nextStep.authenticators);
                }
            } catch (error) {
                console.error("Authorization failed:", error);
                setError("An error occurred during authorization.");
            }
        };

        fetchAuthenticators();
    }, []);

    return (
        <FormContainer>
            <h2 className='flex justify-center'>Sign In</h2>
            {error && <p className='error'>{error}</p>}
            {authenticators.map(authenticator => (
                authenticator.authenticatorId === process.env.NEXT_PUBLIC_BASIC_AUTHENTICATOR_ID ? (
                        <UsernamePasswordForm flowId={sessionStorage.getItem('flowId') as string} key={authenticator.authenticatorId} setError={setError} />
                ) : null
            ))}
            <br />
            {authenticators.map(authenticator => (
                authenticator.authenticatorId === process.env.NEXT_PUBLIC_GOOGLE_AUTHENTICATOR_ID ? (
                    <SignInWithGoogle key={authenticator.authenticatorId} />
                ) : null
            ))}
        </FormContainer>
    );
};

export default Login;