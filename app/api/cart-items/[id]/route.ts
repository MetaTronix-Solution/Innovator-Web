import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function PATCH(
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

    const body = await req.json().catch(() => null);
    if (body?.quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required field: quantity" },
        { status: 400 },
      );
    }

    console.log(`PATCH cart-item: ${id} quantity: ${body.quantity}`);

    const response = await fetch(`${BASE_URL}/api/cart-items/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: body.quantity }),
    });

    const responseText = await response.text();
    console.log("PATCH cart response:", response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: responseText || "Failed to update cart item" },
        { status: response.status },
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    console.log(`DELETE cart-item: ${id}`);

    const response = await fetch(`${BASE_URL}/api/cart-items/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("DELETE cart response:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Failed to delete cart item" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Upstream server middleware proxy failure:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
