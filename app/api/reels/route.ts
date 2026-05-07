import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// GET: Fetch all reels
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/reels/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // or 'force-cache' for caching
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reels" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST: Create a new reel
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/reels/`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create reel" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
