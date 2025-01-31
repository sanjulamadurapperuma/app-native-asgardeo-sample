import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { basicAuthentication } from '../utils/authUtils';
import { signIn } from 'next-auth/react';
import SubmitButton from './SubmitButton';

interface UsernamePasswordFormProps {
    flowId: string;
    setError: (error: string) => void;
}

const UsernamePasswordForm: React.FC<UsernamePasswordFormProps> = ({ flowId, setError }) => {
    
    const [credentials, setCredentials] = useState<{ email: string; password: string }>({ email: '', password: '' });
    const router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!credentials.email || !credentials.password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            // Step 2: Authenticate the user with credentials and get the authorization code
            const authnResponseData = await basicAuthentication(flowId, credentials.email, credentials.password);

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
                authnResponseData.nextStep.authenticators[0].authenticatorId === process.env.NEXT_PUBLIC_EMAIL_OTP_AUTHENTICATOR_ID &&
                authnResponseData.nextStep.messages[0].messageId === "EmailOTPSent") {
                // Redirect to Email OTP page
                router.push('/auth/emailotp');
            } else {
                setError("Authentication failed.");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setError("An error occurred during authentication.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email Address:</label>
                <input
                    type="email"
                    id="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                    autoComplete="username"
                    className='input-field'
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className='input-field'
                />
            </div>
            <div className='flex justify-center'>
                <SubmitButton label="Submit" />
            </div>
        </form>
    );
};

export default UsernamePasswordForm;