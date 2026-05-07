import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(`${BACKEND_URL}/api/users/following/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch following list" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("FOLLOWING_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
