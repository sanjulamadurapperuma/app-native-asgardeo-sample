"use client"

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import SubmitButton from '../../../components/SubmitButton';
import FormContainer from '../../../components/FormContainer';

const TOTP = () => {
    const [totp, setTotp] = useState<string>('');
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

        const organization_name = process.env.NEXT_PUBLIC_ORGANIZATION_NAME;
        const totpAuthenticatorId = process.env.NEXT_PUBLIC_TOTP_AUTHENTICATOR_ID;

        if (!totp) {
            setError('Please enter your TOTP value.');
            return;
        }

        const authnUrl = `https://api.asgardeo.io/t/${organization_name}/oauth2/authn`;
        const requestBody = {
            "flowId": flowId,
            "selectedAuthenticator": {
                "authenticatorId": totpAuthenticatorId,
                params: {
                    token: totp
                },
            },
        };

        // Step 2: Authenticate the user with TOTP authentication step.
        const authnResponse = await fetch(authnUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const authnResponseData = await authnResponse.json();

        console.log(authnResponseData);

        if (authnResponseData.flowStatus === "SUCCESS_COMPLETED") {

            const code = authnResponseData.authData.code;
            // Call NextAuth to handle the login process
            const result = await signIn("credentials", {
                redirect: false,
                code
            });

            if (result?.error) {
                setError("Invalid TOTP token");
            } else {
                // Redirect to dashboard on successful login
                router.push("/");
            }
        }
    };

    return (
        <FormContainer>
            <h2 className='flex justify-center'>Enter TOTP</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="totp">TOTP Value:</label>
                    <input
                        type="text"
                        id="totp"
                        value={totp}
                        onChange={(e) => setTotp(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0', color: 'black' }}
                    />
                </div>
                <div className='flex justify-center'>
                    <SubmitButton label="Submit" />
                </div>
            </form>
        </FormContainer>
    );
};

export default TOTP;