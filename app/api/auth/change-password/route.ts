import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${AUTH_API}/auth/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // 1. Check if the response is actually JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      // If it's not JSON, we get the text instead to avoid the crash
      const errorText = await response.text();
      console.error("Backend Error (Non-JSON):", errorText);
      return NextResponse.json(
        { error: "Backend error occurred" },
        { status: response.status },
      );
    }

    // 2. Only parse JSON if we know it's JSON
    const data = isJson ? await response.json() : await response.text();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
