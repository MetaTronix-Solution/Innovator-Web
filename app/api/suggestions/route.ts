import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value; // Adjust based on your auth storage

    const response = await fetch(`${BACKEND_URL}/api/suggested-users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data.suggestions || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
