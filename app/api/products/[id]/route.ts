import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing from session context" },
        { status: 401 },
      );
    }

    const response = await fetch(`${BASE_URL}/api/products/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch product" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error context breakdown" },
      { status: 500 },
    );
  }
}
