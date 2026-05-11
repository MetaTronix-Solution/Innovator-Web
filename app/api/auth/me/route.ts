import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  // console.log("All cookies received:", allCookies); // ← add this

  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await response.json();
    // console.log("Django user returned:", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Fetch error:", error); // ← network error
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
