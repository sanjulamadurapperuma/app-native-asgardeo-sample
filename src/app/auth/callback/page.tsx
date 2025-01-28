"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            signIn("credentials", {
                redirect: false,
                code
            }).then((result) => {
                if (result?.error) {
                    console.log("Invalid username or password");
                    // Handle error (e.g., show a message to the user)
                } else {
                    // Redirect to the home page on successful login
                    router.push("/");
                }
            }).catch((error) => {
                console.error("Sign-in error:", error);
                // Handle error (e.g., show a message to the user)
            });
        }
    }, [router]);

    return (
        <div>
            <h1>Processing authentication...</h1>
        </div>
    );
};

export default AuthCallback;