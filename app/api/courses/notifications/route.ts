import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_ELEARNING_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Access token missing from request headers" },
        { status: 401 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "Django backend notifications error response:",
        response.status,
        errorBody,
      );
      return NextResponse.json(
        { error: "Backend service failed to respond correctly" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Serverless route gateway exception caught:", error);
    return NextResponse.json(
      { error: error.message || "Internal Serverless Gateway Error" },
      { status: 500 },
    );
  }
}
