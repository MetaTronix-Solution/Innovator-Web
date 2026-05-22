import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LoginResponse } from "@/types/auth";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${AUTH_API}/auth/sso/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || error.detail || "Login failed" },
        { status: 401 },
      );
    }

    const data: LoginResponse = await response.json();

    const cookieStore = await cookies();
    const expiresIn = data.expires_in || 2592000;
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    cookieStore.set("refreshToken", data.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: data.user,
      token_type: data.token_type,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
