import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await req.json();

    console.log("--- Proxy Request Body ---", body);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/payments/initiate/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    console.log("--- Django Response Status ---", response.status);
    console.log("--- Django Response Data ---", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Payment Proxy Error:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
