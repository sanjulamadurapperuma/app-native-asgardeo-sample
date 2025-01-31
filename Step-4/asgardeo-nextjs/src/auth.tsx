import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchOAuth2Token } from './utils/authUtils';
import { logoutFromAsgardeo } from './utils/logoutUtils';

const options: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Asgardeo OAuth2",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials, req) {
        let redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
        console.log("Redirect URI auth.tsx: " + redirect_uri);
        if (!redirect_uri) {
          throw new Error("Missing required environment variables");
        }
        try {
          // Step 3: Use the authorization code to get the access token and user details
          const authCode = credentials.code as string;

          const tokenData = await fetchOAuth2Token(authCode, redirect_uri as string);

          if (tokenData) {
            return {
              id: tokenData.id,
              name: tokenData.name,
              email: tokenData.email,
              given_name: tokenData.given_name,
              family_name: tokenData.family_name,
              id_token: tokenData.id_token, // Store the ID token for later use
            };
          }

          return null; // Flow incomplete or failed
        } catch (error) {
          console.error("OAuth2 Authorization failed:", error);
          return null; // Return null in case of any error
        }
      }
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT to manage the session
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    signOut: '/auth/signout',
  },
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.given_name = user.given_name;
        token.family_name = user.family_name;
        token.id_token = user.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.given_name = token.given_name as string;
        session.user.family_name = token.family_name as string;
        session.user.id_token = token.id_token as string;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      console.log("Sign-out message:", message);

      if ('token' in message && message.token?.id_token) {
        try {
          await logoutFromAsgardeo(message.token.id_token as string);
        } catch (error) {
          console.error("Error during sign-out:", error);
        }
      } else {
        console.warn('No ID token available for logout');
      }
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(options);