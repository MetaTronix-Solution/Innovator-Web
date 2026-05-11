import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }, // ← Promise type
) {
  const { id } = await params; // ← await it

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Follow URL:", `${BACKEND_URL}/api/users/${id}/follow/`);

    const res = await fetch(`${BACKEND_URL}/api/users/${id}/follow/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Follow/Unfollow response:", res.status);
    const data = await res.json().catch(() => ({}));
    console.log("Follow/Unfollow data:", data);
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Follow error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
