import { NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, confirmPassword } = body;

    const response = await fetch(
      `${AUTH_API}/auth/forgot-password/reset-password/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          new_password: password,
          confirm_password: confirmPassword,
        }),
      },
    );

    // 1. Extract the data from the response FIRST
    // We use await response.json() so the 'data' variable actually exists
    const data = await response.json().catch(() => ({}));

    // 2. Now check if the response was successful
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
