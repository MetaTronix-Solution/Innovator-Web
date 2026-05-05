import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { LoginResponse } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Controller to prevent the 10s hang you saw in logs
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(
            `http://182.93.94.220:8010/api/auth/sso/google/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                token: account.id_token,
                access_token: account.access_token,
                email: profile?.email,
                name: profile?.name,
                picture: (profile as any)?.picture,
              }),
            },
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error("Django rejected the Google login.");
            return false;
          }

          const data: LoginResponse = await response.json();

          // Attach backend data to the user object for the JWT callback
          user.accessToken = data.access_token;
          user.refreshToken = data.refresh_token;
          user.user = data.user;
          return true;
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.error("Critical: Django backend timed out.");
          } else {
            console.error("Google OAuth Bridge Error:", error);
          }
          return false; // Triggers AccessDenied
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: user.user,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
