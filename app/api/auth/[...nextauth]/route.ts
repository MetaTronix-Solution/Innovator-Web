import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { LoginResponse } from "@/types/auth";

const AUTH_API = process.env.AUTH_URL as string;

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
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(`${AUTH_API}/auth/sso/google/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              google_token: account.id_token,
              access_token: account.access_token,
              email: profile?.email,
              name: profile?.name,
              picture: (profile as any)?.picture,
            }),
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorBody = await response.text();
            console.error(
              "Backend rejected Google login:",
              response.status,
              errorBody,
            );
            return false;
          }

          const data: LoginResponse = await response.json();

          user.accessToken = data.access_token;
          user.refreshToken = data.refresh_token;
          user.tokenType = data.token_type;
          user.expiresIn = data.expires_in;
          user.userData = data.user;

          return true;
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.error("Backend timed out.");
          } else {
            console.error("Google SSO error:", error);
          }
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // user is only defined on first sign-in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tokenType = user.tokenType;
        token.expiresIn = user.expiresIn;
        token.userData = user.userData;
        token.accessTokenExpiry = Date.now() + (user.expiresIn ?? 0) * 1000;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userData) session.user = token.userData as any;
      if (token.accessToken) session.accessToken = token.accessToken;
      if (token.tokenType) session.tokenType = token.tokenType;
      if (token.error) session.error = token.error;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
