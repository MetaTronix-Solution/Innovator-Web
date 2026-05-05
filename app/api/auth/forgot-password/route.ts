import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/forgot-password/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || error.detail || "Failed to send OTP" },
        { status: 400 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: data.message || "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
