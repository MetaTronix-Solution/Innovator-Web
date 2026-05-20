import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing from session context" },
        { status: 401 },
      );
    }

    const backendUrl = "http://36.253.137.34:8004/api/products/";

    const response = await fetch(backendUrl, {
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
        {
          error: errorData.detail || "Failed to fetch products",
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    const products = Array.isArray(data) ? data : (data.results ?? []);

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error context breakdown" },
      { status: 500 },
    );
  }
}
