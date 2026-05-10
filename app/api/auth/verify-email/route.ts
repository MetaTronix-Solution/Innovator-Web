import { NextResponse } from "next/server";

const AUTH_API = process.env.AUTH_URL as string;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${AUTH_API}/auth/verify-email/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Invalid or expired OTP" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Email verified successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
