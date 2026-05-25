import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/categories/`,
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
      { error: "Failed to fetch categories" },
      { status: res.status },
    );
  }

  const data = await res.json();

  const results = Array.isArray(data)
    ? data
    : (data.results ?? data.categories ?? []);

  return NextResponse.json(results);
}
