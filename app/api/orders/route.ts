import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(`${BASE_URL}/api/orders/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid response from backend" },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[PROXY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 502 },
    );
  }
}
