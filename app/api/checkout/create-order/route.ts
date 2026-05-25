import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(`${BASE_URL}/checkout/create-order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: body.product }),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!isJson) {
      const errorText = await response.text();
      console.error("[PROXY_ERROR] Backend returned non-JSON:", errorText);
      return NextResponse.json(
        { error: "Backend communication error" },
        { status: response.status || 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[PROXY_ERROR] Catch block:", error);
    return NextResponse.json({ error: "Gateway error" }, { status: 502 });
  }
}
