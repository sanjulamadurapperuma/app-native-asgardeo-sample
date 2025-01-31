"use client";

import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";
import Link from 'next/link';

const HomeComponent: React.FC = () => {
    const { data: session } = useSession();

    return (
        <>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
                {
                    !session ? (
                        // Show Sign In Button if user is not logged in
                        <Link href="/auth/signin">
                            <button
                                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                                type="button"
                                rel="noopener noreferrer"
                            >
                                Sign In
                            </button>
                        </Link>
                    ) : (
                        // Show Sign Out Button and user's name if logged in
                        <>
                            <div className="signout-div">
                                <p className="text-center mb-3">
                                    Welcome, {`${session?.user?.given_name} ${session?.user?.family_name}`}
                                </p> <br />
                                <SignOutButton />
                            </div>
                        </>
                    )
                }
            </div>
        </>
    );
};

export default HomeComponent;
