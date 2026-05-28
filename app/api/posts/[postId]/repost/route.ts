import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No session found. Please login again." },
        { status: 401 },
      );
    }

    const { content } = await request.json().catch(() => ({}));

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${postId}/repost/`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
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
