import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/courses/?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: res.status },
    );
  }

  const data = await res.json();

  if (Array.isArray(data)) {
    return NextResponse.json({ results: data, hasMore: false });
  }

  const results = data.results ?? data.courses ?? [];
  const hasMore = !!data.next;

  return NextResponse.json({ results, hasMore });
}
