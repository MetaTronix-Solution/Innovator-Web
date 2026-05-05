import { User } from "./auth";

declare module "next-auth" {
  interface Session {
    user: User;
    accessToken: string;
    tokenType: string;
    error?: string;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
    accessTokenExpiry: number;
    error?: string;
  }
}
