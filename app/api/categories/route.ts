import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/`,
      {
        cache: "no-store",
      },
    );
    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
