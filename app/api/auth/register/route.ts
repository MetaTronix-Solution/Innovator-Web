import { NextRequest, NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, username, phone_no, dob, gender } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${AUTH_API}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: name,
        username: username || email.split("@")[0],
        phone_no,
        dob,
        gender,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || error.detail || "Registration failed" },
        { status: 400 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: data.message || "Registration successful",
      user: data.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
