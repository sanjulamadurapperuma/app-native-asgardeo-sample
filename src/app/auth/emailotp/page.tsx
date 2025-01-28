"use client"

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { authenticateWithEmailOtp } from '../../../utils/authUtils';

const EmailOTP = () => {
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const [flowId, setFlowId] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve flowId from sessionStorage
        const storedFlowId = sessionStorage.getItem('flowId');
        setFlowId(storedFlowId);
    }, []);

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

            const code = authnResponseData.authData.code;
            // Call NextAuth to handle the login process
            const result = await signIn("credentials", {
                redirect: false,
                code
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
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 className='flex justify-center'>Enter Email OTP</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="emailOtp">Email OTP Value:</label>
                    <input
                        type="text"
                        id="emailOtp"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0', color: 'black' }}
                    />
                </div>
                <div className='flex justify-center'>
                    <button
                        type="submit"
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmailOTP;