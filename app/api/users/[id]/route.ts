import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Unwrap params for Next.js 15
  const { id } = await params;
  console.log(id);

  // 2. Validate ID to prevent "undefined" or null requests
  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
  }

  // 3. Get the access token from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = `${BASE_URL}/api/users/${id}/`;

    // 4. Perform the fetch to your Django/Backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Use the token extracted from the cookies
        Authorization: `Bearer ${accessToken}`,
      },
      // Optional: Add cache rules
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      // Pass through the status from backend (404, 403, etc)
      return NextResponse.json(
        { error: "User not found or access denied" },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
