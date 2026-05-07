import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // 1. Retrieve the token from server-side cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // 'post' or 'reel'

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // 2. Build the query based on content type
    // Note: Added the trailing slash before '?' for Django compatibility
    const queryParam = type === "reel" ? `reel=${id}` : `post=${id}`;
    const targetUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments/?${queryParam}`;

    // 3. Fetch from backend with the Bearer token
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Only add the Authorization header if the token exists
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Django GET Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Route Error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    // Ensure these fields match what your service is sending
    const { id, content, type } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content,
          [type === "reel" ? "reel" : "post"]: id,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Django Post Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
