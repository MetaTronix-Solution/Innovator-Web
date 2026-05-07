import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    // 1. Get the cookie using the name from your login route
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No session found. Please login again." },
        { status: 401 },
      );
    }

    const { caption } = await request.json().catch(() => ({}));

    // 2. Use the Social Media Backend URL (Port 8005)
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${postId}/repost/`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the token retrieved from the accessToken cookie
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ caption }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to repost" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("REPOST_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
