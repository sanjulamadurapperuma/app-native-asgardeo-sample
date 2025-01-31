"use client"

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { authenticateWithEmailOtp } from '../../../utils/authUtils';
import SubmitButton from '../../../components/SubmitButton';
import FormContainer from '../../../components/FormContainer';

const EmailOTP = () => {
    const searchParams = useSearchParams();
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const [flowId, setFlowId] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve flowId from sessionStorage
        const storedFlowId = sessionStorage.getItem('flowId');
        setFlowId(storedFlowId);

        // Set isGoogleAuthenticator in sessionStorage
        const isGoogleAuthenticator = searchParams.get('isGoogleAuthenticator') === 'true';
        sessionStorage.setItem('isGoogleAuthenticator', isGoogleAuthenticator.toString());
    }, [searchParams]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!emailOtp) {
            setError('Please enter your Email OTP value.');
            return;
        }

        if (!flowId) {
            setError('Flow ID is missing.');
            return;
        }

        const authnResponseData = await authenticateWithEmailOtp(flowId, emailOtp);

        console.log(authnResponseData);

        if (authnResponseData.flowStatus === "SUCCESS_COMPLETED") {

            const isGoogleAuthenticator = sessionStorage.getItem('isGoogleAuthenticator');
            console.log("isGoogleAuthenticator: " + isGoogleAuthenticator);

            const code = authnResponseData.authData.code;
            // Call NextAuth to handle the login process
            const result = await signIn("credentials", {
                redirect: false,
                code,
                isGoogleAuthenticator: isGoogleAuthenticator
            });

            if (result?.error) {
                setError("Invalid Email OTP token");
            } else {
                // Redirect to dashboard on successful login
                router.push("/");
            }
        }
    };

    return (
        <FormContainer>
            <h2 className='flex justify-center'>Enter Email OTP</h2>
            {error && <p className='error'>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="emailOtp">Email OTP Value:</label>
                    <input
                        type="text"
                        id="emailOtp"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        required
                        className='input-field'
                    />
                </div>
                <div className='flex justify-center'>
                    <SubmitButton label="Submit" />
                </div>
            </form>
        </FormContainer>
    );
};

export default EmailOTP;