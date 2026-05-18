import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: NextRequest) {
  // 1. Get '?q=' from the frontend URL
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = `${BASE_URL}/api/users/?full_name=${encodeURIComponent(query.trim())}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch search results from backend" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Handle either direct array or standard paginated results array
    const usersList = Array.isArray(data) ? data : data.results || [];

    return NextResponse.json(usersList);
  } catch (error) {
    console.error("Backend search fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
