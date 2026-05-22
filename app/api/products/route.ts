import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

const productsCache = new Map<string, { data: any; timestamp: number }>();
const SERVER_CACHE_TTL = 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const cacheKey = `page=${page}&limit=${limit}`;
    const cached = productsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < SERVER_CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const backendUrl = `${BASE_URL}/api/products/?page=${page}&limit=${limit}`;

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
        { error: errorData.detail || "Failed to fetch products" },
        { status: response.status },
      );
    }

    const data = await response.json();
    let resultPayload;

    if (Array.isArray(data)) {
      resultPayload = { results: data, hasMore: false };
    } else {
      resultPayload = {
        results: data.results ?? [],
        hasMore: !!data.next,
        count: data.count ?? 0,
      };
    }

    productsCache.set(cacheKey, { data: resultPayload, timestamp: Date.now() });

    return NextResponse.json(resultPayload);
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error context breakdown" },
      { status: 500 },
    );
  }
}
