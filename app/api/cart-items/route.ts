import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return token;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing from session context" },
        { status: 401 },
      );
    }

    const [cartRes, productsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/cart-items/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      }),
      fetch(`${BASE_URL}/api/products/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      }),
    ]);

    if (!cartRes.ok) {
      const errorData = await cartRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch cart items" },
        { status: cartRes.status },
      );
    }

    const cartData = await cartRes.json();
    const cartItems = Array.isArray(cartData)
      ? cartData
      : (cartData.results ?? []);

    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = Array.isArray(productsData)
        ? productsData
        : (productsData.results ?? []);

      const enriched = cartItems.map((item: any) => {
        const match = products.find((p: any) => p.id === item.product);
        return {
          ...item,
          product_image: match?.image ?? null,
        };
      });

      return NextResponse.json(enriched);
    }

    return NextResponse.json(cartItems);
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error context breakdown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing from session context" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);

    if (!body?.productId) {
      return NextResponse.json(
        { error: "Missing required field: productId" },
        { status: 400 },
      );
    }

    console.log("Cart POST body sending to backend:", {
      product: body.productId,
    });

    const response = await fetch(`${BASE_URL}/api/cart-items/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product: body.productId }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseText || "Failed to add item to cart" },
        { status: response.status },
      );
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
