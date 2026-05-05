import { cookies } from "next/headers";
import type {
  User,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  OTPResponse,
} from "@/types/auth";

const DJANGO_API = process.env.DJANGO_API_URL as string;

// Login with email/password
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${DJANGO_API}/api/auth/sso/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || "Login failed");
  }

  return await response.json();
}

// Register new user
export async function registerUser(
  userData: RegisterData,
): Promise<RegisterResponse> {
  const response = await fetch(`${DJANGO_API}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || "Registration failed");
  }

  return await response.json();
}

// Request password reset (send OTP)
export async function requestPasswordReset(
  email: string,
): Promise<OTPResponse> {
  const response = await fetch(`${DJANGO_API}/api/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || "Failed to send OTP");
  }

  return await response.json();
}

// Verify OTP
export async function verifyOTP(
  email: string,
  otp: string,
): Promise<OTPResponse> {
  const response = await fetch(`${DJANGO_API}/api/auth/verify-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || "Invalid OTP");
  }

  return await response.json();
}

// Reset password with verified OTP
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<OTPResponse> {
  const response = await fetch(`${DJANGO_API}/api/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.detail || "Password reset failed");
  }

  return await response.json();
}

// Get current user from Django
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${DJANGO_API}/api/users/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

// Server-side cookie helpers
export async function setAuthCookies(data: LoginResponse): Promise<void> {
  const cookieStore = await cookies();
  const expiresIn = data.expires_in || 2592000; // 30 days
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", data.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  cookieStore.set("refreshToken", data.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function getAuthTokens(): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("accessToken")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}
