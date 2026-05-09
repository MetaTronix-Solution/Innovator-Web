import type { DefaultSession } from "next-auth";
import type { BackendUser } from "@/types/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    tokenType?: string;
    error?: string;
    user: BackendUser;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    userData?: BackendUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    userData?: BackendUser;
    accessTokenExpiry?: number;
    error?: string;
  }
}
