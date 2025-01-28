"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignOutButton: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Log the user out of NextAuth and redirect them to the Asgardeo logout API
      await signOut({ redirect: false });

      // Redirect the user to the custom signout route where we handle Asgardeo logout
      router.push("/api/auth/signout");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
      <div>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Sign Out
        </button>
      </div>
  );
};

export default SignOutButton;
