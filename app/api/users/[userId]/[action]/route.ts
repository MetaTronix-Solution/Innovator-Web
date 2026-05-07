// src/app/api/users/[userId]/[action]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string; action: string }> },
) {
  try {
    const { userId, action } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/${action}/`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || `Backend failed to ${action}` },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, action, data });
  } catch (error: any) {
    console.error("FOLLOW_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
