import { NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, password, confirmPassword } = body;

    const response = await fetch(
      `${AUTH_API}/auth/forgot-password/reset-password/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));
    console.log("Django response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || "Failed to reset password." },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
