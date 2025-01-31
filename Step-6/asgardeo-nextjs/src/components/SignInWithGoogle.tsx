import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initRequest, selectAuthenticator } from '../utils/authUtils';
import { setFlowIdCookie } from '../utils/cookieUtils';

const SignInWithGoogle: React.FC = () => {
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
        if (!redirectUri) {
            setError("Redirect URI is missing.");
            return;
        }

        try {
            const authorizeResponseData = await initRequest(redirectUri);
            const flowId = authorizeResponseData.flowId;
            console.log("Google sign-in flowId: " + flowId);
            sessionStorage.setItem('flowId', flowId);
            try {
                // Set the flowId into a cookie
                await setFlowIdCookie(flowId);
            } catch (error) {
                console.error('Error setting flowId cookie:', error);
            }
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
        <div className='flex justify-center'>
            {error && <p className='error'>{error}</p>}
            <button onClick={handleGoogleSignIn} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                Sign in with Google
            </button>
        </div>
    );
};

export default SignInWithGoogle;