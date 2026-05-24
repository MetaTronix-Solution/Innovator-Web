import { NextRequest, NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${AUTH_API}/auth/forgot-password/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || error.detail || "Invalid OTP" },
        { status: 400 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: data.message || "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Invalid OTP" }, { status: 500 });
  }
}
