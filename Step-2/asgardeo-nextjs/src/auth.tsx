import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

const options: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Asgardeo OAuth2",
      credentials: {
        code: { label: "Code", type: "text" },
      },
    }),
  ],
};

export const { handlers, signIn, signOut, auth } = NextAuth(options);