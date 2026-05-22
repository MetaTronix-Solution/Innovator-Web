import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/users/mutual-friends/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch mutual friends" },
        { status: res.status },
      );
    }

    const data = await res.json();

    const mutualUsers = (data.mutual_friends ?? []).map((u: any) => ({
      id: String(u.id),
      username: u.username ?? "",
      full_name: u.full_name ?? "",
      avatar: u.avatar ?? null,
      online_status: u.online_status ?? false,
    }));

    return NextResponse.json(mutualUsers);
  } catch (error) {
    console.error("Failed to fetch mutual friends:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
